import React, { useState, FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

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
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recuperar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formResetEmail">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <br/>
          <Button variant="primary" type="submit" style={{ width: "100%" }}>
            Enviar correo de recuperación
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PasswordResetModal;
