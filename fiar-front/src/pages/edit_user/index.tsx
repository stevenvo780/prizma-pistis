import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import useUser from '@store/user';
import { withAuthSync } from '@utils/auth';
import api from '@api/index';

const EditProfile: React.FC = () => {
  const { user, fetchUser, updateUserProfile, changePassword, token } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    apiKey: '', // Nuevo campo
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [apiUser, setApiUser] = useState<any>(null);
  const [plugins, setPlugins] = useState<any>({
    sinergia: { enabled: false, apiKey: '' },
  });

  // Llama a fetchUser si hay token y no hay usuario cargado
  useEffect(() => {
    if (!user && token) {
      setLoading(true);
      setError(null);
      fetchUser()
        .catch((err: any) => {
          setError('Error al obtener el usuario');
          console.error('Error al obtener el usuario:', err);
        })
        .finally(() => setLoading(false));
    } else if (user) {
      setLoading(false);
    }
  }, [token, user]);

  const fetchApiUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.getUser();
      const data = res.data;
      setApiUser({
        ...data,
        apiKey: data.apiKey ?? data.api_key ?? '',
      });
    } catch (err) {
      setError('Error al obtener usuario');
      setApiUser(null);
      console.error('Error al obtener usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApiUser();
    }
  }, [token]);

  // Actualiza el formulario cuando los datos del usuario estén disponibles (prioriza apiUser)
  useEffect(() => {
    const u = apiUser || user;
    if (u) {
      setFormData({
        email: u.email || '',
        name: u.name || '',
        apiKey: u.apiKey ?? u.api_key ?? '',
      });
      setPlugins(u.profile?.plugins || {
        sinergia: { enabled: false, apiKey: '' },
      });
    }
  }, [apiUser, user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePluginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type, dataset } = e.target;
    const plugin = dataset.plugin;
    if (!plugin) return;

    setPlugins((prev: any) => ({
      ...prev,
      [plugin]: {
        ...prev[plugin],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Solo enviar campos válidos de User (sin plugins)
      const { email, name, apiKey } = formData;
      await updateUserProfile({ email, name, apiKey });
      await fetchUser();
      await fetchApiUser();  // Volver a cargar datos tras la actualización
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    changePassword(passwordData.currentPassword, passwordData.newPassword);
  };

  if (loading) {
    return (
      <Container>
        <Row>
          <Col md={{ span: 6, offset: 3 }} className="text-center">
            <Spinner animation="border" />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <h2>Editar Perfil</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
              />
            </Form.Group>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre"
              />
            </Form.Group>
            <Form.Group controlId="formApiKey" className="mb-3">
              <Form.Control
                type="text"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="API Key"
              />
            </Form.Group>
            <Form.Group controlId="formPluginsSinergia" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Habilitar Sinergia"
                name="enabled"
                data-plugin="sinergia"
                checked={plugins.sinergia?.enabled || false}
                onChange={handlePluginChange}
              />
              <Form.Control
                type="text"
                name="apiKey"
                data-plugin="sinergia"
                value={plugins.sinergia?.apiKey || ''}
                onChange={handlePluginChange}
                placeholder="API Key Sinergia"
                disabled={!plugins.sinergia?.enabled}
                className="mt-2"
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ marginTop: '20px' }}>
              Actualizar
            </Button>
          </Form>
        </Col>
        <Col md={{ span: 6, offset: 3 }}>
          <br />
          <h2 >Cambiar Contraseña</h2>
          <Form onSubmit={handleChangePassword}>
            <Form.Group controlId="formCurrentPassword" className="mb-3">
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Contraseña actual"
              />
            </Form.Group>
            <Form.Group controlId="formNewPassword" className="mb-3">
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nueva contraseña"
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ marginTop: '20px' }}>
              Cambiar Contraseña
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuthSync(EditProfile);
