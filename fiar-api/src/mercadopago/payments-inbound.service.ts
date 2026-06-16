import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { PlanType } from '../user/entities/subscription.entity';
import { PaymentFrequency } from '../common/entities/payment-source.entity';

/**
 * Payload normalizado que el Hub (Nous) envía a pistis cuando ocurre un
 * evento de pago o suscripción cuyo externalReference tiene el prefijo
 * `pistis:`.
 *
 * Contrato idéntico al de Hermes / Talanton (PAYMENTS_MIGRATION.md apéndice):
 *   POST /api/webhooks/payments
 *   headers: x-prizma-signature, x-prizma-event, x-idempotency-key
 */
export interface HubPaymentPayload {
  /** Tipo de evento canónico: pago.aprobado / suscripcion.activada / etc. */
  eventType: string;
  /** `pistis:plan:<userId>:<planType>:<frequency>` */
  externalReference?: string;
  /** ID del pago en MP (para idempotencia en pago.aprobado) */
  mpPaymentId?: string;
  mpPreapprovalId?: string;
  monto?: number;
  moneda?: string;
  motivo?: string;
  status?: string;
  [key: string]: unknown;
}

interface ParsedRef {
  userId: string;
  planType: PlanType;
  frequency: PaymentFrequency;
}

/**
 * Procesa los eventos `pago.*` / `suscripcion.*` que el Hub reenvía tras
 * recibir y verificar la notificación de Mercado Pago.
 *
 * Pistis no habla directamente con la pasarela en estos eventos: el Hub ya
 * consultó el estado real y lo normalizó. Pistis solo reacciona.
 */
@Injectable()
export class PaymentsInboundService {
  private readonly logger = new Logger(PaymentsInboundService.name);

  constructor(private readonly mpService: MercadoPagoService) {}

  /** Parsea `pistis:plan:<userId>:<planType>:<frequency>` */
  private parseRef(ref?: string): ParsedRef | null {
    if (!ref) return null;
    return this.mpService.parseExternalReference(ref);
  }

  async handle(
    payload: HubPaymentPayload,
  ): Promise<{ ok: boolean; handled: string }> {
    const ref = this.parseRef(payload.externalReference);

    if (!ref) {
      this.logger.warn(
        `externalReference inválido o ausente: "${payload.externalReference}"; ` +
          `evento ${payload.eventType} ignorado`,
      );
      return { ok: false, handled: 'invalid_reference' };
    }

    // Guard: solo procesamos referencias que pertenezcan a pistis
    if (
      payload.externalReference &&
      !payload.externalReference.startsWith('pistis:')
    ) {
      this.logger.warn(
        `externalReference de otro producto: "${payload.externalReference}"; ignorado`,
      );
      return { ok: false, handled: 'foreign_product' };
    }

    switch (payload.eventType) {
      case 'pago.aprobado':
        return this.onPaymentApproved(ref, payload);
      case 'pago.rechazado':
        return this.onPaymentRejected(ref, payload.motivo);
      case 'suscripcion.activada':
        return this.onSubscriptionActivated(ref);
      case 'suscripcion.cancelada':
        return this.onSubscriptionCancelled(ref);
      default:
        this.logger.warn(`eventType desconocido: "${payload.eventType}"`);
        return { ok: false, handled: 'unknown_event' };
    }
  }

  /**
   * Un cobro recurrente fue aprobado.
   *
   * Idempotencia: `confirmPaymentSubscription` en `MercadoPagoService` ya
   * guarda el `payment.id` cifrado y omite re-procesamiento si existe.
   * Aquí también aceptamos `mpPaymentId` enviado por el Hub.
   */
  private async onPaymentApproved(
    ref: ParsedRef,
    payload: HubPaymentPayload,
  ): Promise<{ ok: boolean; handled: string }> {
    const paymentId = payload.mpPaymentId ?? String(payload.mpPaymentId ?? '');

    if (!paymentId) {
      this.logger.warn(
        `pago.aprobado sin mpPaymentId para usuario ${ref.userId} — ignorado`,
      );
      return { ok: false, handled: 'missing_payment_id' };
    }

    try {
      // Delegar a MercadoPagoService para reutilizar idempotencia y lógica
      // de activación de plan (confirmPaymentSubscription).
      await (this.mpService as any).confirmPaymentSubscription(ref, paymentId);
      this.logger.log(
        `pago.aprobado procesado: usuario=${ref.userId} plan=${ref.planType} ` +
          `freq=${ref.frequency} paymentId=${paymentId}`,
      );
      return { ok: true, handled: 'subscription_payment_confirmed' };
    } catch (err: any) {
      this.logger.error(
        `Error confirmando pago ${paymentId} para usuario ${ref.userId}: ${err?.message}`,
      );
      return { ok: false, handled: 'confirm_error' };
    }
  }

  private onPaymentRejected(
    ref: ParsedRef,
    motivo?: string,
  ): Promise<{ ok: boolean; handled: string }> {
    this.logger.warn(
      `pago.rechazado para usuario ${ref.userId}: ${motivo ?? 'sin motivo'}`,
    );
    // No se cancela la suscripción; el usuario puede reintentar el pago.
    return Promise.resolve({ ok: true, handled: 'payment_rejected_logged' });
  }

  private async onSubscriptionActivated(
    ref: ParsedRef,
  ): Promise<{ ok: boolean; handled: string }> {
    try {
      await this.mpService.activatePlanFromHub(ref.userId, ref.planType);
      this.logger.log(
        `suscripcion.activada: plan ${ref.planType} activado para usuario ${ref.userId}`,
      );
      return { ok: true, handled: 'plan_activated' };
    } catch (err: any) {
      this.logger.error(
        `Error activando plan ${ref.planType} para usuario ${ref.userId}: ${err?.message}`,
      );
      return { ok: false, handled: 'activation_error' };
    }
  }

  private async onSubscriptionCancelled(
    ref: ParsedRef,
  ): Promise<{ ok: boolean; handled: string }> {
    try {
      await this.mpService.cancelSubscription(ref.userId);
      this.logger.log(
        `suscripcion.cancelada: plan bajado a FREE para usuario ${ref.userId}`,
      );
      return { ok: true, handled: 'plan_cancelled' };
    } catch (err: any) {
      this.logger.error(
        `Error cancelando suscripción para usuario ${ref.userId}: ${err?.message}`,
      );
      return { ok: false, handled: 'cancel_error' };
    }
  }
}
