import { User, Action } from '@utils/types';

export interface UserState {
  token: string | null;
  user: User | null;
}

export const initialUserState: UserState = {
  token: null,
  user: null,
};

const reducer = (state: UserState = initialUserState, action: Action): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload.user } };
    case 'SET_TOKEN':
      return { ...state, token: action.payload.token };
    case 'CLEAR_USER':
      return initialUserState;
    case 'RESET_STORE':
      return { ...initialUserState };
    default:
      return state;
  }
};

export default reducer;
