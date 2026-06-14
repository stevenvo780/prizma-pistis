import { useSelector } from 'react-redux';
import axios from '@utils/axios';
import { RootState } from '../rootReducer';
import { User } from '@utils/types';
import useUI from '@store/ui';
import useUser from '@store/user';

const usePayments = () => {
  const { paymentDetails } = useSelector((state: RootState) => state.payments);
  const { setLoading, addAlert } = useUI();
  const { setUser } = useUser();

  /**
   * Crea una suscripción recurrente en el backend (PreApproval)
   * y redirige al usuario al checkout de Mercado Pago.
   */
  const createSubscription = async (data: { planType: string; frequency: string }) => {
    setLoading(true);
    try {
      const response = await axios.post('/mercadopago/subscribe', data);
      const { init_point, sandbox_init_point, isSandbox } = response.data;

      // Si el backend está en modo sandbox, usar sandbox_init_point siempre
      const redirectUrl = isSandbox
        ? (sandbox_init_point || init_point)
        : (process.env.NODE_ENV === 'production' ? init_point : (sandbox_init_point || init_point));

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        addAlert({ type: 'danger', message: 'No se recibió URL de pago. Intenta de nuevo.' });
      }
    } catch (error: any) {
      console.error(error);
      if (error?.response?.data?.message) {
        addAlert({ type: 'danger', message: error.response.data.message });
      } else if (error?.response?.data?.details) {
        addAlert({ type: 'danger', message: error.response.data.details });
      } else {
        addAlert({ type: 'danger', message: 'Error al iniciar el pago.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.get<User>('/mercadopago/cancel-subscription');
      setUser(response.data);
      addAlert({ type: 'success', message: 'Suscripción cancelada con éxito.' });
    } catch (error) {
      console.error(`Error: ${error}`);
      addAlert({ type: 'danger', message: 'Error al cancelar la suscripción.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sincroniza el estado de la suscripción con MercadoPago.
   * Consulta directamente a la API de MP y activa/desactiva el plan según corresponda.
   * Retorna true si el plan fue activado exitosamente.
   */
  const syncSubscription = async (): Promise<{ synced: boolean; planType: string } | null> => {
    try {
      const response = await axios.post('/mercadopago/sync-subscription');
      return response.data;
    } catch (error) {
      console.error('Error sincronizando suscripción:', error);
      return null;
    }
  };

  return {
    paymentDetails,
    createSubscription,
    cancelSubscription,
    syncSubscription,
  };
};

export default usePayments;
