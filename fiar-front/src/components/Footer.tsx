import React from 'react';
import { Container, Grid, Row } from 'prizma-ui';
import { HiOutlineEnvelope, HiOutlineGlobeAlt } from 'react-icons/hi2';
import { TbBrandInstagram } from 'react-icons/tb';

const Footer = () => (
  <footer
    style={{
      background: 'linear-gradient(135deg, var(--c-primary-800, #1f6b60), var(--c-primary-700, #2d8a7d))',
      color: 'rgba(255,255,255,0.85)',
      padding: '2.5rem 0 1.5rem',
      marginTop: 'auto',
    }}
  >
    <Container>
      <Grid cols={3} gap="2rem" style={{ alignItems: 'start' }}>
        <div>
          <h6 className="fw-bold text-white mb-2" style={{ letterSpacing: '0.03em' }}>Pistis</h6>
          <p className="mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Sistema de créditos sin interés para comercios. Moderniza la forma de prestar a tus clientes de confianza.
          </p>
        </div>
        <div>
          <h6 className="fw-bold text-white mb-2">Contacto</h6>
          <Row gap="0.5rem" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <HiOutlineEnvelope size={16} />
            <a href="mailto:stevenvallejo780@gmail.com" className="text-white text-decoration-none">stevenvallejo780@gmail.com</a>
          </Row>
          <Row gap="0.5rem" style={{ fontSize: '0.85rem' }}>
            <HiOutlineGlobeAlt size={16} />
            <a href="https://prizma.app/" target="_blank" rel="noreferrer" className="text-white text-decoration-none">prizma.app</a>
          </Row>
        </div>
        <div style={{ textAlign: 'end' }}>
          <h6 className="fw-bold text-white mb-2">Síguenos</h6>
          <Row gap="1rem" style={{ justifyContent: 'flex-end' }}>
            <a href="https://www.instagram.com/prizma.co/" target="_blank" rel="noreferrer" className="text-white" aria-label="Instagram">
              <TbBrandInstagram size={22} />
            </a>
            <a href="https://prizma.app/" target="_blank" rel="noreferrer" className="text-white" aria-label="Web">
              <HiOutlineGlobeAlt size={22} />
            </a>
          </Row>
        </div>
      </Grid>
      <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '1.5rem 0 1rem' }} />
      <p className="text-center mb-0" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Pistis es parte de Prizma · © {new Date().getFullYear()} Steven Vallejo. Todos los derechos reservados.
      </p>
    </Container>
  </footer>
);

export default Footer;
