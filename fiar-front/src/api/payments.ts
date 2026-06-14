import axios from '@utils/axios';
import { AxiosResponse } from 'axios';
import { User } from '@utils/types';

/**
 * Crea una suscripción recurrente (PreApproval) en Mercado Pago.
 * Retorna init_point para redirección al checkout de MP.
 */
export const createSubscriptionAPI = (data: {
  planType: string;
  frequency: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post('/mercadopago/subscribe', data);
};

/**
 * Consulta el estado de un pago por su ID (usado en página de retorno).
 */
export const getPaymentStatusAPI = (
  paymentId: string,
): Promise<AxiosResponse<any>> => {
  return axios.get(`/mercadopago/payment-status/${paymentId}`);
};

export const cancelSubscriptionAPI = (): Promise<AxiosResponse<User>> => {
  return axios.get('/mercadopago/cancel-subscription');
};

/**
 * Sincroniza el estado de la suscripción consultando directamente a la API de MP.
 * Activa el plan si la suscripción está autorizada, o lo baja si fue cancelada.
 * Funciona tanto en sandbox como en producción.
 */
export const syncSubscriptionAPI = (): Promise<AxiosResponse<{
  synced: boolean;
  status: string;
  planType: string;
  message: string;
}>> => {
  return axios.post('/mercadopago/sync-subscription');
};
