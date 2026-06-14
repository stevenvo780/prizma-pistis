import React, { useState, FormEvent } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
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
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center">Regístrate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className={styles['register-form']}>
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Control 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Correo electronico" 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Control 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Contraseña" 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
            <Form.Control 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirmar contraseña" 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formBasicCompanyName" className="mb-3">
            <Form.Control 
              type="text" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              placeholder="Nombre de la empresa" 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formBasicCompanyNumber" className="mb-3">
            <Form.Control 
              type="text" 
              value={companyNumber} 
              onChange={(e) => setCompanyNumber(e.target.value)} 
              placeholder="Número de empresa" 
              required 
            />
          </Form.Group>
          <Button 
            variant="success" 
            type="submit" 
            disabled={isLoading} 
            className="w-100 mt-3"
          >
            {isLoading ? 'Cargando...' : 'Regístrate'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Register;
