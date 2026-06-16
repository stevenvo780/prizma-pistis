import React, { useState } from "react";
import Head from 'next/head';
import { Button, Card, CardBody, Badge, Modal } from 'prizma-ui';
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
      <Head><title>Planes — Pistis</title></Head>
      {/* Hero/Promo Section */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 40,
          padding: 40,
          margin: '0 auto 40px auto',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f7fa 100%)',
          borderRadius: 20,
          border: '1px solid #ccfbf1',
          boxShadow: '0 4px 24px rgba(10,130,127,0.08)',
          maxWidth: 680,
        }}
      >
        <HiOutlineSparkles size={36} style={{ color: '#059669', marginBottom: 12 }} />
        <h1 style={{ fontWeight: 700, marginBottom: 12, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#095169' }}>
          Moderniza tu negocio con nuestro sistema
        </h1>
        <p style={{ color: '#6c757d', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px auto' }}>
          Gestiona créditos sin interés, fideliza clientes y haz crecer tu comercio con tecnología segura.
        </p>
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<HiOutlinePlayCircle size={24} />}
          style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(10,130,127,0.2)', fontWeight: 700 }}
          onClick={() => window.open('https://prisma-enterprice.cloud', '_blank')}
        >
          Solicita una Demo
        </Button>
      </div>

      {/* Sección de Planes */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Badge tone="success" style={{ marginBottom: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600, display: 'inline-block' }}>Planes</Badge>
        <h2 style={{ fontWeight: 700, fontSize: '1.8rem' }}>Elige el plan ideal para tu negocio</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
        {/* Plan Mensual */}
        <div style={{ width: '100%', maxWidth: 340 }}>
          <Card style={{ borderRadius: 16, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 12 }}>Plan Mensual</div>
              <div style={{ fontWeight: 700, fontSize: '2.5rem', color: '#0a827f', marginBottom: 4 }}>$30.000</div>
              <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: 24 }}>COP / mes</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, width: '100%', maxWidth: 260, textAlign: 'left' }}>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineCheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} /> Todas las funcionalidades
                </li>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineChatBubbleLeftRight size={18} style={{ color: '#059669', flexShrink: 0 }} /> Soporte prioritario
                </li>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineRocketLaunch size={18} style={{ color: '#059669', flexShrink: 0 }} /> Actualizaciones incluidas
                </li>
              </ul>
              <Button
                variant="ghost"
                size="lg"
                block
                style={{ maxWidth: 220, borderRadius: 10, marginTop: 'auto' }}
                onClick={() => { setDefaultBillingCycle('MONTHLY'); setShowPaymentModal(true); }}
              >
                Elegir Mensual
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Plan Anual */}
        <div style={{ width: '100%', maxWidth: 340, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
            <Badge tone="warning" style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
              ⭐ Más popular
            </Badge>
          </div>
          <Card style={{ borderRadius: 16, border: '2px solid #0a827f', boxShadow: '0 4px 32px rgba(10,130,127,0.12)', height: '100%' }}>
            <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, paddingTop: 48, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 12 }}>Plan Anual</div>
              <div style={{ fontWeight: 700, fontSize: '2.5rem', color: '#0a827f', marginBottom: 4 }}>$288.000</div>
              <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: 4 }}>COP / año</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#059669', marginBottom: 24 }}>¡Ahorra $72.000!</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, width: '100%', maxWidth: 260, textAlign: 'left' }}>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineCheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} /> Todas las funcionalidades
                </li>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineChatBubbleLeftRight size={18} style={{ color: '#059669', flexShrink: 0 }} /> Soporte prioritario
                </li>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineRocketLaunch size={18} style={{ color: '#059669', flexShrink: 0 }} /> Actualizaciones incluidas
                </li>
                <li style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineChartBarSquare size={18} style={{ color: '#059669', flexShrink: 0 }} /> 20% de descuento
                </li>
              </ul>
              <Button
                variant="primary"
                size="lg"
                block
                style={{ maxWidth: 220, borderRadius: 10, boxShadow: '0 2px 12px rgba(10,130,127,0.2)', marginTop: 'auto' }}
                onClick={() => { setDefaultBillingCycle('ANNUAL'); setShowPaymentModal(true); }}
              >
                Elegir Anual
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* CTA Final */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>¿Listo para transformar tu negocio?</h3>
        <Button
          variant="primary"
          size="lg"
          style={{ borderRadius: 12, fontWeight: 600 }}
          onClick={() => setShowPaymentModal(true)}
        >
          Suscribirse Ahora
        </Button>
      </div>

      {/* Modal de pago con Mercado Pago */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Suscribirse al Plan"
      >
        <PaymentForm
          planTitle="Plan Especial"
          planPrice="30.000"
          defaultBillingCycle={defaultBillingCycle}
          onPaymentSuccess={() => setShowPaymentModal(false)}
          onPaymentError={() => {}}
        />
      </Modal>
    </div>
  );
};

export default PlansPage;
