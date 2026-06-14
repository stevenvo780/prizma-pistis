import { store } from './index';
import { RootState } from './rootReducer';
import { auth } from '@utils/firebase.config';
import userActions from '../store/user/actions';
import router from 'next/router';

const PUBLIC_ROUTES = ['/login', '/home', '/plans'];

export const getToken = (): string | undefined => {
  const state: RootState = store.getState();
  return state.user.token ?? undefined;
};

export const renewToken = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user) {
      const newToken = await user.getIdToken(true);
      userActions.setToken(store.dispatch, newToken);
    } else {
      // Firebase no tiene usuario activo → sesión inválida
      console.warn('No hay usuario de Firebase activo, cerrando sesión');
      clearSession();
    }
  } catch (error) {
    console.error('Error al renovar el token:', error);
    clearSession();
    throw error;
  }
};

export const clearSession = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    // Ignorar error de signOut
  }
  store.dispatch({ type: 'RESET_STORE' });
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  if (!PUBLIC_ROUTES.includes(currentPath)) {
    router.push('/login');
  }
};