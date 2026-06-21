import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import uiActions from './actions';

const useUI = () => {
  const { loading, alerts, dataReady } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  const setLoading = (loading: boolean) => {
    uiActions.setLoading(dispatch, loading);
  };

  const addAlert = (alert: {type: string, message: string }) => {
    uiActions.addAlert(dispatch, alert);
  };

  const removeAlert = (index: number) => {
    uiActions.removeAlert(dispatch, index);
  };

  const setDataReady = (ready: boolean) => {
    uiActions.setDataReady(dispatch, ready);
  };

  return {
    loading,
    alerts,
    dataReady,
    setLoading,
    addAlert,
    removeAlert,
    setDataReady,
  };
};

export default useUI;
