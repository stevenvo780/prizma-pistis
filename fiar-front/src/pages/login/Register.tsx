import React, { useState, FormEvent } from 'react';
import { Modal, Button, Input } from 'prizma-ui';
import useUser from '@store/user';
import useUI from '@store/ui';
import styles from "@styles/Register.module.css";

type RegisterProps = {
  show: boolean;
  handleClose: () => void;
};

const Register: React.FC<RegisterProps> = ({ show, handleClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useUser();
  const { addAlert, setLoading } = useUI();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setIsLoading(true);

    if (password !== confirmPassword) {
      addAlert({ type: 'danger', message: 'Las contraseñas no coinciden' });
      setIsLoading(false);
      setLoading(false);
      return;
    }

    const userData = {
      email,
      password,
      name: companyName,
      phone: companyNumber,
    };

    try {
      await registerUser(userData);
      handleClose();
    } catch (error) {
      addAlert({ type: 'danger', message: 'Error en el registro' });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <Modal open={show} onClose={handleClose} title="Regístrate">
      <form onSubmit={handleSubmit} className={styles['register-form']}>
        <div className="mb-3">
          <label htmlFor="reg-email" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Correo electrónico</label>
          <Input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="reg-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Contraseña</label>
          <Input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="reg-confirm-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Confirmar contraseña</label>
          <Input
            id="reg-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="reg-company-name" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nombre de la empresa</label>
          <Input
            id="reg-company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nombre de la empresa"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="reg-company-number" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Número de empresa</label>
          <Input
            id="reg-company-number"
            type="text"
            value={companyNumber}
            onChange={(e) => setCompanyNumber(e.target.value)}
            placeholder="Número de empresa"
            required
          />
        </div>
        <Button
          variant="primary"
          type="submit"
          loading={isLoading}
          block
          style={{ marginTop: '0.75rem' }}
        >
          {isLoading ? 'Cargando...' : 'Regístrate'}
        </Button>
      </form>
    </Modal>
  );
};

export default Register;
