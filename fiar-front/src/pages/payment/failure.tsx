import React from "react";
import Head from "next/head";
import { Card, CardBody, Button } from "prizma-ui";
import { useRouter } from "next/router";
import { HiOutlineXCircle } from "react-icons/hi2";

const PaymentFailure: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <Card
        className="text-center p-5"
        style={{ maxWidth: 520, borderRadius: 20, boxShadow: '0 8px 32px rgba(239,68,68,0.08)' }}
      >
        <Head><title>Pago no completado — Pistis</title></Head>
        <CardBody>
          <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef2f2' }}>
            <HiOutlineXCircle size={48} className="text-danger" />
          </div>
          <h1 className="fw-bold mb-3" style={{ fontSize: '1.5rem' }}>Pago no completado</h1>
          <p className="text-muted mb-4">
            Tu pago no pudo ser procesado. Esto puede ocurrir por fondos
            insuficientes, datos incorrectos o un problema temporal.
          </p>
          {router.query.payment_id && (
            <p className="small text-muted mb-3">
              ID de pago: <code>{router.query.payment_id}</code>
            </p>
          )}
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/")}
            >
              Ir al inicio
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="fw-bold"
              onClick={() => router.push("/plans")}
            >
              Intentar de nuevo
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentFailure;
