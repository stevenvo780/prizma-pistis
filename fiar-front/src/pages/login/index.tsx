import React, { useState, FormEvent } from 'react';
import { Card, Form, Button, Container } from 'react-bootstrap';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineUserPlus } from 'react-icons/hi2';
import logo from '@public/img/Logo.png';
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
      <Container className={styles.loginContainer} fluid>
        <Card className={styles.card}>
          <div className={`${styles.logoContainer} text-center`}>
            <Image fetchPriority="high" src={logo} alt="Logo" width={120} height={120} style={{ objectFit: 'contain' }}/>
          </div>
          <h5 className="text-center fw-bold mb-1" style={{ color: '#095169' }}>Bienvenido a Fiar</h5>
          <p className="text-center text-muted mb-3" style={{ fontSize: '0.85rem' }}>Inicia sesión para continuar</p>
          <Card.Body className="pt-0">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label className="fw-medium" style={{ fontSize: '0.9rem' }}>Correo electrónico</Form.Label>
                <div className="position-relative">
                  <HiOutlineEnvelope
                    size={18}
                    className="position-absolute text-muted"
                    style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <Form.Control
                    placeholder="correo@ejemplo.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.formControl}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Form.Group>
              
              <Form.Group controlId="formBasicPassword" className="mb-3">
                <Form.Label className="fw-medium" style={{ fontSize: '0.9rem' }}>Contraseña</Form.Label>
                <div className="position-relative">
                  <HiOutlineLockClosed
                    size={18}
                    className="position-absolute text-muted"
                    style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <Form.Control
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.formControl}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Form.Group>
              
              <Button
                variant="success"
                className="w-100 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                type="submit"
                disabled={isLoading}
                style={{ height: 46, borderRadius: 10 }}
              >
                <HiOutlineArrowRightOnRectangle size={19} />
                {isLoading ? 'Cargando...' : 'Iniciar sesión'}
              </Button>
              
              <Button
                variant="light"
                className="w-100 mb-3 d-flex align-items-center justify-content-center fw-medium"
                onClick={() => handleLoginWithProvider('google')}
                style={{ height: 46, borderRadius: 10, border: '1px solid #e0e0e0' }}
              >
                <FcGoogle size={20} className="me-2" />
                <span>Continuar con Google</span>
              </Button>
              
              <Button
                variant="link"
                onClick={() => setShowPasswordResetModal(true)}
                className={`w-100 ${styles.forgotPasswordLink}`}
                style={{ fontSize: '0.85rem' }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
              
              <hr style={{ borderColor: '#f0f0f0' }} />
              
              <Button
                variant="outline-secondary"
                className="w-100 d-flex align-items-center justify-content-center gap-2 fw-medium"
                onClick={handleRegister}
                style={{ height: 44, borderRadius: 10 }}
              >
                <HiOutlineUserPlus size={18} />
                Registrarse
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
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
