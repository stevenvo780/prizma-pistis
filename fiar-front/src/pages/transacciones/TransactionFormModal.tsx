import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaUser, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';
import useTransaction from '@store/transactions';
import useClient from '@store/client';
import useUI from '@/store/ui';
import ClientFormModal from '../client/ClientFormModal';
import { Client } from '@utils/types';

interface TransactionFormModalProps {
  show: boolean;
  onHide: () => void;
  clientId?: string;
  clientName?: string;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ show, onHide, clientId, clientName }) => {
  const { addTransaction } = useTransaction();
  const { setLoading, addAlert } = useUI();
  const { client, fetchClient, createClient, labels } = useClient();
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'income' | 'expense'>('income');
  const [status, setStatus] = useState<'approved' | 'pending'>('approved');
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState<Client>({} as Client);

  useEffect(() => {
    if (show) {
      fetchClient(1, 100, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!selectedClient || !selectedClient.id) {
        setError('Debe seleccionar un cliente');
        setLoading(false);
        return;
      }
      const tx: any = {
        amount: Number(amount),
        operation,
        status,
        detail: {},
        clientId: selectedClient.id,
      };
      await addTransaction(tx);
      addAlert({ type: 'success', message: `Transacción ${operation === 'income' ? 'abonada' : 'prestada'} correctamente` });
      onHide();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al procesar la transacción');
      }
    } finally {
      setLoading(false);
    }
  };

  const clientOptions = client.map((c) => ({
    value: c.id,
    label: `${c.name || ''} ${c.lastname || ''} (${c.document || ''})`,
    data: c,
  }));

  const handleCreateClient = async () => {
    try {
      await createClient(newClient);
      await fetchClient(1, 100, '');
      setSelectedClient({ ...newClient, id: client[client.length - 1]?.id });
      setShowClientModal(false);
      setNewClient({} as Client);
      addAlert({ type: 'success', message: 'Cliente creado y seleccionado.' });
    } catch (err) {
      addAlert({ type: 'danger', message: 'Error al crear cliente.' });
    }
  };

  const isIncome = operation === 'income';
  const operationColor = isIncome ? '#198754' : '#dc3545';

  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton style={{ backgroundColor: operationColor, color: 'white', borderBottom: 'none' }}>
          <Modal.Title className="d-flex align-items-center" style={{ color: 'white' }}>
            {isIncome
              ? <><FaArrowDown style={{ marginRight: 8 }} /> Registrar Abono</>
              : <><FaArrowUp style={{ marginRight: 8 }} /> Registrar Préstamo</>
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Selector de tipo de operación */}
          <div className="mb-4">
            <Row className="g-2">
              <Col xs={6}>
                <div
                  onClick={() => setOperation('expense')}
                  style={{
                    border: `2px solid ${!isIncome ? '#dc3545' : '#dee2e6'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: !isIncome ? '#fff5f5' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaArrowUp style={{ fontSize: '1.5rem', color: '#dc3545', marginBottom: 4 }} />
                  <div style={{ fontWeight: 600, color: '#dc3545' }}>Prestar</div>
                  <small style={{ color: '#6c757d' }}>Dar dinero al cliente</small>
                </div>
              </Col>
              <Col xs={6}>
                <div
                  onClick={() => setOperation('income')}
                  style={{
                    border: `2px solid ${isIncome ? '#198754' : '#dee2e6'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: isIncome ? '#f0fff4' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaArrowDown style={{ fontSize: '1.5rem', color: '#198754', marginBottom: 4 }} />
                  <div style={{ fontWeight: 600, color: '#198754' }}>Abonar</div>
                  <small style={{ color: '#6c757d' }}>Recibir pago del cliente</small>
                </div>
              </Col>
            </Row>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center" style={{ fontWeight: 600, color: '#495057' }}>
                <FaUser style={{ marginRight: '6px', color: '#6c757d' }} /> Cliente
              </Form.Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={clientOptions}
                    value={clientOptions.find(opt => opt.value === selectedClient?.id) || null}
                    onChange={opt => setSelectedClient(opt?.data || null)}
                    placeholder="Seleccione un cliente..."
                    isClearable
                  />
                </div>
                <Button variant="outline-primary" onClick={() => setShowClientModal(true)} style={{ borderRadius: '8px' }}>
                  + Nuevo
                </Button>
              </div>
              {selectedClient && (
                <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#6c757d' }}>Saldo disponible: </span>
                  <strong style={{ color: (selectedClient.current_balance || 0) >= 0 ? '#198754' : '#dc3545' }}>
                    {(selectedClient.current_balance || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                  </strong>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center" style={{ fontWeight: 600, color: '#495057' }}>
                <FaMoneyBillWave style={{ marginRight: '6px', color: '#6c757d' }} /> Monto (COP)
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                placeholder="0"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center" style={{ fontWeight: 600, color: '#495057' }}>
                <FaCheckCircle style={{ marginRight: '6px', color: '#6c757d' }} /> Estado
              </Form.Label>
              <Form.Select value={status} onChange={e => setStatus(e.target.value as 'approved' | 'pending')}>
                <option value="approved">Aprobado</option>
                <option value="pending">Pendiente</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={onHide} style={{ borderRadius: '8px' }}>Cancelar</Button>
              <Button
                type="submit"
                style={{ backgroundColor: operationColor, border: 'none', borderRadius: '8px', minWidth: '120px' }}
              >
                {isIncome
                  ? <><FaArrowDown style={{ marginRight: 6 }} /> Registrar Abono</>
                  : <><FaArrowUp style={{ marginRight: 6 }} /> Registrar Préstamo</>
                }
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ClientFormModal
        show={showClientModal}
        onHide={() => setShowClientModal(false)}
        isUpdating={false}
        client={newClient}
        labels={labels}
        handleInputChange={e => setNewClient({ ...newClient, [e.target.name]: e.target.value })}
        handleSelectChange={() => {}}
        handleSave={handleCreateClient}
        handleCancel={() => setShowClientModal(false)}
      />
    </>
  );
};

export default TransactionFormModal;