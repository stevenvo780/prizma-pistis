import React from 'react';
import { Alert, LoadingOverlay } from 'prizma-ui';
import type { AlertTone } from 'prizma-ui';
import useUI from '@store/ui';
import styles from "@styles/AlertComponent.module.css";

/** Maps the store's alert type string to prizma-ui AlertTone. */
function toAlertTone(type: string): AlertTone {
  if (type === 'success') return 'success';
  if (type === 'warning') return 'warning';
  if (type === 'danger' || type === 'error') return 'danger';
  return 'info';
}

const Events: React.FC = () => {
  const { alerts, loading, removeAlert } = useUI();

  const handleClose = (index: number) => {
    removeAlert(index);
  };

  return (
    <>
      <LoadingOverlay show={loading} label="Cargando" />
      <div className={styles.alertContainer} role="status" aria-live="polite" aria-atomic="false">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            tone={toAlertTone(alert.type)}
            className={styles.alert}
            onClick={() => handleClose(index)}
            style={{ cursor: 'pointer' }}
            aria-label="Cerrar alerta"
          >
            {alert.message}
          </Alert>
        ))}
      </div>
    </>
  );
};

export default Events;
