import { FC, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Client } from '@utils/types';
import ClientForm from './ClientForm';

interface ClientFormModalProps {
  show: boolean;
  onHide: () => void;
  isUpdating: boolean;
  client: Client;
  labels: { value: string, label: string }[];
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (event: any) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

const ClientFormModal: FC<ClientFormModalProps> = ({
  show,
  onHide,
  isUpdating,
  client,
  labels,
  handleInputChange,
  handleSelectChange,
  handleSave,
  handleCancel
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isUpdating ? 'Actualizar Cliente' : 'Crear Cliente'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ClientForm
          client={client}
          labels={labels}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          onSave={handleSave} // Nuevo prop
        />
      </Modal.Body>
      <Modal.Footer>
        <Button style={{ margin: 10 }} variant="success" onClick={handleSave} className="btn btn-success">
          {isUpdating ? 'Actualizar' : 'Crear'}
        </Button>
        <Button variant="secondary" onClick={handleCancel} className="btn btn-danger">
            Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientFormModal;
