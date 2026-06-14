import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { HiOutlineClock } from "react-icons/hi2";

const PaymentPending: React.FC = () => {
  const router = useRouter();

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <Card
        className="text-center border-0 p-5"
        style={{ maxWidth: 520, borderRadius: 20, boxShadow: '0 8px 32px rgba(245,158,11,0.08)' }}
      >
        <Card.Body>
          <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 80, height: 80, borderRadius: '50%', background: '#fffbeb' }}>
            <HiOutlineClock size={48} className="text-warning" />
          </div>
          <h2 className="fw-bold mb-3">Pago pendiente</h2>
          <p className="text-muted mb-4">
            Tu pago está siendo procesado. Esto puede tomar unos minutos.
            Recibirás una confirmación una vez que sea aprobado.
          </p>
          {router.query.payment_id && (
            <p className="small text-muted mb-3">
              ID de pago: <code>{router.query.payment_id}</code>
            </p>
          )}
          <p className="text-muted small mb-4">
            Si pagaste en efectivo (Efecty, Baloto, etc.), puede tomar hasta 2
            horas hábiles en reflejarse.
          </p>
          <Button
            variant="warning"
            size="lg"
            className="fw-bold px-5"
            onClick={() => router.push("/home")}
          >
            Ir al inicio
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentPending;
