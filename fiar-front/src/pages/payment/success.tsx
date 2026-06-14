import React, { useEffect, useState, useRef } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";
import useUser from "@store/user";
import usePayments from "@store/payments";

const PaymentSuccess: React.FC = () => {
  const router = useRouter();
  const { fetchUser } = useUser();
  const { syncSubscription } = usePayments();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [planActivated, setPlanActivated] = useState(false);
  const [syncAttempts, setSyncAttempts] = useState(0);
  const hasSynced = useRef(false);

  const MAX_SYNC_ATTEMPTS = 5;
  const SYNC_INTERVAL_MS = 4000;

  useEffect(() => {
    const refresh = async () => {
      try {
        await fetchUser();
      } catch (e) {
        console.error("Error refrescando usuario:", e);
      } finally {
        setLoading(false);
      }
    };
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar automáticamente con MercadoPago después de cargar
  useEffect(() => {
    if (loading || hasSynced.current) return;
    hasSynced.current = true;

    const doSync = async (attempt: number) => {
      if (attempt > MAX_SYNC_ATTEMPTS) {
        setSyncing(false);
        return;
      }

      setSyncing(true);
      setSyncAttempts(attempt);

      const result = await syncSubscription();

      if (result?.synced && result.planType !== 'FREE') {
        setPlanActivated(true);
        setSyncing(false);
        // Refrescar usuario para obtener el plan actualizado
        try {
          await fetchUser();
        } catch (e) {
          console.error("Error refrescando usuario post-sync:", e);
        }
        return;
      }

      // Si no se activó todavía, reintentar después de un delay
      // (MercadoPago puede tardar unos segundos en cambiar el status a authorized)
      if (attempt < MAX_SYNC_ATTEMPTS) {
        setTimeout(() => doSync(attempt + 1), SYNC_INTERVAL_MS);
      } else {
        setSyncing(false);
      }
    };

    // Esperar 2 segundos iniciales para dar tiempo a MP de procesar
    setTimeout(() => doSync(1), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <Card
        className="text-center border-0 p-5"
        style={{ maxWidth: 520, borderRadius: 20, boxShadow: '0 8px 32px rgba(16,185,129,0.1)' }}
      >
        <Card.Body>
          {loading ? (
            <Spinner animation="border" variant="success" />
          ) : (
            <>
              <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 80, height: 80, borderRadius: '50%', background: planActivated ? '#ecfdf5' : '#fefce8' }}>
                {planActivated ? (
                  <HiOutlineCheckCircle size={48} className="text-success" />
                ) : syncing ? (
                  <Spinner animation="border" variant="warning" />
                ) : (
                  <HiOutlineClock size={48} className="text-warning" />
                )}
              </div>
              <h2 className="fw-bold mb-3">
                {planActivated ? '¡Pago exitoso!' : syncing ? 'Activando tu plan...' : '¡Pago registrado!'}
              </h2>
              <p className="text-muted mb-4">
                {planActivated
                  ? 'Tu suscripción ha sido activada correctamente. Ya puedes disfrutar de todas las funcionalidades premium.'
                  : syncing
                    ? `Estamos verificando tu pago con MercadoPago... (intento ${syncAttempts}/${MAX_SYNC_ATTEMPTS})`
                    : 'Tu pago fue recibido. El plan se activará en breve. Si no se actualiza, cierra sesión y vuelve a iniciar.'}
              </p>
              {router.query.preapproval_id && (
                <p className="small text-muted mb-3">
                  ID de suscripción: <code>{router.query.preapproval_id}</code>
                </p>
              )}
              {router.query.payment_id && (
                <p className="small text-muted mb-3">
                  ID de pago: <code>{router.query.payment_id}</code>
                </p>
              )}
              <Button
                variant="success"
                size="lg"
                className="fw-bold px-5"
                onClick={() => router.push("/dashboard")}
                disabled={syncing}
              >
                {syncing ? 'Espera un momento...' : 'Ir al Dashboard'}
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
