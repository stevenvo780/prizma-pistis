import axios from '@utils/axios';
import { AxiosResponse } from 'axios';
import { Transaction, UpdateTransaction } from '@utils/types';

export const getTransactionsAPI = (
  page: number = 1,
  limit: number = 50,
  clientSearch: string = '',
  order: 'asc' | 'desc' = 'desc',
  status?: string,
  minAmount?: number,
  maxAmount?: number,
  startDate?: string,
  endDate?: string
): Promise<AxiosResponse<{ data: Transaction[]; total: number; page: number; last_page: number }>> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (clientSearch) params.append('clientSearch', clientSearch);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (minAmount !== undefined) params.append('minAmount', String(minAmount));
  if (maxAmount !== undefined) params.append('maxAmount', String(maxAmount));
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return axios.get(`/transactions?${params.toString()}`);
};

export const addTransactionAPI = (transaction: Transaction): Promise<AxiosResponse<Transaction>> => {
  return axios.post('/transactions/web', transaction);
};

export const updateTransactionAPI = (id: string, transaction: UpdateTransaction): Promise<AxiosResponse<Transaction>> => {
  return axios.put(`/transactions/${id}`, transaction);
};

export const deleteTransactionAPI = (id: string): Promise<AxiosResponse<void>> => {
  return axios.delete(`/transactions/${id}`);
};
