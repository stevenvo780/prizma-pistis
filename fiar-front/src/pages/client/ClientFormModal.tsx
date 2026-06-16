import { FC, ChangeEvent } from 'react';
import { Modal, Button } from 'prizma-ui';
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
    <Modal
      open={show}
      onClose={onHide}
      title={isUpdating ? 'Actualizar Cliente' : 'Crear Cliente'}
      footer={
        <>
          <Button variant="primary" onClick={handleSave}>
            {isUpdating ? 'Actualizar' : 'Crear'}
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Cancelar
          </Button>
        </>
      }
    >
      <ClientForm
        client={client}
        labels={labels}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        onSave={handleSave}
      />
    </Modal>
  );
};

export default ClientFormModal;
