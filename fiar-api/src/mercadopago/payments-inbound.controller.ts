import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { verifySignature } from 'prizma-contracts';
import {
  PaymentsInboundService,
  HubPaymentPayload,
} from './payments-inbound.service';

/**
 * Webhook INBOUND que el Hub (Nous) invoca tras recibir y verificar la
 * notificación de Mercado Pago y determinar que el externalReference pertenece
 * a pistis (prefijo `pistis:`).
 *
 * Contrato (igual al de Hermes / Talanton):
 *   POST /api/webhooks/payments
 *   headers: x-prizma-signature  — HMAC-SHA256(body, NOUS_HUB_SECRET)
 *            x-prizma-event      — eventType canónico (opcional, se lee del body)
 *            x-idempotency-key   — clave de idempotencia del Hub (opcional)
 *   body: HubPaymentPayload (JSON)
 *
 * Seguridad (fail-closed):
 *   Si NOUS_HUB_SECRET está configurado → firma obligatoria; sin firma válida = 401.
 *   Si NOUS_HUB_SECRET NO está configurado → modo degradado (advierte, procesa igual).
 *
 * Respuesta siempre 200 para que el Hub no reintente indefinidamente un evento
 * genuinamente rechazado (firma inválida retorna { ok: false } con 200).
 */
@Controller('api/webhooks')
export class PaymentsInboundController {
  private readonly logger = new Logger(PaymentsInboundController.name);

  private get hubSecret(): string | undefined {
    return process.env.NOUS_HUB_SECRET ?? undefined;
  }

  constructor(private readonly inbound: PaymentsInboundService) {}

  @Post('payments')
  @HttpCode(200)
  async handle(
    @Body() body: HubPaymentPayload,
    @Headers('x-prizma-signature') signature?: string,
    @Headers('x-prizma-event') prizmaEvent?: string,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    // ── Verificación HMAC ─────────────────────────────────────────────────
    const secret = this.hubSecret;
    if (secret) {
      if (!verifySignature(body, signature, secret)) {
        this.logger.warn(
          'Webhook payments (pistis): firma x-prizma-signature ausente o inválida — rechazado',
        );
        // Devolvemos objeto (no excepción) con 200 para que el Hub no reintente.
        // Un atacante no recibirá info útil; el Hub sí sabe que falló la firma.
        return { ok: false, reason: 'invalid_signature' };
      }
    } else {
      this.logger.warn(
        'NOUS_HUB_SECRET no configurado — webhook procesado SIN verificar firma (modo degradado)',
      );
    }

    // Leer eventType desde body o header
    const eventType = (body?.eventType ?? prizmaEvent) as string | undefined;

    if (!eventType) {
      this.logger.warn('Webhook payments recibido sin eventType — ignorado');
      return { ok: false, reason: 'eventType ausente' };
    }

    this.logger.log(
      `Hub payment event: eventType=${eventType}` +
        ` idempotencyKey=${idempotencyKey ?? 'none'}` +
        ` ref=${body?.externalReference ?? 'none'}`,
    );

    return this.inbound.handle(body);
  }
}
