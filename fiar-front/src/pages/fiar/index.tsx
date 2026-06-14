import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { withAuthSync } from '@utils/auth';
import { useRouter } from 'next/router';
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineUserAdd,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import useClient from '@store/client';
import useTransaction from '@store/transactions';
import useUI from '@store/ui';
import { Client } from '@utils/types';
import ClientFormModal from '../client/ClientFormModal';
import styles from '@styles/QuickAction.module.css';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

type Step = 'operation' | 'client' | 'amount' | 'confirm' | 'done';

const FiarPage: React.FC = () => {
  const router = useRouter();
  const { client, fetchClient, createClient, labels } = useClient();
  const { addTransaction } = useTransaction();
  const { addAlert, setLoading } = useUI();

  const [step, setStep] = useState<Step>('operation');
  const [operation, setOperation] = useState<'income' | 'expense'>('expense');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState<Client>({} as Client);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClient(1, 200, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-focus inputs when step changes
  useEffect(() => {
    if (step === 'client') setTimeout(() => searchRef.current?.focus(), 100);
    if (step === 'amount') setTimeout(() => amountRef.current?.focus(), 100);
  }, [step]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return client as Client[];
    const q = search.toLowerCase().trim();
    return (client as Client[]).filter(c =>
      `${c.name} ${c.lastname} ${c.document}`.toLowerCase().includes(q)
    );
  }, [client, search]);

  const handleSelectClient = useCallback((c: Client) => {
    setSelectedClient(c);
    setSearch('');
    setStep('amount');
  }, []);

  const handleQuickAmount = useCallback((n: number) => {
    setAmount(String(n));
  }, []);

  const handleSubmit = async () => {
    if (!selectedClient?.id || !amount || Number(amount) <= 0) return;
    setError(null);
    setSubmitting(true);
    setLoading(true);
    try {
      const tx: any = {
        amount: Number(amount),
        operation,
        status: 'approved',
        detail: {},
        clientId: selectedClient.id,
      };
      const result = await addTransaction(tx);
      setLastTxId((result as any)?.id || null);
      setStep('done');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al registrar la transaccion';
      setError(msg);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('operation');
    setSelectedClient(null);
    setAmount('');
    setSearch('');
    setError(null);
    setLastTxId(null);
  };

  const handleCreateClient = async () => {
    try {
      await createClient(newClient);
      await fetchClient(1, 200, '');
      setShowNewClient(false);
      setNewClient({} as Client);
      addAlert({ type: 'success', message: 'Cliente creado. Ahora seleccionalo.' });
    } catch {
      addAlert({ type: 'danger', message: 'Error al crear cliente.' });
    }
  };

  const isExpense = operation === 'expense';
  const accentColor = isExpense ? '#dc3545' : '#198754';
  const amountNum = Number(amount) || 0;

  return (
    <div className={styles.quickActionPage}>
      {/* Page title */}
      <div style={{ marginBottom: 24, paddingTop: 8 }}>
        <h2 style={{ fontWeight: 700, color: '#2c3e50', marginBottom: 4, fontSize: '1.4rem' }}>
          Fiar rapido
        </h2>
        <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
          Registra un prestamo o abono en segundos
        </p>
      </div>

      {/* Step: DONE */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: isExpense ? '#fff5f5' : '#f0fff4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: accentColor,
          }}>
            <HiOutlineCheckCircle size={48} />
          </div>
          <h4 style={{ fontWeight: 700, color: '#2c3e50', marginBottom: 8 }}>
            {isExpense ? 'Prestamo registrado' : 'Abono registrado'}
          </h4>
          <p style={{ color: '#6c757d', marginBottom: 4 }}>
            <strong>{selectedClient?.name} {selectedClient?.lastname}</strong>
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: accentColor, marginBottom: 24 }}>
            {formatCurrency(amountNum)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={handleReset}
              style={{
                backgroundColor: accentColor, border: 'none',
                borderRadius: '10px', fontWeight: 600, padding: '10px 24px',
              }}
            >
              Nueva operacion
            </Button>
            <Button
              variant="outline-secondary"
              style={{ borderRadius: '10px', fontWeight: 600, padding: '10px 24px' }}
              onClick={() => router.push('/transacciones')}
            >
              Ver historial
            </Button>
          </div>
        </div>
      )}

      {step !== 'done' && (
        <>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {(['operation', 'client', 'amount', 'confirm'] as Step[]).map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 4,
                backgroundColor: ['operation', 'client', 'amount', 'confirm'].indexOf(step) >= i ? accentColor : '#e9ecef',
                transition: 'background-color 0.3s',
              }} />
            ))}
          </div>

          {/* STEP 1: Operation type */}
          {step === 'operation' && (
            <div>
              <p className={styles.sectionTitle}>Que quieres hacer?</p>
              <div className={styles.operationToggle}>
                <button
                  className={`${styles.opBtnExpense} ${isExpense ? styles.opBtnExpenseActive : ''}`}
                  onClick={() => { setOperation('expense'); setStep('client'); }}
                >
                  <HiOutlineArrowTrendingUp size={22} />
                  <div style={{ textAlign: 'left' }}>
                    <div>Prestar</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>
                      Dar dinero al cliente
                    </div>
                  </div>
                </button>
                <button
                  className={`${styles.opBtnIncome} ${!isExpense ? styles.opBtnIncomeActive : ''}`}
                  onClick={() => { setOperation('income'); setStep('client'); }}
                >
                  <HiOutlineArrowTrendingDown size={22} />
                  <div style={{ textAlign: 'left' }}>
                    <div>Abonar</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>
                      Recibir pago
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Client selection */}
          {step === 'client' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => setStep('operation')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: 0 }}
                >
                  ← Volver
                </button>
                <span style={{ fontSize: '0.85rem', color: accentColor, fontWeight: 700 }}>
                  {isExpense ? 'Prestamo' : 'Abono'}
                </span>
              </div>
              <p className={styles.sectionTitle}>Selecciona el cliente</p>
              <div className={styles.searchWrapper}>
                <HiOutlineSearch size={18} className={styles.searchIcon} />
                <Form.Control
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar por nombre o cedula..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {filteredClients.length === 0 && search.length > 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineUser size={32} className={styles.emptyIcon} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Sin resultados para &quot;{search}&quot;</p>
                </div>
              ) : (
                <div className={styles.clientGrid}>
                  {filteredClients.slice(0, 24).map(c => (
                    <button
                      key={c.id}
                      className={`${styles.clientCard} ${selectedClient?.id === c.id ? styles.clientCardSelected : ''}`}
                      onClick={() => handleSelectClient(c)}
                    >
                      <div className={styles.clientAvatar}>
                        <HiOutlineUser size={20} />
                      </div>
                      <div className={styles.clientName}>{c.name} {c.lastname || ''}</div>
                      <div className={styles.clientBalance}>
                        {formatCurrency(Number(c.current_balance) || 0)}
                      </div>
                    </button>
                  ))}
                  {/* New client button */}
                  <button className={styles.newClientBtn} onClick={() => setShowNewClient(true)}>
                    <HiOutlineUserAdd size={22} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nuevo cliente</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Amount */}
          {step === 'amount' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => setStep('client')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: 0 }}
                >
                  ← Volver
                </button>
                <span style={{ fontSize: '0.85rem', color: accentColor, fontWeight: 700 }}>
                  {isExpense ? 'Prestamo' : 'Abono'} · {selectedClient?.name} {selectedClient?.lastname}
                </span>
              </div>

              {/* Client summary */}
              <div className={styles.summaryPanel}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Cliente</span>
                  <span className={styles.summaryValue}>{selectedClient?.name} {selectedClient?.lastname}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Saldo actual</span>
                  <span className={styles.summaryValue} style={{ color: (Number(selectedClient?.current_balance) || 0) >= 0 ? '#198754' : '#dc3545' }}>
                    {formatCurrency(Number(selectedClient?.current_balance) || 0)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Limite de credito</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(Number(selectedClient?.credit_limit) || 0)}
                  </span>
                </div>
              </div>

              <div className={styles.amountSection}>
                <p className={styles.sectionTitle}>Cuanto?</p>
                <div className={styles.amountInputWrap}>
                  <span className={styles.amountPrefix}>$</span>
                  <Form.Control
                    ref={amountRef}
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className={styles.amountInput}
                    placeholder="0"
                    onKeyDown={e => e.key === 'Enter' && amount && Number(amount) > 0 && setStep('confirm')}
                  />
                </div>
                <div className={styles.quickAmounts}>
                  {QUICK_AMOUNTS.map(n => (
                    <button
                      key={n}
                      className={styles.quickAmountBtn}
                      onClick={() => handleQuickAmount(n)}
                    >
                      {n >= 1000 ? `${n / 1000}k` : n}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className={isExpense ? styles.submitBtnExpense : styles.submitBtnIncome}
                disabled={!amount || Number(amount) <= 0}
                onClick={() => setStep('confirm')}
              >
                <HiOutlineCurrencyDollar size={20} />
                Continuar
              </Button>
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 'confirm' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button
                  onClick={() => setStep('amount')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: 0 }}
                >
                  ← Volver
                </button>
                <span style={{ fontSize: '0.85rem', color: accentColor, fontWeight: 700 }}>
                  Confirmar operacion
                </span>
              </div>

              <div style={{
                backgroundColor: '#f8f9fa', borderRadius: '16px',
                padding: '24px', marginBottom: 24, textAlign: 'center',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  backgroundColor: isExpense ? '#fff5f5' : '#f0fff4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', color: accentColor,
                }}>
                  {isExpense
                    ? <HiOutlineArrowTrendingUp size={32} />
                    : <HiOutlineArrowTrendingDown size={32} />
                  }
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: 4 }}>
                  {isExpense ? 'Prestando a' : 'Abono de'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50', marginBottom: 12 }}>
                  {selectedClient?.name} {selectedClient?.lastname}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: accentColor }}>
                  {formatCurrency(amountNum)}
                </div>
              </div>

              <div className={styles.summaryPanel} style={{ marginBottom: 20 }}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Saldo antes</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(Number(selectedClient?.current_balance) || 0)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Saldo despues (estimado)</span>
                  <span className={styles.summaryValue} style={{ color: accentColor }}>
                    {formatCurrency(
                      isExpense
                        ? (Number(selectedClient?.current_balance) || 0) - amountNum
                        : (Number(selectedClient?.current_balance) || 0) + amountNum
                    )}
                  </span>
                </div>
              </div>

              <Button
                className={isExpense ? styles.submitBtnExpense : styles.submitBtnIncome}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <Spinner size="sm" animation="border" />
                  : <><HiOutlineCheckCircle size={20} /> Confirmar {isExpense ? 'Prestamo' : 'Abono'}</>
                }
              </Button>
            </div>
          )}
        </>
      )}

      {/* New client modal */}
      <ClientFormModal
        show={showNewClient}
        onHide={() => setShowNewClient(false)}
        isUpdating={false}
        client={newClient}
        labels={labels}
        handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, [e.target.name]: e.target.value })}
        handleSelectChange={() => {}}
        handleSave={handleCreateClient}
        handleCancel={() => setShowNewClient(false)}
      />
    </div>
  );
};

export default withAuthSync(FiarPage);
