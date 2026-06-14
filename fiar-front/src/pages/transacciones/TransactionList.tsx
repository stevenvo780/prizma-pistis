import React, { FC, useState, useEffect } from 'react';
import { Row, Col, Card, Dropdown, Button, Badge, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { FaInfoCircle, FaCheckCircle, FaTimesCircle, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Transaction as TransactionBase } from '@utils/types';
import styles from '@styles/Transactions.module.css';
import useUI from '@/store/ui';

interface Client {
  name?: string;
  email?: string;
}
interface Transaction extends TransactionBase {
  client?: Client;
}

interface TransactionListProps {
  transactions: Transaction[];
  onStatusChange: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
}

const TransactionList: FC<TransactionListProps> = ({ transactions, onStatusChange }) => {
  const { addAlert } = useUI();
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const formatCurrency = (amount: number | string | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
    return num.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => (
    <Badge pill bg={
      status === 'approved' ? 'success'
      : status === 'rejected' ? 'danger'
      : 'warning'
    }>
      {status === 'approved' ? (
        <>
          <FaCheckCircle style={{ marginRight: 4 }} />
          Aprobado
        </>
      ) : status === 'rejected' ? (
        <>
          <FaTimesCircle style={{ marginRight: 4 }} />
          Rechazado
        </>
      ) : (
        <>
          <FaInfoCircle style={{ marginRight: 4 }} />
          Pendiente
        </>
      )}
    </Badge>
  );

  const OperationBadge = ({ operation }: { operation?: 'income' | 'expense' }) => {
    if (operation === 'income') {
      return (
        <Badge pill bg="success" style={{ backgroundColor: '#198754', color: 'white' }}>
          <FaArrowDown style={{ marginRight: 4 }} />
          Abono
        </Badge>
      );
    }
    if (operation === 'expense') {
      return (
        <Badge pill bg="danger" style={{ backgroundColor: '#dc3545', color: 'white' }}>
          <FaArrowUp style={{ marginRight: 4 }} />
          Préstamo
        </Badge>
      );
    }
    return (
      <Badge pill bg="secondary">
        Desconocido
      </Badge>
    );
  };

  const handleStatusChange = async (id: Transaction['id'], newStatus: 'pending' | 'approved' | 'rejected') => {
    const prevStatus = localTransactions.find(tx => tx.id === id)?.status;
    setLocalTransactions(prev =>
      prev.map(tx =>
        tx.id === id ? { ...tx, status: newStatus } : tx
      )
    );
    try {
      await onStatusChange(id, newStatus);
    } catch (err: any) {
      setLocalTransactions(prev =>
        prev.map(tx =>
          tx.id === id ? { ...tx, status: prevStatus! } : tx
        )
      );
      const msg = err.response?.data?.message || 'Error al actualizar el estado de la transacción';
      addAlert({ type: 'danger', message: msg });
    }
  };

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Abre detalle de transacción
  const handleShowHistory = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowHistoryModal(true);
  };

  return (
    <>
      {/* Lista de transacciones */}
      <Row>
        {localTransactions.map((transaction, idx) => (
          <Col key={transaction.id ?? idx} xs={12} md={4} lg={3} className="mb-3">
            <Card
              className={styles['transaction-card']}
              style={{
                boxShadow: '0 2px 10px #e3e3e3',
                borderRadius: 16,
                transition: 'box-shadow 0.2s, background 0.2s',
                background: '#f7f9fa'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#e9ecef'; // gris claro, baja saturación
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px #d1d1d1';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#f7f9fa';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px #e3e3e3';
              }}
            >
              <Card.Body className="d-flex flex-column justify-content-between h-100">
                {/* Cliente */}
                {transaction.client?.name && (
                  <div className={styles['data-row']} style={{ marginBottom: 8 }}>
                    <span className={styles['data-label']}>Cliente:</span>
                    <span className={styles['data-value']} style={{ fontWeight: 600 }}>
                      {transaction.client.name}
                    </span>
                  </div>
                )}
                {/* Información de la transacción */}
                <div className={styles['data-row']} style={{ marginBottom: 8 }}>
                  <span className={styles['data-label']}>Tipo:</span>
                  <span className={styles['data-value']}>
                    <OperationBadge operation={transaction.operation} />
                  </span>
                </div>
                <div className={styles['data-row']} style={{ marginBottom: 8 }}>
                  <span className={styles['data-label']}>Monto:</span>
                  <span className={styles['data-value']} style={{ fontWeight: 600, color: transaction.operation === 'income' ? '#198754' : transaction.operation === 'expense' ? '#dc3545' : '#6c757d' }}>
                    {transaction.operation === 'income' ? '+' : transaction.operation === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className={styles['data-row']} style={{ marginBottom: 8 }}>
                  <span className={styles['data-label']}>Estado:</span>
                  <span className={styles['data-value']}>
                    <StatusBadge status={transaction.status} />
                  </span>
                </div>
                <div className={styles['data-row']} style={{ marginBottom: 8 }}>
                  <span className={styles['data-label']}>Fecha:</span>
                  <span className={styles['data-value']}>{' '}
                    {transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString()
                      : 'Sin fecha'}
                  </span>
                </div>

                {/* Dropdown de aprobación y Botón Ver más en una fila */}
                <div className="mt-2">
                  <Row>
                    <Col xs={7}>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant={
                            transaction.status === 'approved' ? 'success'
                            : transaction.status === 'rejected' ? 'danger'
                            : 'warning'
                          }
                          id={`dropdown-status-${transaction.id}`}
                          size="sm"
                          className="w-100"
                          style={{ borderRadius: 8 }}
                        >
                          {transaction.status === 'approved' ? 'Aprobado'
                            : transaction.status === 'rejected' ? 'Rechazado'
                            : 'Pendiente'
                          }
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            active={transaction.status === 'approved'}
                            onClick={() => handleStatusChange(transaction.id, 'approved')}
                          >
                            <FaCheckCircle style={{ color: '#198754', marginRight: 6 }} />
                            Aprobado
                          </Dropdown.Item>
                          <Dropdown.Item
                            active={transaction.status === 'pending'}
                            onClick={() => handleStatusChange(transaction.id, 'pending')}
                          >
                            <FaInfoCircle style={{ color: '#ffc107', marginRight: 6 }} />
                            Pendiente
                          </Dropdown.Item>
                          <Dropdown.Item
                            active={transaction.status === 'rejected'}
                            onClick={() => handleStatusChange(transaction.id, 'rejected')}
                          >
                            <FaTimesCircle style={{ color: '#dc3545', marginRight: 6 }} />
                            Rechazado
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                    <Col xs={5}>
                      <Button
                        variant="info"
                        size="sm"
                        className="w-100"
                        onClick={() => handleShowHistory(transaction)}
                      >
                        <FaInfoCircle style={{ marginRight: 4 }} /> Detalle
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de historial */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title>
            <FaInfoCircle style={{ color: '#3aafa9', marginRight: 8 }} />
            Historial de Transacción
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction ? (
            <div>
              {/* Bloque de información de la transacción */}
              <div style={{
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e3e3e3',
                paddingBottom: '1rem',
                background: '#f8f9fa',
                borderRadius: 8,
                padding: 12
              }}>
                <h6 className="mb-2" style={{ color: '#17252a' }}>Datos de la Transacción</h6>
                <div><strong>ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Tipo:</strong> <OperationBadge operation={selectedTransaction.operation} /></div>
                <div><strong>Monto:</strong> {formatCurrency(selectedTransaction.amount)}</div>
                <div><strong>Status:</strong> <StatusBadge status={selectedTransaction.status} /></div>
                <div><strong>Created At:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}</div>
                <div><strong>Updated At:</strong> {new Date(selectedTransaction.updatedAt).toLocaleString()}</div>
                <div><strong>Txn Hash:</strong> {selectedTransaction.txn_hash}</div>
                <div><strong>Owner ID:</strong> {selectedTransaction.owner_id}</div>
                <div><strong>Detail:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fff', padding: 8, borderRadius: 4 }}>
                    {JSON.stringify(selectedTransaction.detail, null, 2)}
                  </pre>
                </div>
              </div>
              {/* Bloque de información del cliente */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: 8,
                padding: 12
              }}>
                <h6 className="mb-2" style={{ color: '#17252a' }}>Datos del Cliente</h6>
                {selectedTransaction.client ? (
                  <>
                    <div><strong>Nombre:</strong> {selectedTransaction.client.name}</div>
                    <div><strong>Correo:</strong> {selectedTransaction.client.email}</div>
                  </>
                ) : (
                  <div>No client information available.</div>
                )}
              </div>
            </div>
          ) : (
            <div>No hay información de la transacción.</div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button variant="outline-secondary" onClick={() => setShowHistoryModal(false)} style={{ borderRadius: 8 }}>
            <p style={{ margin: 0, color: 'black' }}>Cerrar</p>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TransactionList;
