import React, { useState, FormEvent } from 'react';
import { Modal, Button, Input } from 'prizma-ui';

type PasswordResetModalProps = {
  show: boolean;
  handleClose: () => void;
  handlePasswordReset: (email: string) => Promise<void>;
};

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ show, handleClose, handlePasswordReset }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handlePasswordReset(email);
    handleClose();
  };

  return (
    <Modal open={show} onClose={handleClose} title="Recuperar Contraseña">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="reset-email" style={{ display: 'block', marginBottom: 4 }}>Correo Electrónico</label>
          <Input
            id="reset-email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button variant="primary" type="submit" block>
          Enviar correo de recuperación
        </Button>
      </form>
    </Modal>
  );
};

export default PasswordResetModal;
