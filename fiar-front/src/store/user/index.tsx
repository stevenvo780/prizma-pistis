import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import { auth, compatAuth, providers, EmailAuthProvider } from '@utils/firebase.config';
import { useRouter } from 'next/router';
import userActions from './actions';
import api from '../../api';
import useUI from '@store/ui';
import firebase from 'firebase/compat/app';
import { reauthenticateWithCredential, updatePassword, User } from 'firebase/auth';
import { User as ApiUser } from '@utils/types'; // Importa el User de tu backend/types

const useUser = () => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const { setLoading, addAlert } = useUI();

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await compatAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (user) {
        const token = await user.getIdToken();
        userActions.setToken(dispatch, token);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      addAlert({ type: 'danger', message: 'Error en contraseña o correo' });
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (providerName: keyof typeof providers) => {
    setLoading(true);
    try {
      const provider = providers[providerName];
      // Intentar popup primero (funciona en desktop)
      try {
        const result = await compatAuth.signInWithPopup(provider);
        const user = result.user;
        if (user) {
          const token = await user.getIdToken();
          userActions.setToken(dispatch, token);
          router.push('/dashboard');
        }
      } catch (popupError: any) {
        // Si el popup falla (bloqueado, mobile, cookies), usar redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          console.warn(`Popup bloqueado, usando redirect para ${providerName}`);
          await compatAuth.signInWithRedirect(provider);
          return; // La página se recargará después del redirect
        }
        throw popupError; // Re-lanzar otros errores
      }
    } catch (error: any) {
      console.error(`Error al iniciar sesión con ${providerName}:`, error);
      const errorMsg = error.code
        ? `Error (${error.code}): ${error.message}`
        : `Error al iniciar sesión con ${providerName}`;
      addAlert({ type: 'danger', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await compatAuth.sendPasswordResetEmail(email);
      addAlert({ type: 'success', message: 'Correo de recuperación enviado' });
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      addAlert({ type: 'danger', message: 'Error al enviar el correo de recuperación' });
    } finally {
      setLoading(false);
    }
  };

  const reauthenticate = async (currentPassword: string) => {
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        console.error('Error al reautenticar:', error);
        addAlert({ type: 'danger', message: 'Error al reautenticar. Por favor verifica tu contraseña actual.' });
        return false;
      }
    }
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const reauthenticated = await reauthenticate(currentPassword);
        if (reauthenticated) {
          await updatePassword(user, newPassword);
          addAlert({ type: 'success', message: 'Contraseña actualizada exitosamente' });
        }
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      addAlert({ type: 'danger', message: 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const renewToken = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newToken = await user.getIdToken(true);
        userActions.setToken(dispatch, newToken);
      } else {
        // Firebase perdió el usuario → token expirado
        console.warn('Firebase currentUser es null, cerrando sesión');
        addAlert({ type: 'warning', message: 'Tu sesión ha expirado, inicia sesión nuevamente' });
        await logout();
      }
    } catch (error) {
      console.error('Error al renovar el token:', error);
      addAlert({ type: 'danger', message: 'Sesión expirada, por favor inicia sesión nuevamente' });
      await logout();
    }
  };

  const fetchUser = async (): Promise<ApiUser> => {
    setLoading(true);
    try {
      const response = await api.users.getUser();
      userActions.setUser(dispatch, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      addAlert({ type: 'danger', message: 'Error al obtener la información del usuario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setUser = (userData: any) => {
    userActions.setUser(dispatch, userData);
  };

  const updateUserProfile = async (profileData: any) => {
    setLoading(true);
    try {
      await api.users.updateUserProfile(profileData);
      addAlert({ type: 'success', message: 'Perfil actualizado exitosamente' });
      fetchUser();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      addAlert({ type: 'danger', message: 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      // Ignorar error de signOut
    }
    dispatch(userActions.resetStore());
    router.push('/login');
  };

  const registerUser = async (userData: any) => {
    setLoading(true);
    try {
      // 1. Crear usuario en Firebase (client-side)
      const userCredential = await compatAuth.createUserWithEmailAndPassword(
        userData.email,
        userData.password,
      );
      const firebaseUser = userCredential.user;
      if (!firebaseUser) {
        throw new Error('No se pudo crear el usuario en Firebase');
      }

      // 2. Obtener token de Firebase y guardarlo en el store
      const firebaseToken = await firebaseUser.getIdToken();
      userActions.setToken(dispatch, firebaseToken);

      // 3. Registrar usuario en el backend con el token
      const response = await api.users.register({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
      });

      addAlert({ type: 'success', message: 'Registro exitoso' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Ocurrió un error al registrar:', error);
      if (error.code === 'auth/email-already-in-use') {
        addAlert({ type: 'danger', message: 'Este correo ya está registrado' });
      } else if (error.code === 'auth/weak-password') {
        addAlert({ type: 'danger', message: 'La contraseña debe tener al menos 6 caracteres' });
      } else {
        addAlert({ type: 'danger', message: error.message || 'Error al registrar' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectResult = async () => {
    try {
      const result = await compatAuth.getRedirectResult();
      if (result && result.user) {
        const token = await result.user.getIdToken();
        userActions.setToken(dispatch, token);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error procesando redirect de auth:', error);
      if (error.code && error.code !== 'auth/credential-already-in-use') {
        addAlert({ type: 'danger', message: `Error de autenticación: ${error.message}` });
      }
    }
  };

  const isAuthenticated = () => !!token;

  return {
    token,
    user,
    loginWithEmail,
    loginWithProvider,
    handleRedirectResult,
    resetPassword,
    changePassword,
    renewToken,
    fetchUser,
    updateUserProfile,
    logout,
    isAuthenticated,
    registerUser,
    reauthenticate,
    setUser,
  };
};

export default useUser;
