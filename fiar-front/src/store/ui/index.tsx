import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import uiActions from './actions';

const useUI = () => {
  const { loading, alerts } = useSelector((state: RootState) => state.ui);
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

  return {
    loading,
    alerts,
    setLoading,
    addAlert,
    removeAlert,
  };
};

export default useUI;
