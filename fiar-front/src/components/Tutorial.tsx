import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const TUTORIAL_KEY = 'fiar_tutorial_completed';
export const TOUR_EVENT = 'fiar:start-tour';

const STEPS: Step[] = [
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Tu resumen general',
    content: 'Aqui ves cuanto has prestado en total, cuanto te deben y tus clientes mas activos. Es tu punto de partida cada dia.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-fiar"]',
    title: 'Fiar rapido ⚡',
    content: 'El camino mas corto para registrar un prestamo o un abono. Seleccionas la operacion, buscas el cliente, pones el monto y listo.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-transacciones"]',
    title: 'Historial completo',
    content: 'Todo el registro en un lugar: rojo = dinero que prestaste, verde = dinero que recibiste. Filtra, busca y exporta a Excel.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-clientes"]',
    title: 'Tus clientes',
    content: 'Agrega las personas a quienes les fias. Balance rojo = te deben, verde = al dia o adelantado.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-planes"]',
    title: 'Ampliar limites',
    content: 'El plan gratuito tiene limite de clientes. Aqui puedes escalar cuando tu negocio lo necesite.',
    disableBeacon: true,
    placement: 'bottom',
  },
];

const joyrideStyles = {
  options: {
    primaryColor: '#FFC313',
    textColor: '#2c3e50',
    backgroundColor: '#ffffff',
    arrowColor: '#ffffff',
    overlayColor: 'rgba(0,0,0,0.55)',
    zIndex: 10000,
    width: 320,
  },
  buttonNext: {
    backgroundColor: '#FFC313',
    color: '#111',
    fontWeight: 700 as const,
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '0.9rem',
    border: 'none',
  },
  buttonBack: {
    color: '#6c757d',
    fontWeight: 500 as const,
    fontSize: '0.9rem',
    marginRight: 8,
  },
  buttonSkip: {
    color: '#adb5bd',
    fontSize: '0.82rem',
  },
  tooltip: {
    borderRadius: '12px',
    padding: '20px 22px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
  },
  tooltipTitle: {
    fontWeight: 700 as const,
    fontSize: '1rem',
    marginBottom: '6px',
    color: '#1a1a2e',
  },
  tooltipContent: {
    fontSize: '0.9rem',
    lineHeight: 1.55,
    color: '#495057',
    paddingTop: 4,
  },
  spotlight: {
    borderRadius: '10px',
  },
};

const Tutorial: React.FC = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY);
    if (!completed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Permite relanzar el tour desde cualquier parte via window event
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(TUTORIAL_KEY);
      setRun(false);
      setTimeout(() => setRun(true), 100);
    };
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, []);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
      setRun(false);
    }
  }, []);

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep={false}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Entendido',
        next: 'Siguiente',
        skip: 'Saltar tour',
      }}
      styles={joyrideStyles}
      callback={handleCallback}
    />
  );
};

export default Tutorial;

/** Lanza el tour desde cualquier parte: window.dispatchEvent(new Event('fiar:start-tour')) */
export const startTour = () => window.dispatchEvent(new Event(TOUR_EVENT));
