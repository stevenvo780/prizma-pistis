/**
 * Tests unitarios del puente Hub→Pistis:
 *   1. Verificación HMAC (verifySignature / signPayload de prizma-contracts).
 *   2. PaymentsInboundController — ruteo con y sin firma válida.
 *   3. PaymentsInboundService — lógica de negocio por eventType.
 *   4. MercadoPagoService.parseExternalReference — ambos formatos.
 */
import { createHmac } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

// ── Utilidades de firma (inline para no depender de la lib compilada) ────────

function signPayload(payload: unknown, secret: string): string {
  const body =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

function verifySignature(
  payload: unknown,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = signPayload(payload, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return require('node:crypto').timingSafeEqual(a, b);
}

// ── 1. HMAC verify ───────────────────────────────────────────────────────────

describe('HMAC signPayload / verifySignature', () => {
  const SECRET = 'test-secret-hub';
  const PAYLOAD = { eventType: 'pago.aprobado', mpPaymentId: '123456' };

  it('genera firma sha256=<hex>', () => {
    const sig = signPayload(PAYLOAD, SECRET);
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it('verifica firma correcta', () => {
    const sig = signPayload(PAYLOAD, SECRET);
    expect(verifySignature(PAYLOAD, sig, SECRET)).toBe(true);
  });

  it('rechaza firma incorrecta', () => {
    expect(verifySignature(PAYLOAD, 'sha256=badfeed', SECRET)).toBe(false);
  });

  it('rechaza firma undefined', () => {
    expect(verifySignature(PAYLOAD, undefined, SECRET)).toBe(false);
  });

  it('rechaza firma con secreto equivocado', () => {
    const sig = signPayload(PAYLOAD, SECRET);
    expect(verifySignature(PAYLOAD, sig, 'otro-secret')).toBe(false);
  });

  it('payload modificado invalida firma', () => {
    const sig = signPayload(PAYLOAD, SECRET);
    const tampered = { ...PAYLOAD, mpPaymentId: '999999' };
    expect(verifySignature(tampered, sig, SECRET)).toBe(false);
  });
});

// ── 2. parseExternalReference — ambos formatos ───────────────────────────────

describe('MercadoPagoService.parseExternalReference', () => {
  // Importamos solo lo que necesitamos; mockeamos dependencias pesadas.
  let parseRef: (ref: string) => {
    userId: string;
    planType: string;
    frequency: string;
  } | null;

  beforeAll(() => {
    // Instanciamos el método estáticamente sin el módulo completo de NestJS.
    // La función es pura, no necesita el contexto de DI.
    const { MercadoPagoService } = jest.requireActual('./mercadopago.service');
    // Creamos un stub mínimo para acceder al método
    const stub = Object.create(MercadoPagoService.prototype) as any;
    parseRef = (ref: string) => stub.parseExternalReference(ref);
  });

  it('parsea formato Hub: pistis:plan:uid:BASIC:MONTHLY', () => {
    const result = parseRef('pistis:plan:user-42:BASIC:MONTHLY');
    expect(result).toEqual({
      userId: 'user-42',
      planType: 'BASIC',
      frequency: 'MONTHLY',
    });
  });

  it('parsea formato Hub con frequency ANNUALLY', () => {
    const result = parseRef('pistis:plan:abc-123:PRO:ANNUALLY');
    expect(result).toEqual({
      userId: 'abc-123',
      planType: 'PRO',
      frequency: 'ANNUALLY',
    });
  });

  it('parsea formato legacy: userId|planType|frequency', () => {
    const result = parseRef('user-99|ENTERPRISE|MONTHLY');
    expect(result).toEqual({
      userId: 'user-99',
      planType: 'ENTERPRISE',
      frequency: 'MONTHLY',
    });
  });

  it('retorna null si formato Hub es incompleto', () => {
    expect(parseRef('pistis:plan:uid')).toBeNull();
  });

  it('retorna null si formato legacy es incompleto', () => {
    expect(parseRef('solo-un-campo')).toBeNull();
  });

  it('retorna null para string vacío', () => {
    expect(parseRef('')).toBeNull();
  });
});

// ── 3. PaymentsInboundController — verificación y ruteo ─────────────────────

describe('PaymentsInboundController', () => {
  const SECRET = 'hub-secret-test';
  let controller: any;
  let inboundService: any;

  beforeEach(async () => {
    // Mock del servicio inbound
    inboundService = {
      handle: jest.fn().mockResolvedValue({ ok: true, handled: 'plan_activated' }),
    };

    // Importar el controller real
    const { PaymentsInboundController } = await import('./payments-inbound.controller');

    // Instanciar manualmente (sin módulo NestJS completo)
    controller = new PaymentsInboundController(inboundService);

    // Silenciar logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NOUS_HUB_SECRET;
  });

  it('procesa evento con firma válida cuando NOUS_HUB_SECRET está configurado', async () => {
    process.env.NOUS_HUB_SECRET = SECRET;
    const body = {
      eventType: 'suscripcion.activada',
      externalReference: 'pistis:plan:user-1:BASIC:MONTHLY',
      mpPreapprovalId: 'pre-001',
    };
    const sig = signPayload(body, SECRET);

    const result = await controller.handle(body, sig, undefined, undefined);
    expect(result).toMatchObject({ ok: true });
    expect(inboundService.handle).toHaveBeenCalledWith(body);
  });

  it('rechaza evento con firma inválida (retorna ok: false, no lanza)', async () => {
    process.env.NOUS_HUB_SECRET = SECRET;
    const body = {
      eventType: 'pago.aprobado',
      externalReference: 'pistis:plan:user-2:PRO:ANNUALLY',
    };

    const result = await controller.handle(
      body,
      'sha256=badfirmainvalida00000000',
      undefined,
      undefined,
    );
    expect(result).toEqual({ ok: false, reason: 'invalid_signature' });
    expect(inboundService.handle).not.toHaveBeenCalled();
  });

  it('procesa en modo degradado si NOUS_HUB_SECRET no está configurado', async () => {
    // NOUS_HUB_SECRET no seteado
    const body = {
      eventType: 'suscripcion.cancelada',
      externalReference: 'pistis:plan:user-3:BASIC:MONTHLY',
    };

    const result = await controller.handle(body, undefined, undefined, undefined);
    expect(result).toMatchObject({ ok: true });
    expect(inboundService.handle).toHaveBeenCalledWith(body);
  });

  it('retorna ok: false si el body no tiene eventType', async () => {
    process.env.NOUS_HUB_SECRET = SECRET;
    const body: any = { externalReference: 'pistis:plan:user-4:FREE:MONTHLY' };
    const sig = signPayload(body, SECRET);

    const result = await controller.handle(body, sig, undefined, undefined);
    expect(result).toEqual({ ok: false, reason: 'eventType ausente' });
  });
});

// ── 4. PaymentsInboundService — lógica de negocio ───────────────────────────

describe('PaymentsInboundService', () => {
  let service: any;
  let mpService: any;

  beforeEach(async () => {
    mpService = {
      parseExternalReference: jest.fn(),
      confirmPaymentSubscription: jest.fn().mockResolvedValue(undefined),
      activatePlanFromHub: jest.fn().mockResolvedValue(undefined),
      cancelSubscription: jest.fn().mockResolvedValue({}),
    };

    const { PaymentsInboundService } = await import('./payments-inbound.service');
    service = new PaymentsInboundService(mpService as any);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('ignora referencia inválida', async () => {
    mpService.parseExternalReference.mockReturnValue(null);
    const result = await service.handle({
      eventType: 'pago.aprobado',
      externalReference: 'bad-ref',
    });
    expect(result).toEqual({ ok: false, handled: 'invalid_reference' });
  });

  it('ignora referencia de otro producto', async () => {
    mpService.parseExternalReference.mockReturnValue({
      userId: 'u1',
      planType: 'BASIC',
      frequency: 'MONTHLY',
    });
    const result = await service.handle({
      eventType: 'pago.aprobado',
      externalReference: 'hermes:order:99',
    });
    expect(result).toEqual({ ok: false, handled: 'foreign_product' });
  });

  it('pago.aprobado sin mpPaymentId retorna missing_payment_id', async () => {
    mpService.parseExternalReference.mockReturnValue({
      userId: 'u1',
      planType: 'BASIC',
      frequency: 'MONTHLY',
    });
    const result = await service.handle({
      eventType: 'pago.aprobado',
      externalReference: 'pistis:plan:u1:BASIC:MONTHLY',
      // mpPaymentId ausente
    });
    expect(result).toEqual({ ok: false, handled: 'missing_payment_id' });
  });

  it('pago.aprobado con mpPaymentId llama confirmPaymentSubscription (idempotencia)', async () => {
    const ref = { userId: 'u-42', planType: 'PRO', frequency: 'ANNUALLY' };
    mpService.parseExternalReference.mockReturnValue(ref);

    const result = await service.handle({
      eventType: 'pago.aprobado',
      externalReference: 'pistis:plan:u-42:PRO:ANNUALLY',
      mpPaymentId: 'pay-999',
    });

    expect(mpService.confirmPaymentSubscription).toHaveBeenCalledWith(
      ref,
      'pay-999',
    );
    expect(result).toEqual({ ok: true, handled: 'subscription_payment_confirmed' });
  });

  it('suscripcion.activada llama activatePlanFromHub', async () => {
    const ref = { userId: 'u-5', planType: 'BASIC', frequency: 'MONTHLY' };
    mpService.parseExternalReference.mockReturnValue(ref);

    const result = await service.handle({
      eventType: 'suscripcion.activada',
      externalReference: 'pistis:plan:u-5:BASIC:MONTHLY',
    });

    expect(mpService.activatePlanFromHub).toHaveBeenCalledWith('u-5', 'BASIC');
    expect(result).toEqual({ ok: true, handled: 'plan_activated' });
  });

  it('suscripcion.cancelada llama cancelSubscription', async () => {
    const ref = { userId: 'u-6', planType: 'PRO', frequency: 'MONTHLY' };
    mpService.parseExternalReference.mockReturnValue(ref);

    const result = await service.handle({
      eventType: 'suscripcion.cancelada',
      externalReference: 'pistis:plan:u-6:PRO:MONTHLY',
    });

    expect(mpService.cancelSubscription).toHaveBeenCalledWith('u-6');
    expect(result).toEqual({ ok: true, handled: 'plan_cancelled' });
  });

  it('pago.rechazado loguea y retorna ok: true (sin cancelar)', async () => {
    const ref = { userId: 'u-7', planType: 'BASIC', frequency: 'MONTHLY' };
    mpService.parseExternalReference.mockReturnValue(ref);

    const result = await service.handle({
      eventType: 'pago.rechazado',
      externalReference: 'pistis:plan:u-7:BASIC:MONTHLY',
      motivo: 'fondos insuficientes',
    });

    expect(mpService.cancelSubscription).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, handled: 'payment_rejected_logged' });
  });

  it('eventType desconocido retorna unknown_event', async () => {
    const ref = { userId: 'u-8', planType: 'FREE', frequency: 'MONTHLY' };
    mpService.parseExternalReference.mockReturnValue(ref);

    const result = await service.handle({
      eventType: 'evento.raro',
      externalReference: 'pistis:plan:u-8:FREE:MONTHLY',
    });

    expect(result).toEqual({ ok: false, handled: 'unknown_event' });
  });
});
