import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Select, Field, Input } from 'prizma-ui';
import { FaArrowDown, FaArrowUp, FaUser, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import ReactSelect from 'react-select';
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

    // Validar cliente
    if (!selectedClient || !selectedClient.id) {
      setError('Debe seleccionar un cliente');
      return;
    }

    // Validar monto antes de hacer setLoading
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(parsedAmount)) {
      setError('El monto debe ser un número mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const tx: any = {
        amount: parsedAmount,
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
      // Call createClient and wait for it to complete
      await createClient(newClient);

      // Fetch fresh client list to ensure we have the new client with correct ID
      await fetchClient(1, 100, '');

      // Find the newly created client in the fetched list by matching name/document
      const createdClient = client.find(
        (c: Client) => c.name === newClient.name && c.document === newClient.document
      );

      if (createdClient?.id) {
        setSelectedClient(createdClient);
      } else {
        // Fallback: assume last client if exact match not found
        const lastClient = client[client.length - 1];
        if (lastClient) {
          setSelectedClient(lastClient);
        }
      }

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
      <Modal
        open={show}
        onClose={onHide}
        title={
          <span style={{ color: 'white' }}>
            {isIncome
              ? <><FaArrowDown style={{ marginRight: 8 }} /> Registrar Abono</>
              : <><FaArrowUp style={{ marginRight: 8 }} /> Registrar Préstamo</>
            }
          </span>
        }
        style={{ '--modal-header-bg': operationColor } as Record<string, string>}
      >
        {error && (
          <Alert tone="danger" style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}

        {/* Selector de tipo de operación */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              role="radio"
              aria-checked={!isIncome}
              onClick={() => setOperation('expense')}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOperation('expense'); } }}
              style={{
                border: `2px solid ${!isIncome ? '#dc3545' : '#dee2e6'}`,
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: !isIncome ? '#fff5f5' : 'white',
                transition: 'all 0.2s',
                background: !isIncome ? '#fff5f5' : 'white',
              }}
            >
              <FaArrowUp style={{ fontSize: '1.5rem', color: '#dc3545', marginBottom: 4 }} aria-hidden="true" />
              <div style={{ fontWeight: 600, color: '#dc3545' }}>Prestar</div>
              <small style={{ color: '#6c757d' }}>Dar dinero al cliente</small>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isIncome}
              onClick={() => setOperation('income')}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOperation('income'); } }}
              style={{
                border: `2px solid ${isIncome ? '#198754' : '#dee2e6'}`,
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: isIncome ? '#f0fff4' : 'white',
                transition: 'all 0.2s',
                background: isIncome ? '#f0fff4' : 'white',
              }}
            >
              <FaArrowDown style={{ fontSize: '1.5rem', color: '#198754', marginBottom: 4 }} aria-hidden="true" />
              <div style={{ fontWeight: 600, color: '#198754' }}>Abonar</div>
              <small style={{ color: '#6c757d' }}>Recibir pago del cliente</small>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Field
            label={
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#495057' }}>
                <FaUser style={{ marginRight: 6, color: '#6c757d' }} /> Cliente
              </span>
            }
            style={{ marginBottom: 12 }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                {/* react-select kept for searchable combobox — prizma-ui Select is a native <select> */}
                <ReactSelect
                  options={clientOptions}
                  value={clientOptions.find(opt => opt.value === selectedClient?.id) || null}
                  onChange={opt => setSelectedClient(opt?.data || null)}
                  placeholder="Seleccione un cliente..."
                  isClearable
                />
              </div>
              <Button variant="ghost" onClick={() => setShowClientModal(true)} style={{ borderRadius: '8px' }}>
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
          </Field>

          <Field
            label={
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#495057' }}>
                <FaMoneyBillWave style={{ marginRight: 6, color: '#6c757d' }} /> Monto (COP)
              </span>
            }
            style={{ marginBottom: 12 }}
          >
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              placeholder="0"
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            />
          </Field>

          <Field
            label={
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#495057' }}>
                <FaCheckCircle style={{ marginRight: 6, color: '#6c757d' }} /> Estado
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <Select value={status} onChange={e => setStatus((e.target as HTMLSelectElement).value as 'approved' | 'pending')}>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
            </Select>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" onClick={onHide} style={{ borderRadius: '8px' }}>Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: operationColor, border: 'none', borderRadius: '8px', minWidth: '120px' }}
              leftIcon={isIncome ? <FaArrowDown /> : <FaArrowUp />}
            >
              {isIncome ? 'Registrar Abono' : 'Registrar Préstamo'}
            </Button>
          </div>
        </form>
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
