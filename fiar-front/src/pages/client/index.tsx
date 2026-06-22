import { useState, ChangeEvent, FC, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Button, Input, Select, Pagination } from 'prizma-ui';
import { withAuthSync } from '@utils/auth';
import ClientList from './ClientList';
import useClient from '@store/client';
import useUI from '@/store/ui';
import { Client } from '@utils/types';
import ClientDetailModal from './ClientDetailModal';
import ClientFormModal from './ClientFormModal';
import styles from '@styles/Client.module.css';

const ClientView: FC = () => {
  const { setLoading, addAlert } = useUI();
  const {
    client,
    labels,
    page,
    lastPage,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    downloadTemplate,
    downloadExcel
  } = useClient();

  const [clientSelected, setClientSelected] = useState<Client>({} as Client);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(50);
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [debtSort, setDebtSort] = useState<string>('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDebtMenu, setShowDebtMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const debtMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial data or when page/limit changes, but not search initially
    fetchClient(page, limit, search, accountFilter, debtSort);
  }, [page, limit]); // Removed search dependency here to avoid fetching on every keystroke initially

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Update clientSelected state correctly for different input types
    setClientSelected(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
    }));
  };

  const createOrUpdateClient = async () => {
    // setLoading is handled by the hooks createClient/updateClient
    try {
      if (isUpdating && clientSelected?.id) {
        await updateClient(clientSelected.id, clientSelected);
        // No need to call fetchClient here if updateClient updates the redux state correctly
        // Assuming updateClient updates the specific client in the redux store
      } else {
        await createClient(clientSelected);
        // After creating, fetch the first page to see the new client potentially
        // Or fetch the current page if the backend sorts predictably
        await fetchClient(1, limit, ''); // Fetch first page after creation
      }
      // Close modal and reset form on success
      setShowModalCreate(false);
      resetForm();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      // Keep modal open on error, alert is handled by hooks
    }
    // No finally block needed for setLoading if hooks handle it
  };

  const updateClientSelect = (id: number) => {
    // Find the client to edit from the current state
    const clientToEdit = client.find((cli: Client) => cli.id === id);
    if (clientToEdit) {
      // Set the form state with the data of the client being edited
      setClientSelected(clientToEdit);
      setIsUpdating(true);
      setShowModalCreate(true);
    }
  };

  const resetForm = () => {
    // Reset clientSelected to an empty object for the next creation
    setClientSelected({} as Client);
    setIsUpdating(false); // Ensure isUpdating is reset
  };

  const handleShowModalDetail = (client: Client) => {
    setSelectedClient(client);
    setShowModalDetail(true);
  };

  const handleCloseModalDetail = () => {
    setSelectedClient(null);
    setShowModalDetail(false);
  };

  const handleSelectChange = (event: any) => {
    const labelData: string[] = event && Array.isArray(event)
      ? event.map((item: any) => item.value)
      : [];
    setClientSelected(prev => ({
      ...prev,
      label: labelData
    }));
  };

  const handlePageChange = (current: number) => {
    fetchClient(current, limit, search, accountFilter, debtSort);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    // Fetch only when search term is long enough or cleared
    if (searchValue.length >= 3 || searchValue.length === 0) {
      fetchClient(1, limit, searchValue, accountFilter, debtSort); // Reset to page 1 for new search
    }
  };

  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLimit = Number(e.target.value);
    setLimit(nextLimit);
    fetchClient(1, nextLimit, search, accountFilter, debtSort); // Reset to page 1 on limit change
  };

  const handleDeleteClient = async (id: number) => {
    try {
      setLoading(true);
      await deleteClient(id);
      addAlert({ type: 'success', message: 'Cliente eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      addAlert({ type: 'danger', message: 'Error al eliminar cliente' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      await downloadExcel();
      addAlert({ type: 'success', message: 'Excel descargado correctamente' });
    } catch (err) {
      console.error('Error al descargar Excel:', err);
      addAlert({ type: 'danger', message: 'Error al descargar Excel' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await downloadTemplate();
      addAlert({ type: 'success', message: 'Plantilla descargada correctamente' });
    } catch (err) {
      console.error('Error al descargar plantilla:', err);
      addAlert({ type: 'danger', message: 'Error al descargar plantilla' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Clientes — Pistis</title></Head>
      <div className="container">
        <div className={`mb-3 p-3 ${styles.roundedNavbar}`}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <label htmlFor="client-search" className="visually-hidden">Buscar clientes</label>
            <Input
              id="client-search"
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={handleSearchChange}
              style={{ width: '200px', flex: '1 1 180px', maxWidth: '300px' }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setIsUpdating(false);
                resetForm();
                setShowModalCreate(true);
              }}
            >
              Nuevo cliente
            </Button>
            <Button variant="secondary" onClick={handleDownloadExcel}>
              Descargar Excel
            </Button>
            <div ref={accountMenuRef} style={{ position: 'relative' }}>
              <Button
                variant="secondary"
                type="button"
                aria-haspopup="true"
                aria-expanded={showAccountMenu}
                onClick={() => { setShowAccountMenu(v => !v); setShowDebtMenu(false); }}
              >
                {accountFilter || 'Estado de cuenta'} ▾
              </Button>
              {showAccountMenu && (
                <ul
                  role="menu"
                  style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: '#fff', border: '1px solid #dee2e6', borderRadius: 6, padding: '4px 0', listStyle: 'none', margin: 0, minWidth: 160 }}
                >
                  {['Todos', 'En deuda', 'Al día', 'Suspendidos'].map(opt => (
                    <li key={opt} role="none">
                      <button
                        role="menuitem"
                        style={{ display: 'block', width: '100%', padding: '6px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          const nextFilter = opt === 'Todos' ? '' : opt;
                          setAccountFilter(nextFilter);
                          setShowAccountMenu(false);
                          fetchClient(1, limit, search, nextFilter, debtSort);
                        }}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div ref={debtMenuRef} style={{ position: 'relative' }}>
              <Button
                variant="secondary"
                type="button"
                aria-haspopup="true"
                aria-expanded={showDebtMenu}
                onClick={() => { setShowDebtMenu(v => !v); setShowAccountMenu(false); }}
              >
                {debtSort || 'Deudas pendientes'} ▾
              </Button>
              {showDebtMenu && (
                <ul
                  role="menu"
                  style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: '#fff', border: '1px solid #dee2e6', borderRadius: 6, padding: '4px 0', listStyle: 'none', margin: 0, minWidth: 200 }}
                >
                  {['Deuda (mayor → menor)', 'Deuda (menor → mayor)'].map(opt => (
                    <li key={opt} role="none">
                      <button
                        role="menuitem"
                        style={{ display: 'block', width: '100%', padding: '6px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          setDebtSort(opt);
                          setShowDebtMenu(false);
                          fetchClient(1, limit, search, accountFilter, opt);
                        }}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Select
              value={limit}
              onChange={handleLimitChange}
              style={{ width: '100px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </div>
        </div>
        <hr />
        <ClientList
          client={client}
          handleShowModal={handleShowModalDetail}
          updateClientSelect={updateClientSelect}
          deleteClient={handleDeleteClient}
        />
        <div className={styles.paginationContainer}>
          <Pagination
            page={page}
            pageCount={lastPage}
            onChange={handlePageChange}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
          />
        </div>
      </div>
      <ClientDetailModal
        show={showModalDetail}
        onHide={handleCloseModalDetail}
        client={selectedClient}
      />
      <ClientFormModal
        show={showModalCreate}
        onHide={() => {
            setShowModalCreate(false);
            resetForm();
        }}
        isUpdating={isUpdating}
        client={clientSelected}
        labels={labels}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSave={createOrUpdateClient}
        handleCancel={() => {
          setShowModalCreate(false);
          resetForm();
        }}
      />
    </>
  );
};

export default withAuthSync(ClientView);
