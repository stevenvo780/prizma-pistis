import { Dispatch } from 'react';
import { PaymentDetails } from '@utils/types';

const actions = {
  setPaymentDetails: (dispatch: Dispatch<any>, details: PaymentDetails) => {
    dispatch({ type: 'SET_PAYMENT_DETAILS', payload: details });
  },
};

export default actions;
