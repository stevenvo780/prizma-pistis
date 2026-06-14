import { PaymentDetails } from '@utils/types';

export interface PaymentState {
  paymentDetails: PaymentDetails | null;
}

export const initialPaymentState: PaymentState = {
  paymentDetails: null,
};

interface Action {
  type: string;
  payload?: any;
}

const reducer = (state: PaymentState = initialPaymentState, action: Action): PaymentState => {
  switch (action.type) {
    case 'SET_PAYMENT_DETAILS':
      return { ...state, paymentDetails: action.payload };
    default:
      return state;
  }
};

export default reducer;
