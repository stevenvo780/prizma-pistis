import React, { FC, ChangeEvent } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Select from 'react-select/creatable';
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
    <Form>
      {/* Sección: Información del Usuario */}
      <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <legend style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Información del Usuario</legend>
        <Row>
          {/* Campos de texto para nombre, apellido, documento, teléfono, ciudad, estado y dirección */}
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="name"
              value={client.name || ''} // Valor actual del campo
              onChange={handleInputChange} // Manejador de cambios
              placeholder="Nombre *" // Texto de ayuda
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="lastname"
              value={client.lastname || ''}
              onChange={handleInputChange}
              placeholder="Apellido *"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="document"
              value={client.document || ''}
              onChange={handleInputChange}
              placeholder="Documento"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="email"
              name="email"
              value={client.email || ''}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="phone"
              value={client.phone || ''}
              onChange={handleInputChange}
              placeholder="Teléfono"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="city"
              value={client.city || ''}
              onChange={handleInputChange}
              placeholder="Ciudad"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="state"
              value={client.state || ''}
              onChange={handleInputChange}
              placeholder="Estado"
              className="form-control"
            />
          </Col>
          <Col sm="4" style={{ marginTop: 10 }}>
            <Form.Control
              type="text"
              name="direction"
              value={client.direction || ''}
              onChange={handleInputChange}
              placeholder="Dirección"
              className="form-control"
            />
          </Col>
        </Row>
      </fieldset>

      {/* Sección: Información del Crédito */}
      <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <legend style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Información del Crédito</legend>
        <Row>
          {/* Campos para límite de crédito y saldo inicial */}
          <Col sm="6" style={{ marginTop: 10 }}>
            <Form.Control
              type="number"
              name="credit_limit"
              value={client.credit_limit || ''}
              onChange={handleInputChange}
              placeholder="Límite de crédito máximo"
              className="form-control"
            />
          </Col>
          <Col sm="6" style={{ marginTop: 10 }}>
            <Form.Control
              type="number"
              name="current_balance"
              value={client.current_balance || ''}
              onChange={handleInputChange}
              placeholder="Saldo inicial disponible"
              className="form-control"
            />
          </Col>
          {/* Checkboxes para marcar si el cliente es confiable o está bloqueado */}
          <Col sm="6" style={{ marginTop: 10 }}>
            <Form.Check
              type="checkbox"
              name="trusted"
              checked={client.trusted || false} // Valor booleano
              onChange={handleInputChange}
              label="Cliente confiable"
            />
          </Col>
          <Col sm="6" style={{ marginTop: 10 }}>
            <Form.Check
              type="checkbox"
              name="blocked"
              checked={client.blocked || false}
              onChange={handleInputChange}
              label="Cliente bloqueado"
            />
          </Col>
        </Row>
      </fieldset>
    </Form>
  );
};

export default ClientForm;
