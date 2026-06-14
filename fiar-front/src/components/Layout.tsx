import React, { ReactNode, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import Events from '@components/Events';
import PremiumBanner from '@components/PremiumBanner';
import useUser from '@store/user';
import { useRouter } from 'next/router';
import { auth } from '@utils/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/', '/login', '/home', '/plans'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { token, renewToken, user, logout } = useUser();
  const router = useRouter();
  const renewIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirigir según estado de auth
  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);
    if (!token && !isPublicRoute) {
      router.push('/login');
    } else if (token && router.pathname === '/login') {
      router.push('/dashboard');
    }
  }, [token, router]);

  // Listener de Firebase Auth: si Firebase cierra la sesión, limpiar Redux
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && token) {
        // Firebase perdió la sesión pero Redux aún tiene token → cerrar sesión
        console.warn('Firebase auth perdida, cerrando sesión...');
        logout();
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Renovar token cada 50 minutos (tokens Firebase expiran a los 60)
  useEffect(() => {
    if (renewIntervalRef.current) {
      clearInterval(renewIntervalRef.current);
    }
    if (token) {
      renewIntervalRef.current = setInterval(renewToken, 50 * 60 * 1000);
      return () => {
        if (renewIntervalRef.current) clearInterval(renewIntervalRef.current);
      };
    }
  }, [renewToken, token]);

  return (
    <div className="main-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Events />
      {token && <Header />}
      {token && user?.role === 'FREE' && <PremiumBanner />}
      <main style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>{children}</main>
      {token && <Footer />}
    </div>
  );
};

export default Layout;
