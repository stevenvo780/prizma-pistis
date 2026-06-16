import React, { FC, useState, useEffect } from 'react';
import { Card, CardBody, Badge, Button, Modal, DropdownMenu, DropdownItem } from 'prizma-ui';
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
    <Badge tone={
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
    return <Badge tone="neutral">Desconocido</Badge>;
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {localTransactions.map((transaction, idx) => (
          <Card
            key={transaction.id ?? idx}
            interactive
            style={{
              boxShadow: '0 2px 10px #e3e3e3',
              borderRadius: 16,
            }}
          >
            <CardBody style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
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
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <div style={{ flex: '0 0 58%' }}>
                  <DropdownMenu
                    trigger={
                      <Button
                        variant={
                          transaction.status === 'approved' ? 'secondary'
                          : transaction.status === 'rejected' ? 'danger'
                          : 'accent'
                        }
                        size="sm"
                        block
                        style={{ borderRadius: 8 }}
                      >
                        {transaction.status === 'approved' ? 'Aprobado'
                          : transaction.status === 'rejected' ? 'Rechazado'
                          : 'Pendiente'
                        }
                      </Button>
                    }
                  >
                    <DropdownItem
                      icon={<FaCheckCircle style={{ color: '#198754' }} />}
                      onSelect={() => handleStatusChange(transaction.id, 'approved')}
                    >
                      Aprobado
                    </DropdownItem>
                    <DropdownItem
                      icon={<FaInfoCircle style={{ color: '#ffc107' }} />}
                      onSelect={() => handleStatusChange(transaction.id, 'pending')}
                    >
                      Pendiente
                    </DropdownItem>
                    <DropdownItem
                      icon={<FaTimesCircle style={{ color: '#dc3545' }} />}
                      onSelect={() => handleStatusChange(transaction.id, 'rejected')}
                    >
                      Rechazado
                    </DropdownItem>
                  </DropdownMenu>
                </div>
                <div style={{ flex: '0 0 40%' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    block
                    onClick={() => handleShowHistory(transaction)}
                    leftIcon={<FaInfoCircle />}
                  >
                    Detalle
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal de historial */}
      <Modal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={
          <>
            <FaInfoCircle style={{ color: '#3aafa9', marginRight: 8 }} />
            Historial de Transacción
          </>
        }
        footer={
          <Button variant="ghost" onClick={() => setShowHistoryModal(false)} style={{ borderRadius: 8 }}>
            Cerrar
          </Button>
        }
      >
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
              <h6 style={{ marginBottom: 8, color: '#17252a' }}>Datos de la Transacción</h6>
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
            <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
              <h6 style={{ marginBottom: 8, color: '#17252a' }}>Datos del Cliente</h6>
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
      </Modal>
    </>
  );
};

export default TransactionList;
