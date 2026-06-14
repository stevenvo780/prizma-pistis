import { useState, ChangeEvent, FC, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import { withAuthSync } from '@utils/auth';
import ClientList from './ClientList';
import useClient from '@store/client';
import useUI from '@/store/ui';
import { Client } from '@utils/types';
import ClientDetailModal from './ClientDetailModal';
import ClientFormModal from './ClientFormModal';
import Pagination from 'rc-pagination';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'rc-pagination/assets/index.css';
import styles from '@styles/Client.module.css';

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

  useEffect(() => {
    // Fetch initial data or when page/limit changes, but not search initially
    fetchClient(page, limit, search);
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
    const labelsData: string[] = [];
    for (let index = 0; index < event.length; index++) {
      const labelValue = event[index].value;
      labelsData.push(labelValue);
    }
    setSelectedClient(clientSelected);
  };

  const handlePageChange = (current: number) => {
    fetchClient(current, limit, search);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    // Fetch only when search term is long enough or cleared
    if (searchValue.length >= 3 || searchValue.length === 0) {
      fetchClient(1, limit, searchValue); // Reset to page 1 for new search
    }
  };

  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    fetchClient(1, Number(e.target.value), search); // Reset to page 1 on limit change
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
      <Container className="container">
        <div className={`mb-3 p-3 ${styles.roundedNavbar}`}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Form.Control
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
            <Dropdown>
              <Dropdown.Toggle variant="success" id="estado-de-cuenta">
                Estado de cuenta
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>En deuda</Dropdown.Item>
                <Dropdown.Item>Al día</Dropdown.Item>
                <Dropdown.Item>Suspendidos</Dropdown.Item>
                <Dropdown.Item>Todos</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="deudas-pendientes">
                Deudas pendientes
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Deuda (mayor → menor)</Dropdown.Item>
                <Dropdown.Item>Deuda (menor → mayor)</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Select
              value={limit}
              onChange={handleLimitChange}
              style={{ width: '100px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
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
            current={page}
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
      </Container>
      <ClientDetailModal
        show={showModalDetail}
        onHide={handleCloseModalDetail}
        client={selectedClient}
      />
      <ClientFormModal
        show={showModalCreate}
        onHide={() => { // Use onHide for closing via backdrop or X button
            setShowModalCreate(false);
            resetForm();
        }}
        isUpdating={isUpdating}
        client={clientSelected} // Pass the state variable directly
        labels={labels}
        handleInputChange={handleInputChange} // Pass the handler
        handleSelectChange={handleSelectChange}
        handleSave={createOrUpdateClient} // Pass the save handler
        handleCancel={() => { // Explicit cancel button action
          setShowModalCreate(false);
          resetForm();
        }}
      />
    </>
  );
};

export default withAuthSync(ClientView);

