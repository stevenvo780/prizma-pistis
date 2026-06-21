import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Res,
  HttpStatus,
  Get,
  Logger,
  Param,
} from '@nestjs/common';
import crypto from 'crypto';
import { MercadoPagoService } from './mercadopago.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';
import { RequestWithUser } from '@/auth/types';
import { MercadoPagoPaymentDto } from './dto/mercadopago-payment.dto';
import { Request, Response } from 'express';

@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * POST /mercadopago/subscribe
   * Crea una suscripción recurrente en Mercado Pago y retorna la URL de checkout.
   * MP se encarga de cobrar automáticamente según la periodicidad elegida.
   */
  @Post('subscribe')
  @UseGuards(FirebaseAuthGuard)
  async subscribe(
    @Req() req: RequestWithUser,
    @Body() paymentData: MercadoPagoPaymentDto,
  ) {
    try {
      const result = await this.mercadoPagoService.createSubscription({
        userId: req.user.id,
        email: req.user.email,
        planType: paymentData.planType,
        frequency: paymentData.frequency,
      });

      return {
        success: true,
        ...result,
        message:
          'Suscripción recurrente creada. Redirige al usuario a init_point.',
      };
    } catch (error) {
      this.logger.error(
        'Error creando suscripción:',
        JSON.stringify(error.response || error.message, null, 2),
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        message: 'Error creando la suscripción recurrente',
        details: error.message || 'Error desconocido',
      });
    }
  }

  /**
   * GET /mercadopago/subscription-info
   * Consulta el estado de la suscripción recurrente del usuario autenticado.
   */
  @Get('subscription-info')
  @UseGuards(FirebaseAuthGuard)
  async getSubscriptionInfo(@Req() req: RequestWithUser) {
    return this.mercadoPagoService.getSubscriptionInfo(req.user.id);
  }

  /**
   * GET /mercadopago/payment-status/:paymentId
   * Consulta el estado de un pago individual del usuario autenticado.
   * Requiere auth y valida que el pago pertenezca al usuario (vía
   * external_reference) para no filtrar planType/frequency de terceros.
   */
  @Get('payment-status/:paymentId')
  @UseGuards(FirebaseAuthGuard)
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.mercadoPagoService.getPaymentStatus(paymentId, req.user.id);
  }

  /**
   * POST /mercadopago/cancel-subscription
   * Cancela la suscripción recurrente en MP y baja al plan FREE.
   */
  @Post('cancel-subscription')
  @UseGuards(FirebaseAuthGuard)
  cancelSubscription(@Req() req: RequestWithUser) {
    return this.mercadoPagoService.cancelSubscription(req.user.id);
  }

  /**
   * GET /mercadopago/cancel-subscription
   * Alias GET para compatibilidad con el frontend existente.
   */
  @Get('cancel-subscription')
  @UseGuards(FirebaseAuthGuard)
  cancelSubscriptionGet(@Req() req: RequestWithUser) {
    return this.mercadoPagoService.cancelSubscription(req.user.id);
  }

  /**
   * POST /mercadopago/pause-subscription
   * Pausa la suscripción recurrente (se puede reactivar después).
   */
  @Post('pause-subscription')
  @UseGuards(FirebaseAuthGuard)
  pauseSubscription(@Req() req: RequestWithUser) {
    return this.mercadoPagoService.pauseSubscription(req.user.id);
  }

  /**
   * POST /mercadopago/sync-subscription
   * Consulta directamente a la API de MercadoPago el estado de la suscripción
   * y activa/desactiva el plan según corresponda.
   * Esto permite que el flujo funcione end-to-end sin depender del webhook
   * (útil en sandbox donde MP no envía webhooks, y como fallback en producción).
   */
  @Post('sync-subscription')
  @UseGuards(FirebaseAuthGuard)
  syncSubscription(@Req() req: RequestWithUser) {
    return this.mercadoPagoService.syncSubscription(req.user.id);
  }

  /**
   * Verifica la firma `x-signature` del webhook de Mercado Pago (esquema ts+v1).
   *
   * MP firma el manifest `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
   * con HMAC-SHA256 usando MP_WEBHOOK_SECRET. La comparación es time-safe.
   *
   * Fail-closed:
   *   - Si MP_WEBHOOK_SECRET está configurado → firma obligatoria y válida.
   *   - Si NO está configurado y NODE_ENV === 'production' → se rechaza (no se
   *     procesa) para no acreditar pagos sin verificar.
   *   - Si NO está configurado fuera de producción → se permite (modo dev) con
   *     advertencia.
   */
  private verifyMpSignature(req: Request): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(
          'MP_WEBHOOK_SECRET no configurado en producción — webhook MP rechazado (fail-closed)',
        );
        return false;
      }
      this.logger.warn(
        'MP_WEBHOOK_SECRET no configurado — verificación de firma omitida (solo dev)',
      );
      return true;
    }

    const signatureHeader = req.headers['x-signature'] as string | undefined;
    const requestId = req.headers['x-request-id'] as string | undefined;
    if (!signatureHeader) {
      this.logger.warn('Webhook MP sin header x-signature — rechazado');
      return false;
    }

    // x-signature: "ts=<unix>,v1=<hmac-hex>"
    const parts = signatureHeader
      .split(',')
      .reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});
    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) {
      this.logger.warn('Webhook MP con x-signature malformado — rechazado');
      return false;
    }

    // data.id puede venir por query (?data.id=) o en el body.
    const dataId =
      (req.query['data.id'] as string | undefined) ??
      (req.body?.data?.id != null ? String(req.body.data.id) : undefined);

    // Manifest según docs MP. request-id es opcional (se omite si no llega).
    let manifest = '';
    if (dataId) manifest += `id:${dataId};`;
    if (requestId) manifest += `request-id:${requestId};`;
    manifest += `ts:${ts};`;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const a = Buffer.from(expected);
    const b = Buffer.from(v1);
    if (a.length !== b.length) {
      this.logger.warn('Webhook MP con firma inválida (longitud) — rechazado');
      return false;
    }
    const valid = crypto.timingSafeEqual(a, b);
    if (!valid) {
      this.logger.warn('Webhook MP con firma inválida — rechazado');
    }
    return valid;
  }

  /**
   * POST /mercadopago/webhook
   * Recibe notificaciones de Mercado Pago (pagos y suscripciones).
   */
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      // Fail-closed: validar firma antes de procesar cualquier evento.
      if (!this.verifyMpSignature(req)) {
        // 200 para que MP no reintente indefinidamente un evento no autorizado.
        return res
          .status(200)
          .json({ success: false, reason: 'invalid_signature' });
      }

      const payload = req.body;
      this.logger.log('Webhook MP recibido:', JSON.stringify(payload));

      const result = await this.mercadoPagoService.handleWebhookEvent(payload);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error procesando webhook',
        details: error.message,
      });
    }
  }
}
