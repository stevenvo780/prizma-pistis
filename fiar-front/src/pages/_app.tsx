import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/globals.css';
import '@styles/cauce-brand.css';
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import Tutorial from '../components/Tutorial';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/';
import { compatAuth } from '@utils/firebase.config';
import userActions from '@store/user/actions';
import Router from 'next/router';

/**
 * Maneja el resultado de signInWithRedirect (Google, etc.)
 * Se ejecuta una sola vez al montar la app, antes de que Redux esté disponible.
 */
function RedirectResultHandler() {
  useEffect(() => {
    compatAuth.getRedirectResult().then((result) => {
      if (result && result.user) {
        result.user.getIdToken().then((token) => {
          userActions.setToken(store.dispatch, token);
          Router.push('/dashboard');
        });
      }
    }).catch((error) => {
      if (error.code && error.code !== 'auth/credential-already-in-use') {
        console.error('Error en redirect auth:', error.code, error.message);
      }
    });
  }, []);
  return null;
}

function MyApp({ Component, pageProps }: { Component: React.ComponentType<any>, pageProps: any }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div data-module="fiar">
          <RedirectResultHandler />
          <Tutorial />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
