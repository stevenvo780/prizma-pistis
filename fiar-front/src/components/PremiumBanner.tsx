import React, { useState } from 'react';
import { Button, Modal } from 'prizma-ui';
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
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <HiOutlineSparkles size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem' }}>
            <strong>Plan Gratis:</strong> Tu cuenta tiene funcionalidades limitadas.
          </span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'none' }} className="d-md-inline">
            Actualiza a Premium para soporte prioritario, mensajes y clientes ilimitados.
          </span>
        </div>
        <Button
          variant="accent"
          size="sm"
          leftIcon={<TbCrown size={16} />}
          onClick={handleShow}
          style={{ borderRadius: 8, boxShadow: 'none' }}
        >
          Actualizar a Premium
        </Button>
      </div>

      <Modal
        open={showModal}
        onClose={handleClose}
        title="Actualiza a Plan Premium"
      >
        <PaymentForm
          planTitle="Plan Especial"
          planPrice="30.000"
          onPaymentSuccess={handleClose}
          onPaymentError={() => {}}
        />
      </Modal>
    </>
  );
};

export default PremiumBanner;
