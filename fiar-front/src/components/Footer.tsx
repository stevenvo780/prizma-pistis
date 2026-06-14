import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { HiOutlineEnvelope, HiOutlineGlobeAlt } from 'react-icons/hi2';
import { TbBrandInstagram } from 'react-icons/tb';

const Footer = () => (
  <footer
    style={{
      background: 'linear-gradient(135deg, #095169, #0a827f)',
      color: 'rgba(255,255,255,0.85)',
      padding: '2.5rem 0 1.5rem',
      marginTop: 'auto',
    }}
  >
    <Container>
      <Row className="align-items-start g-4">
        <Col md={4}>
          <h6 className="fw-bold text-white mb-2" style={{ letterSpacing: '0.03em' }}>Fiar</h6>
          <p className="mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Sistema de créditos sin interés para comercios. Moderniza la forma de fiar a tus clientes de confianza.
          </p>
        </Col>
        <Col md={4}>
          <h6 className="fw-bold text-white mb-2">Contacto</h6>
          <div className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
            <HiOutlineEnvelope size={16} />
            <a href="mailto:contacto@humanizar.co" className="text-white text-decoration-none">contacto@humanizar.co</a>
          </div>
          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <HiOutlineGlobeAlt size={16} />
            <a href="https://cauce.app/" target="_blank" rel="noreferrer" className="text-white text-decoration-none">cauce.app</a>
          </div>
        </Col>
        <Col md={4} className="text-md-end">
          <h6 className="fw-bold text-white mb-2">Síguenos</h6>
          <div className="d-flex gap-3 justify-content-md-end">
            <a href="https://www.instagram.com/humanizar.co/" target="_blank" rel="noreferrer" className="text-white" aria-label="Instagram">
              <TbBrandInstagram size={22} />
            </a>
            <a href="https://cauce.app/" target="_blank" rel="noreferrer" className="text-white" aria-label="Web">
              <HiOutlineGlobeAlt size={22} />
            </a>
          </div>
        </Col>
      </Row>
      <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '1.5rem 0 1rem' }} />
      <p className="text-center mb-0" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Fiar es parte de Olympo · © {new Date().getFullYear()} Olympo. Todos los derechos reservados.
      </p>
    </Container>
  </footer>
);

export default Footer;
