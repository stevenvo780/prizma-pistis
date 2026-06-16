import React, { useEffect } from 'react';
import { NextPageContext, NextComponentType } from 'next';
import { useRouter } from 'next/router';
import useUser from '@store/user';

const getDisplayName = (Component: NextComponentType) =>
  Component.displayName || Component.name || "Component";

export const withAuthSync = (WrappedComponent: NextComponentType<any>) => {
  const Wrapper = (props: any) => {
    const { isAuthenticated, fetchUser, token } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!token) {
        router.push('/login');
        return;
      }
      if (!isAuthenticated()) {
        fetchUser().catch(() => {
          // 404 o error al obtener perfil — el usuario acaba de registrarse;
          // el token es válido, se permite el acceso al dashboard.
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

  if (WrappedComponent.getInitialProps) {
    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const componentProps = WrappedComponent.getInitialProps && (await WrappedComponent.getInitialProps(ctx));
      return { ...componentProps };
    };
  }

  return Wrapper;
};
