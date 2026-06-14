import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import { Client } from '@utils/types';
import clientActions from './actions';
import api from '../../api';
import useUI from '../ui';
import * as XLSX from "xlsx/xlsx";
import { convertKeysToEnglish, convertKeysToSpanish } from '@utils/conversions';
import { ref, uploadString } from 'firebase/storage';
import { storage } from '@utils/firebase.config';

const useClient = () => {
  const { client, labels, totalPages, page, lastPage } = useSelector((state: RootState) => state.client);
  const dispatch = useDispatch();
  const { setLoading, addAlert } = useUI();

  const fetchClient = async (page: number = 1, limit: number = 50, search: string = '') => {
    setLoading(true);
    try {
      const response = await api.client.getClientAPI(page, limit, search);
      clientActions.setClient(dispatch, response.data.data);
      clientActions.setTotalPages(dispatch, response.data.total);
      clientActions.setPage(dispatch, response.data.page);
      clientActions.setLastPage(dispatch, response.data.last_page);
    } catch (error: any) {
      console.error(`Error fetching client: ${error}`);
      addAlert({ type: 'danger', message: 'Ocurrió un error, consulta a soporte' });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (client: Client) => {
    setLoading(true);
    try {
      const response = await api.client.createClientAPI(client);
      clientActions.addClient(dispatch, response.data);
      addAlert({ type: 'success', message: 'Cliente creado con éxito.' });
    } catch (error: any) {
      console.error(`Error: ${error}`);
      const msg = error?.response?.data?.message || 'Ocurrió un error, consulta a soporte';
      const statusCode = error?.response?.status;
      if (statusCode === 403 && msg.includes('plan')) {
        addAlert({ type: 'warning', message: `${msg} Ve a la sección de Planes para mejorar tu cuenta.` });
      } else {
        addAlert({ type: 'danger', message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: number, client: Client) => {
    setLoading(true);
    try {
      const response = await api.client.updateClientAPI(id, client);
      clientActions.updateClient(dispatch, response.data);
      addAlert({ type: 'success', message: 'Cliente actualizado con éxito.' });
    } catch (error: any) {
      console.error(`Error: ${error}`);
      const msg = error?.response?.data?.message || 'Ocurrió un error, consulta a soporte';
      addAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: number) => {
    setLoading(true);
    try {
      await api.client.deleteClientAPI(id);
      clientActions.deleteClient(dispatch, id);
      addAlert({ type: 'success', message: 'Cliente eliminado con éxito.' });
    } catch (error: any) {
      console.error(`Error: ${error}`);
      const msg = error?.response?.data?.message || 'Ocurrió un error, consulta a soporte';
      addAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await api.client.getLabelsAPI();
      const labels = response.data.map((label: string) => ({ value: label, label }));
      clientActions.setLabels(dispatch, labels);
    } catch (error) {
      console.error(`Error: ${error}`);
      addAlert({ type: 'danger', message: 'Ocurrió un error, consulta a soporte' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, limit: number, search: string) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt: any) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        const allData: Client[] = jsonData.map((row: any) => {
          const dataConvert = convertKeysToEnglish(row);

          const cleanNumber = (num: string) => {
            const cleaned = num.replace(/[^\d]/g, '');
            return isNaN(Number(cleaned)) ? null : Number(cleaned);
          };
          if (!dataConvert.prefix || !dataConvert.phone) {
            return null;
          }
          dataConvert.prefix = cleanNumber(dataConvert.prefix);
          dataConvert.phone = cleanNumber(dataConvert.phone);

          if (dataConvert.prefix === null || dataConvert.phone === null) {
            return null;
          }

          dataConvert['label'] = dataConvert['label'] ? dataConvert['label'].split(',').filter((item: string) => item.trim() !== '') : [];
          return dataConvert as Client;
        }).filter((contact: Client | null) => contact !== null);

        const uniqueFilename = `contacts_${Date.now()}.json`;

        const folderPath = 'uploads_contacts';
        const storageRef = ref(storage, `${folderPath}/${uniqueFilename}`);
        await uploadString(storageRef, JSON.stringify(allData));

        await api.client.uploadClientAPI({ filename: uniqueFilename });

        clientActions.setPage(dispatch, 1);
        fetchClient(1, limit, search);
        addAlert({ type: 'success', message: 'Archivo subido con éxito.' });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(`Error: ${error}`);
      addAlert({ type: 'danger', message: 'Ocurrió un error al subir el archivo, consulta a soporte' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    setLoading(true);
    const fileUrl = 'https://firebasestorage.googleapis.com/v0/b/emergent-enterprises.appspot.com/o/assets%2FEMW%2FFormato_Clientes_EMW.xlsx?alt=media&token=46665951-953e-43c8-aa8b-23ef2065a076';
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = 'file-name.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setLoading(false);
  };

  const downloadExcel = async () => {
    setLoading(true);
    try {
      const response = await api.client.getClientAPI(1, 20000, '');
      const allClient = response.data.data;

      const clientWithLabelsAsString = allClient.map((client: any) => {
        const clientNew = {
          ...client,
          label: client.label ? client.label.join(', ') : ''
        };
        return convertKeysToSpanish(clientNew);
      });
      const ws = XLSX.utils.json_to_sheet(clientWithLabelsAsString);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      XLSX.writeFile(wb, "Clientes_EMW.xlsx");
    } catch (error) {
      console.error(`Error: ${error}`);
      addAlert({ type: 'danger', message: 'Ocurrió un error al descargar el archivo, consulta a soporte' });
    } finally {
      setLoading(false);
    }
  };

  return {
    client,
    labels,
    totalPages,
    page,
    lastPage,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    fetchLabels,
    handleFileUpload,
    downloadTemplate,
    downloadExcel
  };
};

export default useClient;
