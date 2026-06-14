import React, { FC } from 'react';
import { Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Client } from '@utils/types';
import { FaEye, FaEdit, FaTrashAlt, FaUser, FaIdCard, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import styles from '@styles/Client.module.css';

const formatNumber = (amount: number | string | undefined) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
  return num.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
};

interface ClientListProps {
  client: Client[];
  handleShowModal: (client: Client) => void;
  updateClientSelect: (id: number) => void;
  deleteClient: (id: number) => void;
}

const ClientList: FC<ClientListProps> = ({
  client,
  handleShowModal,
  updateClientSelect,
}) => (
  <>
    <Row>
      {client?.map((client, idx) => (
        <Col key={idx} xs={12} md={6} lg={4} xl={3} className="mb-4">
          <Card className={styles['client-card']} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <FaUser style={{ color: '#6c757d', fontSize: '1.2rem' }} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>{client.name} {client.lastname}</h5>
                    <small style={{ color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                      <FaIdCard style={{ marginRight: '4px' }} /> {client.document}
                    </small>
                  </div>
                </div>
                {client.blocked && <Badge bg="danger">Bloqueado</Badge>}
              </div>
              
              <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#6c757d', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <FaMoneyBillWave style={{ marginRight: '6px' }} /> Límite:
                  </span>
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>{formatNumber(client.credit_limit || 0)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: '#6c757d', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <FaWallet style={{ marginRight: '6px' }} /> Saldo:
                  </span>
                  <span style={{ fontWeight: 600, color: (client.current_balance || 0) < 0 ? '#dc3545' : '#198754' }}>
                    {formatNumber(client.current_balance || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-auto d-flex justify-content-between gap-2">
                <Button
                  variant="outline-primary"
                  className="flex-grow-1 d-flex align-items-center justify-content-center"
                  onClick={() => handleShowModal(client)}
                  style={{ borderRadius: '8px' }}
                >
                  <FaEye style={{ marginRight: '6px' }} /> Ver
                </Button>
                <Button
                  variant="outline-secondary"
                  className="flex-grow-1 d-flex align-items-center justify-content-center"
                  onClick={() => updateClientSelect(client.id ?? 0)}
                  style={{ borderRadius: '8px' }}
                >
                  <FaEdit style={{ marginRight: '6px' }} /> Editar
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

export default ClientList;
