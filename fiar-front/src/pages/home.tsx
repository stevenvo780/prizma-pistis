import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Button, Badge } from 'prizma-ui';
import { SITE_URL } from '../config/site';
import {
  HiOutlineShieldCheck,
  HiOutlineRocketLaunch,
  HiOutlineUserGroup,
  HiOutlineBolt,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';

function HomeHeroButtons() {
  return (
    <div className="d-flex flex-wrap gap-3 mt-4">
      <Link href="/login" passHref>
        <Button
          variant="secondary"
          size="lg"
          className="fw-semibold px-4"
          style={{
            borderRadius: 12,
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          Iniciar Sesión
        </Button>
      </Link>
      <Link href="/plans" passHref>
        <Button
          variant="ghost"
          size="lg"
          className="fw-semibold px-4"
          style={{ borderRadius: 12, color: '#FFFFFF' }}
        >
          Ver Planes
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="lg"
        className="fw-semibold px-4"
        style={{ borderRadius: 12, color: '#FFFFFF' }}
        onClick={() => window.open(SITE_URL, '_blank')}
      >
        Saber Más
      </Button>
    </div>
  );
}

const Home = () => {
  const benefits = [
    {
      icon: <HiOutlineShieldCheck size={32} />,
      title: 'Seguridad Garantizada',
      desc: 'Autenticación robusta y datos protegidos con tecnología de punta.',
    },
    {
      icon: <HiOutlineRocketLaunch size={32} />,
      title: 'Rápida Implementación',
      desc: 'Comience a operar en horas con nuestro sistema llave en mano.',
    },
    {
      icon: <HiOutlineUserGroup size={32} />,
      title: 'Fidelice Clientes',
      desc: 'Ofrezca valor agregado que incrementa las ventas recurrentes.',
    },
  ];

  const features = [
    { icon: <HiOutlineBolt size={28} />, title: 'Sin intereses', desc: 'Crédito directo, sin costos ocultos para su cliente.' },
    { icon: <HiOutlineChatBubbleLeftRight size={28} />, title: 'Comunicación fácil', desc: 'Notificaciones y recordatorios automáticos de cobro.' },
    { icon: <HiOutlineChartBarSquare size={28} />, title: 'Reportes claros', desc: 'Visualice su cartera, estado de créditos y tendencias.' },
  ];

  const plans = [
    {
      title: 'Plan Básico',
      price: '$0',
      period: 'Siempre gratis',
      badge: 'Gratuito',
      badgeTone: 'neutral' as const,
      features: [
        'Hasta 50 clientes de confianza',
        'Control de saldos básico',
        'Notificaciones manuales',
        'Soporte comunitario',
      ],
      cta: 'Comenzar Gratis',
      variant: 'ghost' as const,
    },
    {
      title: 'Plan Estándar',
      price: '$30.000',
      period: 'COP / mes',
      badge: 'Recomendado',
      badgeTone: 'success' as const,
      features: [
        'Clientes ilimitados',
        'Control de saldos y abonos',
        'Notificaciones automáticas (WhatsApp/SMS)',
        'Reportes claros de cartera',
        'Soporte prioritario',
      ],
      cta: 'Elegir Estándar',
      variant: 'primary' as const,
      popular: true,
    },
    {
      title: 'Plan Premium',
      price: '$288.000',
      period: 'COP / año',
      badge: 'Ahorra 20%',
      badgeTone: 'warning' as const,
      features: [
        'Todo lo del Plan Estándar',
        '20% de descuento equivalente',
        'Integración con sistemas POS',
        'Actualizaciones premium garantizadas',
        'Soporte 24/7 y asesoría',
      ],
      cta: 'Elegir Premium',
      variant: 'secondary' as const,
    },
  ];

  return (
    <div style={{ background: '#fafaf9' }}>
      <Head>
        <title>Pistis — Crédito y Cartera | Prizma</title>
      </Head>

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--c-primary-800, #1f6b60), var(--c-primary-700, #2d8a7d))',
          padding: '4.5rem 0 3.5rem',
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0 text-white">
              <Badge tone="neutral" className="mb-3 px-3 py-2" style={{ fontSize: '0.8rem', borderRadius: 20, fontWeight: 600 }}>
                Sistema innovador para comercios
              </Badge>
              <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15, color: '#FFFFFF' }}>
                Sistema de Créditos<br />sin Interés
              </h1>
              <p className="lead mb-0" style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: 520, color: '#FFFFFF' }}>
                Permite a comercios prestar dinero a clientes de confianza, con control total y cero complicaciones.
              </p>
              <HomeHeroButtons />
            </div>
            <div className="col-lg-5 text-center d-flex align-items-center justify-content-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/isotipo_light.png"
                alt="Pistis by Prizma"
                width={240}
                height={240}
                style={{ maxWidth: 240, maxHeight: 320, height: 'auto', filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es? */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 d-flex align-items-center justify-content-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/student.png"
                alt="Persona estudiando"
                width={500}
                height={420}
                style={{ borderRadius: 20, maxHeight: 420, height: 'auto', boxShadow: '0 20px 60px rgba(10,130,127,0.12)', maxWidth: '100%' }}
              />
            </div>
            <div className="col-lg-6">
              <Badge tone="success" className="mb-3 px-3 py-2" style={{ borderRadius: 20, fontWeight: 600 }}>
                Sistema Innovador
              </Badge>
              <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>¿Qué es nuestro sistema?</h2>
              <p className="text-muted mb-3" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                No somos un banco. Somos una solución que permite a comercios (alimentos, sector primario)
                integrar crédito sin intereses en su POS o software de e-commerce.
              </p>
              <p className="text-muted mb-0" style={{ lineHeight: 1.7 }}>
                Un sistema moderno para prestar a clientes de confianza, con todas las
                seguridades y controles que su negocio necesita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section style={{ padding: '4rem 0', background: '#f0fdfa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <Badge tone="success" className="mb-3 px-3 py-2" style={{ borderRadius: 20, fontWeight: 600 }}>
              Ventajas
            </Badge>
            <h2 className="fw-bold" style={{ fontSize: '2rem' }}>¿Por qué elegir nuestro sistema?</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {benefits.map((b, i) => (
              <div className="col-md-4" key={i}>
                <div
                  className="text-center h-100 p-4"
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px rgba(10,130,127,0.06)',
                    border: '1px solid var(--c-accent-module-tint, #d4f2ed)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--c-primary-50, #e8f7f4), var(--c-accent-module-tint, #d4f2ed))',
                      color: 'var(--c-accent-module, #43b5a6)',
                    }}
                  >
                    {b.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{b.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0 d-flex align-items-center justify-content-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/dollar.png"
                alt="Moneda en aumento"
                width={400}
                height={400}
                style={{ maxWidth: 400, height: 'auto', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.1))' }}
              />
            </div>
            <div className="col-lg-7">
              <h2 className="fw-bold mb-4" style={{ fontSize: '1.8rem' }}>Todo lo que necesita su negocio</h2>
              {features.map((f, i) => (
                <div key={i} className="d-flex align-items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--c-accent-module-tint, #d4f2ed)',
                      color: 'var(--c-accent-module, #43b5a6)',
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{f.title}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section id="pricing" style={{ padding: '5rem 0', background: '#f5f5f4' }}>
        <div className="container">
          <div className="text-center mb-5">
            <Badge tone="success" className="mb-3 px-3 py-2" style={{ borderRadius: 20, fontWeight: 600 }}>
              Planes y Precios
            </Badge>
            <h2 className="fw-bold" style={{ fontSize: '2.2rem', color: 'var(--c-primary-700, #2d8a7d)' }}>
              Elige el plan ideal para tu comercio
            </h2>
            <p className="text-muted mx-auto mt-2" style={{ maxWidth: 600 }}>
              Comienza gratis y escala a medida que tu negocio crezca. Sin costos ocultos.
            </p>
          </div>

          <div className="row g-4 justify-content-center align-items-stretch">
            {plans.map((p, i) => (
              <div className="col-md-4" key={i} style={{ maxWidth: 360 }}>
                <div
                  className="card h-100 position-relative"
                  style={{
                    borderRadius: 20,
                    border: p.popular ? '2px solid var(--c-accent-module, #43b5a6)' : '1px solid #e7e5e4',
                    boxShadow: p.popular ? '0 10px 30px rgba(10,130,127,0.15)' : '0 4px 20px rgba(0,0,0,0.04)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    background: '#ffffff',
                  }}
                >
                  {p.popular && (
                    <div
                      className="position-absolute"
                      style={{
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                      }}
                    >
                      <Badge tone="warning" className="px-3 py-1" style={{ borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
                        MAS POPULAR
                      </Badge>
                    </div>
                  )}

                  <div className="card-body p-4 d-flex flex-column h-100">
                    <div className="mb-3">
                      <Badge tone={p.badgeTone} className="px-2 py-1" style={{ borderRadius: 10, fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.badge}
                      </Badge>
                    </div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1c1917' }}>{p.title}</h4>
                    <div className="d-flex align-items-baseline my-3">
                      <span className="fw-bold" style={{ fontSize: '2.5rem', color: 'var(--c-accent-module, #43b5a6)', lineHeight: 1 }}>
                        {p.price}
                      </span>
                      <span className="text-muted ms-2" style={{ fontSize: '0.95rem' }}>
                        {p.period}
                      </span>
                    </div>

                    <hr className="my-3" style={{ borderTop: '1px solid #e7e5e4' }} />

                    <ul className="list-unstyled mb-4 flex-grow-1">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 mb-2" style={{ fontSize: '0.9rem', color: '#44403c' }}>
                          <span style={{ color: 'var(--c-accent-module, #43b5a6)', fontWeight: 'bold', marginRight: '6px' }}>✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={p.price === '$0' ? '/login' : '/plans'} passHref>
                      <Button
                        variant={p.variant}
                        size="lg"
                        className="w-100 fw-semibold"
                        style={{
                          borderRadius: 12,
                          transition: 'all 0.2s',
                        }}
                      >
                        {p.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--c-primary-800, #1f6b60), var(--c-primary-700, #2d8a7d))',
          padding: '4rem 0',
        }}
      >
        <div className="container text-center text-white">
          <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>
            ¿Listo para modernizar la forma de dar crédito?
          </h2>
          <p className="mb-4 mx-auto" style={{ maxWidth: 520, opacity: 0.9 }}>
            Regístrese hoy y comience a ofrecer crédito sin intereses de forma segura y controlada.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link href="/login" passHref>
              <Button
                variant="secondary"
                size="lg"
                className="fw-semibold px-4"
                style={{
                  borderRadius: 12,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="fw-semibold px-4"
              style={{ borderRadius: 12, color: '#FFFFFF' }}
              onClick={() => window.open(SITE_URL, '_blank')}
            >
              Contactar Ventas
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// Enables SSR so crawlers receive rendered HTML instead of an empty shell
export function getServerSideProps() {
  return { props: {} };
}
