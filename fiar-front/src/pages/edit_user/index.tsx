import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Head from 'next/head';
import { Button, Spinner, Alert, Input, Checkbox } from 'prizma-ui';
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
    talanton: { enabled: false, apiKey: '' },
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
        talanton: { enabled: false, apiKey: '' },
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
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 text-center">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Head><title>Editar Perfil — Pistis</title></Head>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          {error && <Alert tone="danger" className="mb-3">{error}</Alert>}
          {success && <Alert tone="success" className="mb-3">{success}</Alert>}
          <h2>Editar Perfil</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="edit-email" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Correo electrónico</label>
              <Input
                id="edit-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-name" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nombre</label>
              <Input
                id="edit-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-apikey" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>API Key</label>
              <Input
                id="edit-apikey"
                type="text"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="API Key"
              />
            </div>
            <div className="mb-3">
              <Checkbox
                label="Habilitar Talanton"
                name="enabled"
                data-plugin="talanton"
                checked={plugins.talanton?.enabled || false}
                onChange={handlePluginChange}
              />
              <label htmlFor="talanton-apikey" style={{ display: 'block', marginTop: 8, marginBottom: 4, fontWeight: 500 }}>API Key Talanton</label>
              <Input
                id="talanton-apikey"
                type="text"
                name="apiKey"
                data-plugin="talanton"
                value={plugins.talanton?.apiKey || ''}
                onChange={handlePluginChange}
                placeholder="API Key Talanton"
                disabled={!plugins.talanton?.enabled}
                className="mt-2"
              />
            </div>
            <Button variant="primary" type="submit" style={{ marginTop: '20px' }}>
              Actualizar
            </Button>
          </form>
        </div>
        <div className="col-md-6 offset-md-3">
          <br />
          <h2>Cambiar Contraseña</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label htmlFor="current-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Contraseña actual</label>
              <Input
                id="current-password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Contraseña actual"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="new-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nueva contraseña</label>
              <Input
                id="new-password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nueva contraseña"
              />
            </div>
            <Button variant="primary" type="submit" style={{ marginTop: '20px' }}>
              Cambiar Contraseña
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withAuthSync(EditProfile);
