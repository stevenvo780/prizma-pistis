import React from 'react';
import Link from 'next/link';
import { Button, Badge } from 'prizma-ui';
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
        <Button variant="secondary" size="lg" className="fw-semibold px-4" style={{ borderRadius: 12 }}>
          Iniciar Sesión
        </Button>
      </Link>
      <Link href="/plans" passHref>
        <Button variant="ghost" size="lg" className="fw-semibold px-4" style={{ borderRadius: 12 }}>
          Ver Planes
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="lg"
        className="fw-semibold px-4"
        style={{ borderRadius: 12 }}
        onClick={() => window.open('https://www.humanizar.co/', '_blank')}
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

  return (
    <div style={{ background: '#fafaf9' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #095169 0%, #0a827f 100%)',
          padding: '4.5rem 0 3.5rem',
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0 text-white">
              <Badge tone="neutral" className="mb-3 px-3 py-2" style={{ fontSize: '0.8rem', borderRadius: 20, fontWeight: 600 }}>
                🚀 Sistema innovador para comercios
              </Badge>
              <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15 }}>
                Sistema de Créditos<br />sin Interés
              </h1>
              <p className="lead mb-0" style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: 520 }}>
                Permite a comercios &quot;fiar&quot; dinero a clientes de confianza, con control total y cero complicaciones.
              </p>
              <HomeHeroButtons />
            </div>
            <div className="col-lg-5 text-center">
              <img
                src="/img/girlcart.png"
                alt="Persona con carrito de compras"
                className="img-fluid"
                style={{ maxHeight: 350, filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es? */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="/img/student.png"
                alt="Persona estudiando"
                className="img-fluid"
                style={{ borderRadius: 20, maxHeight: 420, boxShadow: '0 20px 60px rgba(10,130,127,0.12)' }}
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
                Un sistema moderno para &quot;fiar&quot; a clientes de confianza, con todas las
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
                    border: '1px solid #e0f2f1',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #e0f7fa, #f0fdfa)',
                      color: '#0a827f',
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
            <div className="col-lg-5 mb-4 mb-lg-0">
              <img
                src="/img/dollar.png"
                alt="Moneda en aumento"
                className="img-fluid"
                style={{ maxWidth: 400, filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.1))' }}
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
                      background: '#f0fdfa',
                      color: '#0a827f',
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

      {/* CTA */}
      <section
        style={{
          background: 'linear-gradient(135deg, #095169, #0a827f)',
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
              <Button variant="secondary" size="lg" className="fw-semibold px-4" style={{ borderRadius: 12 }}>
                Iniciar Sesión
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="fw-semibold px-4"
              style={{ borderRadius: 12 }}
              onClick={() => window.open('https://www.humanizar.co/', '_blank')}
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
