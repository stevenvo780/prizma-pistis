import React, { useEffect } from 'react';
import { NextPageContext, NextComponentType } from 'next';
import useUser from '@store/user';

const getDisplayName = (Component: NextComponentType) =>
  Component.displayName || Component.name || "Component";

export const withAuthSync = (WrappedComponent: NextComponentType<any>) => {
  const Wrapper = (props: any) => {
    const { isAuthenticated, fetchUser, token } = useUser();

    useEffect(() => {
      if (!isAuthenticated()) {
        if (token){
          fetchUser();
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isAuthenticated()) {
      return <div>Cargando...</div>;
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
