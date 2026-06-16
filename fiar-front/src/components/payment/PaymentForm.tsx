import React, { useState, useEffect } from "react";
import { Button, Modal, Spinner, Segmented, Badge } from "prizma-ui";
import usePayments from '@store/payments';
import useUser from '@store/user';
import useUI from '@store/ui';
import { UserRoleOptions, PaymentPeriodicity } from '@utils/types';
import { FaShieldAlt, FaLock } from 'react-icons/fa';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { TbStarFilled } from 'react-icons/tb';

interface PaymentFormProps {
  planTitle?: string;
  planPrice?: string;
  defaultBillingCycle?: 'MONTHLY' | 'ANNUAL';
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
  onCancelSubscription?: () => void;
}

const overlay: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 9999,
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  planTitle = "Plan Especial",
  planPrice = "30.000",
  defaultBillingCycle,
  onPaymentSuccess,
  onPaymentError,
  onCancelSubscription,
}) => {
  const { createSubscription, cancelSubscription } = usePayments();
  const { user } = useUser();
  const { setLoading, addAlert } = useUI();
  const [loading, setLoadingLocal] = useState(false);
  const planUser = user?.role || null;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<PaymentPeriodicity>(
    defaultBillingCycle === 'ANNUAL' ? PaymentPeriodicity.ANNUAL : PaymentPeriodicity.MONTHLY
  );

  useEffect(() => {
    setBillingCycle(defaultBillingCycle === 'ANNUAL' ? PaymentPeriodicity.ANNUAL : PaymentPeriodicity.MONTHLY);
  }, [defaultBillingCycle]);

  const handlePayWithMercadoPago = async () => {
    setLoading(true);
    setLoadingLocal(true);

    try {
      await createSubscription({
        planType: 'BASIC',
        frequency: billingCycle === PaymentPeriodicity.ANNUAL ? 'ANNUALLY' : 'MONTHLY',
      });
      // createSubscription redirige automáticamente al checkout de MP
    } catch (error: any) {
      console.error("Error al crear preferencia:", error);
      if (onPaymentError) onPaymentError(error);
    } finally {
      setLoadingLocal(false);
      setLoading(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    setLoading(true);
    setLoadingLocal(true);

    try {
      await cancelSubscription();
      if (onCancelSubscription) onCancelSubscription();
    } catch (error) {
      console.error("Error al cancelar suscripción:", error);
      addAlert({ type: 'danger', message: 'Error al cancelar la suscripción' });
    } finally {
      setShowCancelModal(false);
      setLoadingLocal(false);
      setLoading(false);
    }
  };

  const planBenefits = [
    { text: "Mensajes ilimitados" },
    { text: "Clientes ilimitados" },
    { text: "Soporte prioritario" },
    { text: "Envíos mas rápidos" },
  ];

  const hasSpecialPlan = (): boolean => {
    return planUser !== null && planUser === UserRoleOptions.SPECIAL;
  };

  const calculatePrice = (basePrice: string, cycle: PaymentPeriodicity): { displayPrice: string, calculatedPrice: number, period: string, savings: string | null } => {
    const numericPrice = parseFloat(basePrice.replace(/\./g, '').replace(',', '.'));

    if (cycle === PaymentPeriodicity.MONTHLY) {
      return {
        displayPrice: basePrice,
        calculatedPrice: numericPrice,
        period: 'mes',
        savings: null,
      };
    } else {
      const annualPrice = numericPrice * 12 * 0.8;
      const savings = numericPrice * 12 * 0.2;

      return {
        displayPrice: Math.round(annualPrice).toLocaleString('es-CO').replace(/,/g, '.'),
        calculatedPrice: annualPrice,
        period: 'año',
        savings: Math.round(savings).toLocaleString('es-CO').replace(/,/g, '.'),
      };
    }
  };

  const priceInfo = calculatePrice(planPrice, billingCycle);

  const handleBillingCycleChange = (val: string) => {
    setBillingCycle(val as PaymentPeriodicity);
  };

  const billingOptions = [
    { label: "Mensual", value: PaymentPeriodicity.MONTHLY },
    { label: "Anual", value: PaymentPeriodicity.ANNUAL },
  ];

  return (
    <>
      {loading && (
        <div style={overlay}>
          <Spinner size={100} label="Cargando" />
        </div>
      )}

      <div className="shadow rounded-lg overflow-hidden">
        {hasSpecialPlan() ? (
          <div style={{
            background: 'linear-gradient(135deg, #095169, #0a827f)',
            color: 'white',
            padding: '3rem 2rem',
          }}>
            <div className="text-center mb-4">
              <div className="display-1 mb-3">
                <TbStarFilled className="text-warning" size={64} />
              </div>
              <h2 className="display-5 fw-bold mb-3">¡Felicidades!</h2>
              <h3 className="h4 mb-4">Ya tienes activo tu {planTitle}</h3>
            </div>

            <div className="row justify-content-center mb-4">
              <div className="col-md-8">
                <div className="bg-white bg-opacity-10 rounded p-4">
                  <h4 className="mb-3 fw-bold text-center">Beneficios que estás disfrutando:</h4>
                  <div className="row">
                    {planBenefits.map((benefit, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <HiOutlineCheckCircle className="me-3 fs-4 text-warning" />
                          <span className="fs-5">{benefit.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="mb-4">Tu suscripción se renovará automáticamente por ${priceInfo.displayPrice}/{priceInfo.period}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                leftIcon={<HiOutlineXCircle size={18} />}
              >
                Cancelar suscripción
              </Button>
            </div>
          </div>
        ) : (
          // Suscripción recurrente vía Mercado Pago PreApproval
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Tarjeta del plan */}
            <div style={{
              flex: '0 0 41.666%',
              background: 'linear-gradient(135deg, #095169, #0a827f)',
              color: 'white',
              padding: '3rem 2rem',
            }}>
              <div className="h-100 d-flex flex-column justify-content-between">
                <div>
                  <h2 className="display-6 fw-bold mb-4">{planTitle}</h2>

                  <div className="mb-4">
                    <div className="d-flex justify-content-center mb-3">
                      <Segmented
                        options={billingOptions}
                        value={billingCycle}
                        onChange={handleBillingCycleChange}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <h3 className="display-5 fw-bold mb-2">
                      ${priceInfo.displayPrice}<small style={{ fontSize: '1rem' }}>/{priceInfo.period}</small>
                    </h3>

                    {billingCycle === PaymentPeriodicity.ANNUAL && (
                      <div className="bg-white bg-opacity-25 rounded py-2 px-3 mb-3 text-center">
                        <Badge tone="warning" style={{ marginRight: '0.5rem' }}>20% DESCUENTO</Badge>
                        <span>Ahorras ${priceInfo.savings}</span>
                        <div className="small mt-1">
                          Equivale a ${Math.round(priceInfo.calculatedPrice / 12).toLocaleString('es-CO').replace(/,/g, '.')}/mes
                        </div>
                      </div>
                    )}
                  </div>

                  {planBenefits.map((benefit, index) => (
                    <div key={index} className="d-flex align-items-center mb-3">
                      <HiOutlineCheckCircle className="me-2" size={18} />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de pago — Suscripción recurrente */}
            <div style={{ flex: '0 0 58.333%', background: '#fff', padding: '2rem' }} className="d-flex flex-column justify-content-center">
              <div className="text-center">
                <h4 className="mb-3">Suscripción recurrente con Mercado Pago</h4>
                <p className="text-muted mb-4">
                  Se creará una suscripción automática. Mercado Pago cobrará {billingCycle === PaymentPeriodicity.ANNUAL ? 'cada 12 meses' : 'cada mes'} sin que tengas que volver a pagar manualmente.
                </p>
                <p className="text-muted small mb-3">
                  Puedes pagar con:
                </p>

                <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <Badge tone="neutral" style={{ padding: '0.4em 0.75em' }}>💳 Tarjeta de crédito/débito</Badge>
                  <Badge tone="neutral" style={{ padding: '0.4em 0.75em' }}>🏦 PSE</Badge>
                  <Badge tone="neutral" style={{ padding: '0.4em 0.75em' }}>📱 Nequi</Badge>
                  <Badge tone="neutral" style={{ padding: '0.4em 0.75em' }}>🏪 Efecty / Baloto</Badge>
                </div>

                <div className="bg-light rounded p-3 mb-4 mx-auto" style={{ maxWidth: 350 }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <FaShieldAlt className="text-success me-2" />
                    <strong>Resumen</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Plan:</span>
                    <strong>{planTitle} ({billingCycle === PaymentPeriodicity.ANNUAL ? 'Anual' : 'Mensual'})</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Total:</span>
                    <strong className="text-success">${priceInfo.displayPrice} COP</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Cobro:</span>
                    <span className="text-muted">{billingCycle === PaymentPeriodicity.ANNUAL ? 'Automático cada 12 meses' : 'Automático cada mes'}</span>
                  </div>
                </div>

                <div className="d-grid gap-2 mx-auto" style={{ maxWidth: 350 }}>
                  <Button
                    variant="primary"
                    size="lg"
                    block
                    onClick={handlePayWithMercadoPago}
                    disabled={loading || hasSpecialPlan()}
                    loading={loading}
                    leftIcon={<FaLock />}
                    style={{
                      background: '#009ee3',
                      borderColor: '#009ee3',
                      fontSize: '1.1rem',
                    }}
                  >
                    Suscribirme con Mercado Pago
                  </Button>
                </div>

                <p className="text-muted small mt-3">
                  <FaLock className="me-1" />
                  Tus datos de pago son procesados directamente por Mercado Pago.
                  <br />Puedes cancelar tu suscripción en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para confirmación de cancelación de suscripción */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelación de Suscripción"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              No, mantener mi plan
            </Button>
            <Button variant="danger" onClick={confirmCancelSubscription}>
              Sí, cancelar suscripción
            </Button>
          </>
        }
      >
        <div className="text-center mb-4">
          <div className="display-4 text-warning mb-3">
            <HiOutlineExclamationTriangle size={56} />
          </div>
        </div>
        <p className="fw-bold text-center mb-3">Lamentamos que desees cancelar tu suscripción</p>
        <p>Al confirmar la cancelación:</p>
        <ul>
          <li>Tu cuenta perderá el acceso a todas las funcionalidades premium</li>
          <li>No se realizarán más cobros automáticos</li>
          <li>Tu servicio seguirá activo hasta el final del período facturado</li>
        </ul>
        <p className="mt-3">¿Estás seguro de que deseas proceder con la cancelación?</p>
      </Modal>
    </>
  );
};

export default PaymentForm;
