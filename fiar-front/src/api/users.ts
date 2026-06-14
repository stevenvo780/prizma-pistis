import axios from '@utils/axios';
import { User } from '@utils/types';

export const getUser = () => {
  return axios.get('/user/me/data');
};

export const updateUserProfile = (userData: any) => {
  return axios.patch(`/user/me`, userData);
};

export const register = (userData: any) => {
  return axios.post('/auth/register', userData);
};
