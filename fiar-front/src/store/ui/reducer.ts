interface UIState {
  loading: boolean;
  alerts: { type: string, message: string }[];
  dataReady: boolean;
}

const initialState: UIState = {
  loading: false,
  alerts: [],
  dataReady: false,
};

const reducer = (state = initialState, action: any): UIState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((_, index) => index !== action.payload),
      };
    case 'SET_DATA_READY':
      return {
        ...state,
        dataReady: action.payload,
      };
    case 'RESET_STORE':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default reducer;
