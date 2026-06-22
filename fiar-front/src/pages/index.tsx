import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useUser from '@store/user';
import Home from './home';

const IndexPage: React.FC = () => {
  const { token } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('/dashboard');
    }
  }, [token, router]);

  // If the user has a token, render null and let the client-side redirect run.
  // Otherwise, render the Home landing page directly on the root path '/' for search engines to index.
  if (token) {
    return null;
  }

  return <Home />;
};

export default IndexPage;