import { Client } from '@utils/types';

export interface ClientState {
  client: Client[];
  labels: { value: string, label: string }[];
  loading: boolean;
  alertMessage: string | null;
  totalPages: number;
  page: number;
  lastPage: number;
}

export const initialClientState: ClientState = {
  client: [],
  labels: [{ value: '', label: 'Etiqueta' }],
  loading: false,
  alertMessage: null,
  totalPages: 1,
  page: 1,
  lastPage: 1,
};

interface Action {
  type: string;
  payload?: any;
}

const clientReducer = (state: ClientState = initialClientState, action: Action): ClientState => {
  switch (action.type) {
    case 'SET_CUSTOMERS':
      return { ...state, client: action.payload };
    case 'SET_LABELS':
      return { ...state, labels: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, client: [...state.client, action.payload] };
    case 'UPDATE_CUSTOMER':
      return { ...state, client: state.client.map(client => client.id === action.payload.id ? action.payload : client) };
    case 'DELETE_CUSTOMER':
      return { ...state, client: state.client.filter(client => client.id !== action.payload) };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LAST_PAGE':
      return { ...state, lastPage: action.payload };
    default:
      return state;
  }
};

export default clientReducer;
