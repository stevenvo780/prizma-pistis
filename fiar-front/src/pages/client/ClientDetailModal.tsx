import { FC, useState, useEffect } from 'react';
import { Modal, Button, Card, CardBody, Badge, Spinner } from 'prizma-ui';
import { FaTrashAlt, FaArrowDown, FaArrowUp, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaMoneyBillWave, FaWallet, FaShieldAlt, FaBan, FaCalendarAlt } from 'react-icons/fa';
import { Client, Transaction } from '@utils/types';
import { getClientByIdAPI } from '@/api/client';
import useClient from '@store/client';
import styles from '@styles/ClientDetailModal.module.css';

const formatCurrency = (amount: number) =>
  amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const OperationBadge = ({ operation }: { operation?: 'income' | 'expense' }) => {
  if (operation === 'income') {
    return (
      <Badge tone="success">
        <FaArrowDown style={{ marginRight: 4 }} />
        Abono
      </Badge>
    );
  }
  if (operation === 'expense') {
    return (
      <Badge tone="danger">
        <FaArrowUp style={{ marginRight: 4 }} />
        Préstamo
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      Desconocido
    </Badge>
  );
};

// Definición de las propiedades que recibe el componente
interface ClientDetailModalProps {
  show: boolean; // Controla si el modal está visible
  onHide: () => void; // Función para cerrar el modal
  client: Client | null; // Información del cliente
}

// Componente funcional que recibe las propiedades
const ClientDetailModal: FC<ClientDetailModalProps> = ({ show, onHide, client }) => {
  const [clientDetail, setClientDetail] = useState<Client | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const { deleteClient } = useClient();

  useEffect(() => {
    if (show && client?.id) {
      setLoadingTx(true);
      getClientByIdAPI(client.id)
        .then((res) => setClientDetail(res.data))
        .catch(() => setClientDetail(client))
        .finally(() => setLoadingTx(false));
    } else {
      setClientDetail(null);
    }
  }, [show, client?.id]);

  const activeClient = clientDetail ?? client;

  // Eliminar cliente: llama a la API y actualiza el store, luego cierra el modal
  const handleDeleteClient = async (clientId: number) => {
    const name = activeClient ? `${activeClient.name} ${activeClient.lastname || ''}`.trim() : 'este cliente';
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    await deleteClient(clientId);
    onHide();
  };

  return (
    <Modal
      open={show}
      onClose={onHide}
      title="Detalles del Cliente"
      footer={
        <>
          <Button
            variant="danger"
            className={styles.btnDelete}
            onClick={() => handleDeleteClient(activeClient?.id ?? 0)}
          >
            <FaTrashAlt style={{ marginRight: '5px' }} /> Eliminar
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </>
      }
    >
      {activeClient && (
        <>
          {/* Cabecera de cliente */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
              <FaUser style={{ fontSize: '1.6rem', color: '#6c757d' }} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>{activeClient.name} {activeClient.lastname}</h5>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                {activeClient.trusted && <Badge tone="success"><FaShieldAlt style={{ marginRight: 4 }} />Confiable</Badge>}
                {activeClient.blocked && <Badge tone="danger"><FaBan style={{ marginRight: 4 }} />Bloqueado</Badge>}
                {!activeClient.trusted && !activeClient.blocked && <Badge tone="neutral">Cliente regular</Badge>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            {/* Tarjetas de saldo */}
            <div style={{ flex: 1, backgroundColor: '#fff5f5', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #f5c6cb' }}>
              <FaMoneyBillWave style={{ color: '#dc3545', marginBottom: 4, fontSize: '1.3rem' }} />
              <div style={{ fontSize: '0.75rem', color: '#595959' }}>Limite de credito</div>
              <div style={{ fontWeight: 700, color: '#dc3545', fontSize: '1.1rem' }}>{formatCurrency(activeClient.credit_limit || 0)}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: (activeClient.current_balance || 0) >= 0 ? '#f0fff4' : '#fff5f5', borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${(activeClient.current_balance || 0) >= 0 ? '#c3e6cb' : '#f5c6cb'}` }}>
              <FaWallet style={{ color: (activeClient.current_balance || 0) >= 0 ? '#198754' : '#dc3545', marginBottom: 4, fontSize: '1.3rem' }} />
              <div style={{ fontSize: '0.75rem', color: '#595959' }}>Saldo disponible</div>
              <div style={{ fontWeight: 700, color: (activeClient.current_balance || 0) >= 0 ? '#198754' : '#dc3545', fontSize: '1.1rem' }}>{formatCurrency(activeClient.current_balance || 0)}</div>
            </div>
          </div>

          {/* Información de contacto */}
          <Card style={{ marginBottom: '12px' }}>
            <CardBody>
              <h6 style={{ color: '#595959', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Información de contacto</h6>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeClient.document && (
                  <div style={{ flex: '1 1 45%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaIdCard style={{ color: '#6c757d', minWidth: 16 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#595959' }}>Documento</div>
                        <div style={{ fontWeight: 600 }}>{activeClient.document}</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeClient.phone && (
                  <div style={{ flex: '1 1 45%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaPhone style={{ color: '#6c757d', minWidth: 16 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#595959' }}>Telefono</div>
                        <div style={{ fontWeight: 600 }}>{activeClient.phone}</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeClient.email && (
                  <div style={{ flex: '1 1 45%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaEnvelope style={{ color: '#6c757d', minWidth: 16 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#595959' }}>Correo</div>
                        <div style={{ fontWeight: 600 }}>{activeClient.email}</div>
                      </div>
                    </div>
                  </div>
                )}
                {(activeClient.city || activeClient.state || activeClient.direction) && (
                  <div style={{ flex: '1 1 45%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaMapMarkerAlt style={{ color: '#6c757d', minWidth: 16 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#595959' }}>Ubicacion</div>
                        <div style={{ fontWeight: 600 }}>{[activeClient.direction, activeClient.city, activeClient.state].filter(Boolean).join(', ')}</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeClient.created_at && (
                  <div style={{ flex: '1 1 45%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaCalendarAlt style={{ color: '#6c757d', minWidth: 16 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#595959' }}>Registrado</div>
                        <div style={{ fontWeight: 600 }}>{new Date(activeClient.created_at).toLocaleDateString('es-CO')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Historial de Transacciones */}
          <Card>
            <CardBody>
              <h6 style={{ color: '#595959', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Últimas transacciones</h6>
              {loadingTx ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Spinner size={20} />
                </div>
              ) : activeClient.transactions && activeClient.transactions.length > 0 ? (
                <div>
                  {activeClient.transactions.map((transaction: Transaction, index: number) => (
                    <div key={transaction.id || index} style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f3f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: transaction.operation === 'income' ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {transaction.operation === 'income'
                              ? <FaArrowDown style={{ color: '#198754' }} />
                              : <FaArrowUp style={{ color: '#dc3545' }} />
                            }
                          </div>
                          <div>
                            <OperationBadge operation={transaction.operation} />
                            <div style={{ fontSize: '0.75rem', color: '#595959', marginTop: 2 }}>
                              <FaCalendarAlt style={{ marginRight: 4 }} />{new Date(transaction.createdAt!).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: transaction.operation === 'income' ? '#198754' : '#dc3545' }}>
                            {transaction.operation === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#595959' }}>{transaction.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#595959', textAlign: 'center', margin: 0 }}>Sin transacciones registradas.</p>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </Modal>
  );
};

export default ClientDetailModal;
