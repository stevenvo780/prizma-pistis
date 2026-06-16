import React, { FC, ChangeEvent } from 'react';
import { Input, Checkbox, Field } from 'prizma-ui';
import { Client } from '@utils/types';

// Definición de las propiedades que recibe el componente
interface ClientFormProps {
  client: Client; // Información del cliente
  labels: { value: string, label: string }[]; // Opciones para un select (no usado en el código actual)
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void; // Manejador para cambios en inputs
  handleSelectChange: (event: any) => void; // Manejador para cambios en selects
  onSave?: () => void; // Nuevo prop para invocar la acción de guardado
}

// Componente funcional que recibe las propiedades
const ClientForm: FC<ClientFormProps> = ({ client, labels, handleInputChange, handleSelectChange, onSave }) => {
  return (
    <form>
      {/* Sección: Información del Usuario */}
      <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <legend style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Información del Usuario</legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
          {/* Campos de texto para nombre, apellido, documento, teléfono, ciudad, estado y dirección */}
          <Field>
            <Input
              type="text"
              name="name"
              value={client.name || ''}
              onChange={handleInputChange}
              placeholder="Nombre *"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="lastname"
              value={client.lastname || ''}
              onChange={handleInputChange}
              placeholder="Apellido *"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="document"
              value={client.document || ''}
              onChange={handleInputChange}
              placeholder="Documento"
            />
          </Field>
          <Field>
            <Input
              type="email"
              name="email"
              value={client.email || ''}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="phone"
              value={client.phone || ''}
              onChange={handleInputChange}
              placeholder="Teléfono"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="city"
              value={client.city || ''}
              onChange={handleInputChange}
              placeholder="Ciudad"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="state"
              value={client.state || ''}
              onChange={handleInputChange}
              placeholder="Estado"
            />
          </Field>
          <Field>
            <Input
              type="text"
              name="direction"
              value={client.direction || ''}
              onChange={handleInputChange}
              placeholder="Dirección"
            />
          </Field>
        </div>
      </fieldset>

      {/* Sección: Información del Crédito */}
      <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <legend style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Información del Crédito</legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}>
          {/* Campos para límite de crédito y saldo inicial */}
          <Field>
            <Input
              type="number"
              name="credit_limit"
              value={client.credit_limit || ''}
              onChange={handleInputChange}
              placeholder="Límite de crédito máximo"
            />
          </Field>
          <Field>
            <Input
              type="number"
              name="current_balance"
              value={client.current_balance || ''}
              onChange={handleInputChange}
              placeholder="Saldo inicial disponible"
            />
          </Field>
          {/* Checkboxes para marcar si el cliente es confiable o está bloqueado */}
          <Field>
            <Checkbox
              name="trusted"
              checked={client.trusted || false}
              onChange={handleInputChange}
              label="Cliente confiable"
            />
          </Field>
          <Field>
            <Checkbox
              name="blocked"
              checked={client.blocked || false}
              onChange={handleInputChange}
              label="Cliente bloqueado"
            />
          </Field>
        </div>
      </fieldset>
    </form>
  );
};

export default ClientForm;
