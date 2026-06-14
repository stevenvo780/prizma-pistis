import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import { Transaction, UpdateTransaction } from '@utils/types';
import transactionActions from './actions';
import api from '../../api';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';

const useTransactions = () => {
  const { transactions, error, total, page, lastPage } = useSelector((state: RootState) => state.transactions);
  const dispatch = useDispatch();

  const fetchTransactions = useCallback(
    async (
      pageParam: number = 1,
      limitParam: number = 50,
      clientSearch: string = '',
      orderFilter: 'reciente' | 'antiguo' = 'reciente',
      statusFilter: 'todos' | 'aprobado' | 'no_aprobado' = 'todos',
      minAmount?: number,
      maxAmount?: number,
      startDate?: string,
      endDate?: string
    ) => {
      transactionActions.setLoading(dispatch, true);
      try {
        const apiOrder = orderFilter === 'antiguo' ? 'asc' : 'desc';
        let apiStatus: string | undefined;
        if (statusFilter === 'aprobado') apiStatus = 'approved';
        else if (statusFilter === 'no_aprobado') apiStatus = 'not_approved';
        const response = await api.transactions.getTransactionsAPI(
          pageParam,
          limitParam,
          clientSearch,
          apiOrder,
          apiStatus,
          minAmount,
          maxAmount,
          startDate,
          endDate
        );
        transactionActions.setTransactions(dispatch, response.data.data);
        transactionActions.setTotal(dispatch, response.data.total);
        transactionActions.setPage(dispatch, response.data.page);
        transactionActions.setLastPage(dispatch, response.data.last_page);
        transactionActions.setError(dispatch, null);
      } catch (err: any) {
        transactionActions.setError(dispatch, err.message || 'Error al obtener transacciones');
      } finally {
        transactionActions.setLoading(dispatch, false);
      }
    },
    [dispatch]
  );

  const addTransaction = async (transaction: Transaction) => {
    transactionActions.setLoading(dispatch, true);
    try {
      const response = await api.transactions.addTransactionAPI(transaction);
      transactionActions.addTransaction(dispatch, response.data);
      transactionActions.setError(dispatch, null);
    } catch (err: any) {
      transactionActions.setError(dispatch, err.response?.data?.message || err.message || 'Error al agregar transacción');
      throw err;
    } finally {
      transactionActions.setLoading(dispatch, false);
    }
  };

  const updateTransaction = async (id: string, transaction: UpdateTransaction) => {
    transactionActions.setLoading(dispatch, true);
    try {
      const response = await api.transactions.updateTransactionAPI(id, transaction);
      transactionActions.updateTransaction(dispatch, response.data);
      transactionActions.setError(dispatch, null);
    } catch (err: any) {
      transactionActions.setError(dispatch, err.response?.data?.message || 'Error al actualizar transacción');
      throw err;
    } finally {
      transactionActions.setLoading(dispatch, false);
    }
  };

  const deleteTransaction = async (id: string) => {
    transactionActions.setLoading(dispatch, true);
    try {
      await api.transactions.deleteTransactionAPI(id);
      transactionActions.deleteTransaction(dispatch, id);
      transactionActions.setError(dispatch, null);
    } catch (err: any) {
      transactionActions.setError(dispatch, err.message || 'Error al eliminar transacción');
    } finally {
      transactionActions.setLoading(dispatch, false);
    }
  };

  const downloadExcel = async (
    pageParam: number = 1,
    limitParam: number = 1000,
    clientSearch: string = '',
    orderFilter: 'reciente' | 'antiguo' = 'reciente',
    statusFilter: 'todos' | 'aprobado' | 'no_aprobado' = 'todos',
    minAmount?: number,
    maxAmount?: number,
    startDate?: string,
    endDate?: string
  ) => {
    transactionActions.setLoading(dispatch, true);
    try {
      const apiOrder = orderFilter === 'antiguo' ? 'asc' : 'desc';
      let apiStatus: string | undefined;
      if (statusFilter === 'aprobado') apiStatus = 'approved';
      else if (statusFilter === 'no_aprobado') apiStatus = 'not_approved';
      // Pedir hasta 10,000 registros para exportar todo el filtro
      const response = await api.transactions.getTransactionsAPI(
        pageParam,
        10000,
        clientSearch,
        apiOrder,
        apiStatus,
        minAmount,
        maxAmount,
        startDate,
        endDate
      );
      const data = response.data.data;
      const ws = XLSX.utils.json_to_sheet(
        data.map((tx) => ({
          ID: tx.id,
          Cliente: tx.client_id,
          Monto: tx.amount,
          Estado: tx.status,
          Fecha: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '',
          Detalle: typeof tx.detail === 'object' ? JSON.stringify(tx.detail) : tx.detail,
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
      XLSX.writeFile(wb, 'Transacciones.xlsx');
      transactionActions.setError(dispatch, null);
    } catch (err: any) {
      transactionActions.setError(dispatch, err.message || 'Error al exportar transacciones');
    } finally {
      transactionActions.setLoading(dispatch, false);
    }
  };

  return {
    transactions,
    error,
    total,
    page,
    lastPage,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    downloadExcel,
  };
};

export default useTransactions;
