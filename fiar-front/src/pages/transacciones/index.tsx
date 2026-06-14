import { useState, ChangeEvent, FC, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { FaPlus, FaChevronLeft, FaChevronRight, FaSearch, FaSortAmountDown, FaFilter, FaFileExcel, FaTimes } from 'react-icons/fa';
import { withAuthSync } from '@utils/auth';
import TransactionList from './TransactionList';
import useTransaction from '@store/transactions';
import useUI from '@/store/ui';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import styles from '@styles/Transactions.module.css';
import TransactionFormModal from './TransactionFormModal';

const paginationLocale = {
  items_per_page: '/ página',
  jump_to: 'Ir a',
  jump_to_confirm: 'confirmar',
  page: '',
  prev_page: 'Página anterior',
  next_page: 'Página siguiente',
  prev_5: '5 páginas anteriores',
  next_5: '5 páginas siguientes',
  prev_3: '3 páginas anteriores',
  next_3: '3 páginas siguientes',
};

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
    await updateTransaction(id, { status });
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

  return (
    <>
      {/* Botón flotante para crear transacción */}
      <Button
        variant="primary"
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
      <Container fluid className="px-3" style={{ paddingBottom: 100 }}>
        {/* Panel de Filtros Mejorado */}
        <div className={`${styles.filtersPanel} mb-4`}>
          {/* Filtros Principales */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6 col-lg-4">
              <Form.Group>
                <Form.Label className={styles.filterLabel}>
                  <FaSearch className="me-1" />
                  Buscar Cliente
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre del cliente..."
                  value={search}
                  onChange={handleSearchChange}
                  className={styles.filterInput}
                />
              </Form.Group>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <Form.Group>
                <Form.Label className={styles.filterLabel}>
                  <FaSortAmountDown className="me-1" />
                  Ordenar por
                </Form.Label>
                <Form.Select
                  value={order}
                  onChange={e => setOrder(e.target.value as 'reciente' | 'antiguo')}
                  className={styles.filterInput}
                >
                  <option value="reciente">Más reciente</option>
                  <option value="antiguo">Más antiguo</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <Form.Group>
                <Form.Label className={styles.filterLabel}>
                  <FaFilter className="me-1" />
                  Estado
                </Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as 'todos' | 'aprobado' | 'no_aprobado')}
                  className={styles.filterInput}
                >
                  <option value="todos">Todos</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="no_aprobado">No Aprobado</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <Form.Group>
                <Form.Label>Por página</Form.Label>
                <Form.Select
                  value={limit}
                  onChange={handleLimitChange}
                  className={styles.filterInput}
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <Form.Group>
                <Form.Label className={styles.filterLabel}>
                  <FaFileExcel className="me-1" />
                  Exportar
                </Form.Label>
                <Button 
                  variant="success" 
                  onClick={handleDownloadExcel} 
                  className={`w-100 ${styles.exportBtn}`}
                >
                  <FaFileExcel className="me-1" />
                  Excel
                </Button>
              </Form.Group>
            </div>
          </div>
          
          {/* Toggle para Filtros Avanzados */}
          <div className={`${styles.advancedFiltersToggle} d-flex justify-content-between align-items-center`}>
            <Button 
              variant="link"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-0 ${styles.toggleBtn}`}
            >
              <FaFilter className={`me-2`} />
              <small className="fw-bold text-primary">
                FILTROS AVANZADOS 
                {(minAmount || maxAmount || startDate || endDate) && (
                  <span className={`badge bg-primary ms-2 ${styles.filterBadge}`}>
                    {[minAmount, maxAmount, startDate, endDate].filter(Boolean).length}
                  </span>
                )}
              </small>
            </Button>
            
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={clearAllFilters}
              className={styles.clearFiltersBtn}
            >
              <FaTimes className="me-1" />
              Limpiar Filtros
            </Button>
          </div>
          
          {/* Filtros Avanzados - Colapsable */}
          {showAdvancedFilters && (
            <div className={styles.advancedFilters}>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Form.Group>
                    <Form.Label>Monto mínimo</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={minAmount}
                      onChange={e => setMinAmount(e.target.value)}
                      placeholder="0"
                    />
                  </Form.Group>
                </div>
                
                <div className="col-6 col-md-3">
                  <Form.Group>
                    <Form.Label>Monto máximo</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={maxAmount}
                      onChange={e => setMaxAmount(e.target.value)}
                      placeholder="0"
                    />
                  </Form.Group>
                </div>
                
                <div className="col-6 col-md-3">
                  <Form.Group>
                    <Form.Label>Fecha inicio</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </div>
                
                <div className="col-6 col-md-3">
                  <Form.Group>
                    <Form.Label>Fecha fin</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </div>
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
            current={currentPage}
            total={lastPage * limit}
            pageSize={limit}
            onChange={handlePageChange}
            locale={paginationLocale}
            prevIcon={<FaChevronLeft />}
            nextIcon={<FaChevronRight />}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
            itemRender={(current, type, element) => {
              if (type === 'prev') {
                return <FaChevronLeft style={{ color: '#FFC313' }} />;
              }
              if (type === 'next') {
                return <FaChevronRight style={{ color: '#FFC313' }} />;
              }
              return element;
            }}
          />
        </div>
        <TransactionFormModal
          show={showTransactionModal}
          onHide={() => setShowTransactionModal(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      </Container>
    </>
  );
};

export default withAuthSync(Transactions);

