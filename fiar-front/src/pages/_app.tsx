import 'prizma-ui/styles.css';
import '@styles/globals.css';
import '@styles/prizma-brand.css';
import React, { useEffect } from 'react';
import { ThemeProvider, PrizmaRoot } from 'prizma-ui';
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
    <ThemeProvider>
      <PrizmaRoot module="pistis">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <RedirectResultHandler />
            <Tutorial />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </PersistGate>
        </Provider>
      </PrizmaRoot>
    </ThemeProvider>
  );
}

// Disable automatic static optimization — all pages are SSR (auth/redux-persist require browser context).
MyApp.getInitialProps = async () => ({ pageProps: {} });

export default MyApp;
