import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { TbCrown } from 'react-icons/tb';
import useUser from '@store/user';
import PaymentForm from './payment/PaymentForm';

const PremiumBanner: React.FC = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  
  if (!user || user.role !== "FREE") {
    return null;
  }
  
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <>
      <div 
        style={{ 
          background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)',
          borderBottom: '1px solid #fde68a',
          padding: '0.6rem 0',
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col xs={12} md={8} className="d-flex align-items-center">
              <HiOutlineSparkles size={20} className="text-warning me-2 flex-shrink-0" />
              <span className="me-2" style={{ fontSize: '0.9rem' }}>
                <strong>Plan Gratis:</strong> Tu cuenta tiene funcionalidades limitadas.
              </span>
              <span className="d-none d-md-inline text-muted" style={{ fontSize: '0.85rem' }}>
                Actualiza a Premium para soporte prioritario, mensajes y clientes ilimitados.
              </span>
            </Col>
            <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0">
              <Button 
                variant="warning" 
                size="sm" 
                className="fw-bold px-3 d-inline-flex align-items-center gap-1"
                onClick={handleShow}
                style={{ borderRadius: 8, boxShadow: 'none' }}
              >
                <TbCrown size={16} />
                Actualizar a Premium
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
          <Modal.Title className="fw-bold">Actualiza a Plan Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <PaymentForm 
            planTitle="Plan Especial"
            planPrice="30.000"
            onPaymentSuccess={handleClose}
            onPaymentError={() => {}}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PremiumBanner;
