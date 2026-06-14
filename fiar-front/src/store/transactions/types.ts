import { Transaction } from '@utils/types';

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export interface TransactionAction {
  type: string;
  payload?: any;
}
