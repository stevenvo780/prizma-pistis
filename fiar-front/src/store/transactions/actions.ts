import { Dispatch } from 'react';
import { Transaction } from '@utils/types';

const transactionActions = {
  setTransactions: (dispatch: Dispatch<any>, transactions: Transaction[]) => {
    dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
  },
  addTransaction: (dispatch: Dispatch<any>, transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  },
  updateTransaction: (dispatch: Dispatch<any>, transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  },
  deleteTransaction: (dispatch: Dispatch<any>, id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  },
  setTotal: (dispatch: Dispatch<any>, total: number) => {
    dispatch({ type: 'SET_TRANSACTIONS_TOTAL', payload: total });
  },
  setPage: (dispatch: Dispatch<any>, page: number) => {
    dispatch({ type: 'SET_TRANSACTIONS_PAGE', payload: page });
  },
  setLastPage: (dispatch: Dispatch<any>, lastPage: number) => {
    dispatch({ type: 'SET_TRANSACTIONS_LAST_PAGE', payload: lastPage });
  },
  setLoading: (dispatch: Dispatch<any>, loading: boolean) => {
    dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: loading });
  },
  setError: (dispatch: Dispatch<any>, error: string | null) => {
    dispatch({ type: 'SET_TRANSACTIONS_ERROR', payload: error });
  },
};

export default transactionActions;
