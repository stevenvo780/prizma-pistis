import { Injectable, Logger } from '@nestjs/common';
import {
  HubClient,
  EVENTS,
  validateEvent,
  type EventEnvelope,
  type PublishOptions,
} from '@olympo/contracts';

/**
 * Olympo HubCentral integration for Fiar (credit / cartera backend).
 *
 * Fiar is the SSOT of credit, debt and quota, so it is the OWNER (emitter) of
 * these events (see ARCHITECTURE.md §4 flow 4 and §5):
 *   - CREDIT_CHECK       (credit.check)     — a credit eligibility check ran.
 *   - CREDIT_APPROVED    (credit.approved)  — a credit line / quota was granted.
 *   - PAYMENT_RECEIVED   (payment.received) — a customer paid down their debt.
 *
 * Consumed downstream by EMW (WhatsApp notifications) and read by Graf / Sinergia.
 *
 * The underlying HubClient is fault-tolerant by design: a failed publish never
 * throws into business logic (connectors are optional, principle §2). Every
 * helper here is therefore safe to `await` inline without try/catch.
 */
@Injectable()
export class OlympoHubService {
  private readonly logger = new Logger(OlympoHubService.name);

  private readonly client = new HubClient({
    source: 'fiar',
    hubUrl: process.env.CAUCE_HUB_URL,
    secret: process.env.CAUCE_HUB_SECRET,
    // throwOnError stays false: never break the local credit/payment flow.
  });

  /** Whether the connector is enabled (opt-in via env, default on). */
  private get enabled(): boolean {
    return process.env.CAUCE_HUB_ENABLED !== 'false';
  }

  /**
   * Low-level publish. Validates the payload against the contract schema
   * (best-effort) and forwards to HubCentral. Returns true on success.
   */
  async publish(
    eventType: string,
    data: Record<string, unknown>,
    options: PublishOptions = {},
  ): Promise<boolean> {
    if (!this.enabled) return false;

    // Best-effort local validation so we don't emit obviously-broken events.
    const probe = validateEvent({
      eventType,
      data,
      eventId: '',
      timestamp: '',
      source: 'fiar',
      priority: 'normal',
    } as EventEnvelope);
    if (!probe.ok) {
      const reason = (probe as { error: string }).error;
      this.logger.warn(
        `[cauce] skipping invalid "${eventType}" event: ${reason}`,
      );
      return false;
    }

    try {
      return await this.client.publish(eventType, data, options);
    } catch (err) {
      // Defensive: HubClient already swallows network errors, but never let an
      // unexpected throw bubble into the business transaction.
      this.logger.warn(
        `[cauce] publish "${eventType}" failed (non-fatal): ${
          (err as Error).message
        }`,
      );
      return false;
    }
  }

  // --- Fiar-owned event helpers -------------------------------------------

  /**
   * Flow 4 — a credit eligibility check was run for a customer.
   * Emitted before granting/denying a drawdown against the customer's quota.
   */
  creditCheck(data: {
    customer: { id?: string; name?: string; phone?: string; email?: string };
    amount: number;
  }): Promise<boolean> {
    return this.publish(EVENTS.CREDIT_CHECK, data);
  }

  /**
   * Flow 4 — a credit line / quota was approved for a customer.
   * Consumed by EMW (WhatsApp), read by Graf / Sinergia.
   */
  creditApproved(data: {
    creditId: string;
    customer: { id?: string; name?: string; phone?: string; email?: string };
    limit: number;
  }): Promise<boolean> {
    return this.publish(EVENTS.CREDIT_APPROVED, data, { priority: 'high' });
  }

  /**
   * Flow 4 — a payment was received against a customer's debt.
   * Consumed by EMW (WhatsApp receipt/notification).
   */
  paymentReceived(data: {
    paymentId: string;
    creditId?: string;
    amount: number;
  }): Promise<boolean> {
    return this.publish(EVENTS.PAYMENT_RECEIVED, data, { priority: 'high' });
  }
}
