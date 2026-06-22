import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import { Card, CardBody, Button, Input, InputGroup, InputAddon } from 'prizma-ui';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineUserPlus } from 'react-icons/hi2';
import useUser from '@store/user';
import styles from '@styles/Login.module.css';
import { ProviderName } from '@utils/firebase.config';
import Register from './Register';
import PasswordResetModal from './PasswordResetModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const { loginWithEmail, loginWithProvider, resetPassword } = useUser();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    await loginWithEmail(email, password);
    setIsLoading(false);
  };

  const handleRegister = () => {
    setShowRegisterModal(true);
  };

  const handlePasswordReset = async (email: string) => {
    await resetPassword(email);
    setShowPasswordResetModal(false);
  };

  const handleLoginWithProvider = async (providerName: ProviderName) => {
    await loginWithProvider(providerName);
  };

  return (
    <>
      <Head><title>Iniciar sesión — Pistis</title></Head>
      <div className={styles.loginContainer}>
        <Card className={styles.card}>
          <div className={`${styles.logoContainer} text-center`}>
            <Image fetchPriority="high" src="/img/prizma-symbol.svg" alt="Pistis by Prizma" width={72} height={72} style={{ objectFit: 'contain' }} />
          </div>
          <h5 className="text-center fw-bold mb-1" style={{ color: 'var(--c-primary-700, #2d8a7d)' }}>Bienvenido a Pistis</h5>
          <p className="text-center text-muted mb-3" style={{ fontSize: '0.85rem' }}>Inicia sesión para continuar</p>
          <CardBody style={{ paddingTop: 0 }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="login-email" className="fw-medium" style={{ fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                  Correo electrónico
                </label>
                <InputGroup>
                  <InputAddon>
                    <HiOutlineEnvelope size={18} />
                  </InputAddon>
                  <Input
                    id="login-email"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.formControl}
                  />
                </InputGroup>
              </div>

              <div className="mb-3">
                <label htmlFor="login-password" className="fw-medium" style={{ fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                  Contraseña
                </label>
                <InputGroup>
                  <InputAddon>
                    <HiOutlineLockClosed size={18} />
                  </InputAddon>
                  <Input
                    id="login-password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.formControl}
                  />
                </InputGroup>
              </div>

              <Button
                variant="primary"
                block
                loading={isLoading}
                leftIcon={<HiOutlineArrowRightOnRectangle size={19} />}
                type="submit"
                style={{ height: 46, borderRadius: 10, marginBottom: '0.75rem' }}
              >
                {isLoading ? 'Cargando...' : 'Iniciar sesión'}
              </Button>

              <Button
                variant="secondary"
                block
                onClick={() => handleLoginWithProvider('google')}
                leftIcon={<FcGoogle size={20} />}
                style={{ height: 46, borderRadius: 10, border: '1px solid #e0e0e0', marginBottom: '0.75rem' }}
              >
                Continuar con Google
              </Button>

              <Button
                variant="ghost"
                block
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                className={styles.forgotPasswordLink}
                style={{ fontSize: '0.85rem' }}
              >
                ¿Olvidaste tu contraseña?
              </Button>

              <hr style={{ borderColor: '#f0f0f0' }} />

              <Button
                variant="secondary"
                block
                leftIcon={<HiOutlineUserPlus size={18} />}
                onClick={handleRegister}
                style={{ height: 44, borderRadius: 10 }}
              >
                Registrarse
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
      <Register show={showRegisterModal} handleClose={() => setShowRegisterModal(false)} />
      <PasswordResetModal
        show={showPasswordResetModal}
        handleClose={() => setShowPasswordResetModal(false)}
        handlePasswordReset={handlePasswordReset}
      />
    </>
  );
};

export default Login;

// Enables SSR so crawlers receive the login page HTML
export function getServerSideProps() {
  return { props: {} };
}
