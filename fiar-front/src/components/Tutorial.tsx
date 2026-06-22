import React, { useState, useEffect } from 'react';
import { PrizmaTour, TourStep } from 'prizma-ui';

const RUN_KEY = 'pistis-frontend-v1';
export const TOUR_EVENT = 'pistis:start-tour';

const STEPS: TourStep[] = [
  {
    // Sin target: pantalla de bienvenida centrada
    title: 'Bienvenido a Pistis',
    body: 'Pistis es tu sistema de fiado digital. En este tour de 6 pasos aprenderás a registrar préstamos, gestionar clientes y controlar tu cartera. ¡Empecemos!',
    placement: 'center',
  },
  {
    target: '[data-tour="nav-pistis"]',
    title: 'Pistis Rápido — registra un fiado en segundos',
    body: 'Aquí empieza el flujo principal: selecciona la operación (Prestar o Abonar), busca el cliente y escribe el monto. Listo para cobrar o pistis en 3 toques.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-clientes"]',
    title: 'Tus clientes — quién te debe y cuánto',
    body: 'Agrega aquí a las personas a quienes les fias. Balance en rojo = te deben; verde = al día. Puedes editar límites de crédito y ver el historial de cada uno.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-transacciones"]',
    title: 'Historial completo de transacciones',
    body: 'Cada préstamo y abono queda registrado aquí. Filtra por fecha o cliente, cambia el estado (aprobado / pendiente) y exporta a Excel para llevar cuentas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="metrics-grid"]',
    title: 'Métricas de tu cartera de crédito',
    body: 'De un vistazo ves cuánto tienes prestado, cuánto has recuperado y cuántos clientes están pendientes. Se actualiza en tiempo real con cada operación.',
    placement: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Acciones rápidas desde el dashboard',
    body: 'Desde aquí puedes crear una nueva transacción, agregar un cliente o exportar tu cartera a Excel sin salir del resumen. ¡Ya estás listo para usar Pistis!',
    placement: 'bottom',
  },
];

const Tutorial: React.FC = () => {
  const [run, setRun] = useState<boolean | undefined>(undefined);

  // Permite relanzar el tour desde cualquier parte via window event
  useEffect(() => {
    const handler = () => {
      // Forzar re-run: marcar como no visto y arrancar
      try {
        localStorage.removeItem(`prizma-tour:${RUN_KEY}`);
      } catch {
        // ignore
      }
      setRun(false);
      // Dar un tick para que PrizmaTour detecte el cambio
      requestAnimationFrame(() => setRun(true));
    };
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, []);

  // run === undefined → dejar que autoStart decida (primera vez)
  // run === true/false → modo controlado para relanzar
  if (run === undefined) {
    return (
      <PrizmaTour
        steps={STEPS}
        runKey={RUN_KEY}
        autoStart
        onFinish={() => setRun(false)}
        onSkip={() => setRun(false)}
      />
    );
  }

  return (
    <PrizmaTour
      steps={STEPS}
      runKey={RUN_KEY}
      run={run}
      onRunChange={setRun}
      onFinish={() => setRun(false)}
      onSkip={() => setRun(false)}
    />
  );
};

export default Tutorial;

/** Lanza el tour desde cualquier parte: window.dispatchEvent(new Event('pistis:start-tour')) */
export const startTour = () => window.dispatchEvent(new Event(TOUR_EVENT));
