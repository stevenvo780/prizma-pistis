import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import {
  HiOutlineShieldCheck,
  HiOutlineRocketLaunch,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlinePlayCircle,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import PaymentForm from '@components/payment/PaymentForm';

const PlansPage: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [defaultBillingCycle, setDefaultBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  return (
    <Container className="py-5">
      {/* Hero/Promo Section */}
      <div
        className="text-center mb-5 p-5 mx-auto"
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f7fa 100%)',
          borderRadius: 20,
          border: '1px solid #ccfbf1',
          boxShadow: '0 4px 24px rgba(10,130,127,0.08)',
          maxWidth: 680,
        }}
      >
        <HiOutlineSparkles size={36} className="text-success mb-3" />
        <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#095169' }}>
          Moderniza tu negocio con nuestro sistema
        </h1>
        <p className="text-muted mb-4" style={{ maxWidth: 480, margin: '0 auto' }}>
          Gestiona créditos sin interés, fideliza clientes y haz crecer tu comercio con tecnología segura.
        </p>
        <Button
          variant="success"
          size="lg"
          className="fw-bold d-inline-flex align-items-center gap-2 px-4"
          style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(10,130,127,0.2)' }}
          onClick={() => window.open('https://www.humanizar.co/', '_blank')}
        >
          <HiOutlinePlayCircle size={24} />
          Solicita una Demo
        </Button>
      </div>

      {/* Sección de Planes */}
      <div className="text-center mb-4">
        <Badge bg="success" className="mb-3 px-3 py-2" style={{ borderRadius: 20, fontWeight: 600 }}>Planes</Badge>
        <h2 className="fw-bold" style={{ fontSize: '1.8rem' }}>Elige el plan ideal para tu negocio</h2>
      </div>
      <Row className="justify-content-center mb-5 g-4">
        <Col md={5} lg={4}>
          <Card
            className="h-100 border-0 text-center"
            style={{
              borderRadius: 16,
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s',
            }}
          >
            <Card.Body className="d-flex flex-column align-items-center p-4">
              <Card.Title className="fw-bold fs-4 mb-3">Plan Mensual</Card.Title>
              <div className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: '#0a827f' }}>$30.000</div>
              <div className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>COP / mes</div>
              <ul className="list-unstyled mb-4 text-start w-100" style={{ maxWidth: 260 }}>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineCheckCircle size={18} className="text-success flex-shrink-0" /> Todas las funcionalidades</li>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineChatBubbleLeftRight size={18} className="text-success flex-shrink-0" /> Soporte prioritario</li>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineRocketLaunch size={18} className="text-success flex-shrink-0" /> Actualizaciones incluidas</li>
              </ul>
              <Button
                variant="outline-success"
                size="lg"
                className="w-100 fw-bold mt-auto"
                style={{ maxWidth: 220, borderRadius: 10 }}
                onClick={() => { setDefaultBillingCycle('MONTHLY'); setShowPaymentModal(true); }}
              >
                Elegir Mensual
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5} lg={4}>
          <Card
            className="h-100 text-center position-relative"
            style={{
              borderRadius: 16,
              border: '2px solid #0a827f',
              boxShadow: '0 4px 32px rgba(10,130,127,0.12)',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
              <Badge bg="warning" text="dark" className="px-3 py-2 fw-bold" style={{ borderRadius: 20, fontSize: '0.8rem' }}>
                ⭐ Más popular
              </Badge>
            </div>
            <Card.Body className="d-flex flex-column align-items-center p-4 pt-5">
              <Card.Title className="fw-bold fs-4 mb-3">Plan Anual</Card.Title>
              <div className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: '#0a827f' }}>$288.000</div>
              <div className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>COP / año</div>
              <div className="mb-4 fw-semibold" style={{ fontSize: '0.85rem', color: '#059669' }}>¡Ahorra $72.000!</div>
              <ul className="list-unstyled mb-4 text-start w-100" style={{ maxWidth: 260 }}>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineCheckCircle size={18} className="text-success flex-shrink-0" /> Todas las funcionalidades</li>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineChatBubbleLeftRight size={18} className="text-success flex-shrink-0" /> Soporte prioritario</li>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineRocketLaunch size={18} className="text-success flex-shrink-0" /> Actualizaciones incluidas</li>
                <li className="mb-2 d-flex align-items-center gap-2"><HiOutlineChartBarSquare size={18} className="text-success flex-shrink-0" /> 20% de descuento</li>
              </ul>
              <Button
                variant="success"
                size="lg"
                className="w-100 fw-bold mt-auto"
                style={{ maxWidth: 220, borderRadius: 10, boxShadow: '0 2px 12px rgba(10,130,127,0.2)' }}
                onClick={() => { setDefaultBillingCycle('ANNUAL'); setShowPaymentModal(true); }}
              >
                Elegir Anual
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Final */}
      <div className="text-center mt-5">
        <h3 className="fw-bold mb-3">¿Listo para transformar tu negocio?</h3>
        <Button
          variant="success"
          size="lg"
          className="fw-semibold px-4"
          style={{ borderRadius: 12 }}
          onClick={() => setShowPaymentModal(true)}
        >
          Suscribirse Ahora
        </Button>
      </div>

      {/* Modal de pago con Mercado Pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Suscribirse al Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <PaymentForm
            planTitle="Plan Especial"
            planPrice="30.000"
            defaultBillingCycle={defaultBillingCycle}
            onPaymentSuccess={() => setShowPaymentModal(false)}
            onPaymentError={() => {}}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PlansPage;
