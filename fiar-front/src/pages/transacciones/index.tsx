import { useState, ChangeEvent, FC, useEffect } from 'react';
import Head from 'next/head';
import { Button, Input, Select, Badge, Field, Pagination } from 'prizma-ui';
import { FaPlus, FaSearch, FaSortAmountDown, FaFilter, FaFileExcel, FaTimes } from 'react-icons/fa';
import { withAuthSync } from '@utils/auth';
import TransactionList from './TransactionList';
import useTransaction from '@store/transactions';
import useUI from '@/store/ui';
import styles from '@styles/Transactions.module.css';
import TransactionFormModal from './TransactionFormModal';

const Transactions: FC = () => {
  const { setLoading, addAlert } = useUI();
  const {
    transactions,
    page,
    lastPage,
    fetchTransactions,
    downloadExcel,
    updateTransaction
  } = useTransaction();

  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(page);
  const [order, setOrder] = useState<'reciente' | 'antiguo'>('reciente');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aprobado' | 'no_aprobado'>('todos');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{id?: string, name?: string}>({});

  useEffect(() => {
    fetchTransactions(
      currentPage,
      limit,
      search,
      order,
      statusFilter,
      minAmount ? Number(minAmount) : undefined,
      maxAmount ? Number(maxAmount) : undefined,
      startDate || undefined,
      endDate || undefined
    );
  }, [currentPage, limit, search, order, statusFilter, minAmount, maxAmount, startDate, endDate, fetchTransactions]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    setCurrentPage(1);
  };

  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      await downloadExcel(
        1,
        10000,
        search,
        order,
        statusFilter,
        minAmount ? Number(minAmount) : undefined,
        maxAmount ? Number(maxAmount) : undefined,
        startDate || undefined,
        endDate || undefined
      );
      addAlert({ type: 'success', message: 'Excel descargado correctamente' });
    } catch (err) {
      console.error('Error al descargar Excel:', err);
      addAlert({ type: 'danger', message: 'Error al descargar Excel' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  const handleChangeTransactionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      setLoading(true);
      await updateTransaction(id, { status });
      const statusLabel = { approved: 'Aprobado', pending: 'Pendiente', rejected: 'Rechazado' };
      addAlert({
        type: 'success',
        message: `Transacción marcada como ${statusLabel[status] || status}`
      });
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      addAlert({ type: 'danger', message: err?.response?.data?.message || 'Error al actualizar estado de transacción' });
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setOrder('reciente');
    setStatusFilter('todos');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const advancedFilterCount = [minAmount, maxAmount, startDate, endDate].filter(Boolean).length;

  return (
    <>
      <Head><title>Transacciones — Pistis</title></Head>
      {/* Botón flotante para crear transacción */}
      <Button
        variant="accent"
        onClick={() => { setSelectedClient({}); setShowTransactionModal(true); }}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1050,
          width: 56,
          height: 56,
          borderRadius: '50%',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFC313',
          border: 'none',
          color: '#111',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}
        aria-label="Nueva transacción"
      >
        <FaPlus />
      </Button>

      <div style={{ padding: '0 12px', paddingBottom: 100 }}>
        {/* Panel de Filtros Mejorado */}
        <div className={`${styles.filtersPanel} mb-4`}>
          {/* Filtros Principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <Field label={<><FaSearch style={{ marginRight: 4 }} />Buscar Cliente</>}>
              <Input
                type="text"
                placeholder="Nombre del cliente..."
                value={search}
                onChange={handleSearchChange}
                className={styles.filterInput}
              />
            </Field>

            <Field label={<><FaSortAmountDown style={{ marginRight: 4 }} />Ordenar por</>}>
              <Select
                value={order}
                onChange={e => setOrder((e.target as HTMLSelectElement).value as 'reciente' | 'antiguo')}
                className={styles.filterInput}
              >
                <option value="reciente">Más reciente</option>
                <option value="antiguo">Más antiguo</option>
              </Select>
            </Field>

            <Field label={<><FaFilter style={{ marginRight: 4 }} />Estado</>}>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter((e.target as HTMLSelectElement).value as 'todos' | 'aprobado' | 'no_aprobado')}
                className={styles.filterInput}
              >
                <option value="todos">Todos</option>
                <option value="aprobado">Aprobado</option>
                <option value="no_aprobado">No Aprobado</option>
              </Select>
            </Field>

            <Field label="Por página">
              <Select
                value={limit}
                onChange={handleLimitChange}
                className={styles.filterInput}
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>

            <Field label={<><FaFileExcel style={{ marginRight: 4 }} />Exportar</>}>
              <Button
                variant="secondary"
                onClick={handleDownloadExcel}
                block
                className={styles.exportBtn}
                leftIcon={<FaFileExcel />}
              >
                Excel
              </Button>
            </Field>
          </div>

          {/* Toggle para Filtros Avanzados */}
          <div className={`${styles.advancedFiltersToggle}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="ghost"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={styles.toggleBtn}
              leftIcon={<FaFilter />}
            >
              <small style={{ fontWeight: 'bold' }}>
                FILTROS AVANZADOS{' '}
                {advancedFilterCount > 0 && (
                  <Badge tone="primary" style={{ marginLeft: 8 }}>{advancedFilterCount}</Badge>
                )}
              </small>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className={styles.clearFiltersBtn}
              leftIcon={<FaTimes />}
            >
              Limpiar Filtros
            </Button>
          </div>

          {/* Filtros Avanzados - Colapsable */}
          {showAdvancedFilters && (
            <div className={styles.advancedFilters}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <Field label="Monto mínimo">
                  <Input
                    type="number"
                    min={0}
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    placeholder="0"
                  />
                </Field>

                <Field label="Monto máximo">
                  <Input
                    type="number"
                    min={0}
                    value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    placeholder="0"
                  />
                </Field>

                <Field label="Fecha inicio">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </Field>

                <Field label="Fecha fin">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        <TransactionList
          transactions={transactions}
          onStatusChange={handleChangeTransactionStatus}
        />

        <div className={styles.paginationContainer}>
          <Pagination
            page={currentPage}
            pageCount={lastPage}
            onChange={handlePageChange}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
          />
        </div>

        <TransactionFormModal
          show={showTransactionModal}
          onHide={() => setShowTransactionModal(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      </div>
    </>
  );
};

export default withAuthSync(Transactions);
