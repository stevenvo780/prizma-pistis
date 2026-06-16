import React, { FC } from 'react';
import { Button, Card, CardBody, Badge } from 'prizma-ui';
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
  deleteClient,
}) => (
  <>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {client?.map((client, idx) => (
        <div key={idx} style={{ flex: '1 1 240px', maxWidth: '300px' }}>
          <Card
            interactive
            className={styles['client-card']}
            style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
          >
            <CardBody style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
                {client.blocked && <Badge tone="danger">Bloqueado</Badge>}
              </div>

              <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#595959', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <FaMoneyBillWave style={{ marginRight: '6px' }} /> Límite:
                  </span>
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>{formatNumber(client.credit_limit || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#595959', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <FaWallet style={{ marginRight: '6px' }} /> Saldo:
                  </span>
                  <span style={{ fontWeight: 600, color: (client.current_balance || 0) < 0 ? '#dc3545' : '#198754' }}>
                    {formatNumber(client.current_balance || 0)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <Button
                  variant="ghost"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                  onClick={() => handleShowModal(client)}
                >
                  <FaEye style={{ marginRight: '6px' }} /> Ver
                </Button>
                <Button
                  variant="secondary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                  onClick={() => updateClientSelect(client.id ?? 0)}
                >
                  <FaEdit style={{ marginRight: '6px' }} /> Editar
                </Button>
                <Button
                  variant="danger"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar al cliente ${client.name} ${client.lastname || ''}? Esta acción no se puede deshacer.`)) {
                      deleteClient(client.id ?? 0);
                    }
                  }}
                >
                  <FaTrashAlt style={{ marginRight: '6px' }} /> Eliminar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  </>
);

export default ClientList;
