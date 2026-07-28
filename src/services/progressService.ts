import axios from 'axios';
import { API_BASE_URL } from './api';

export const completeLesson = async (lessonId: string, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/progress/${lessonId}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const fetchProgress = async (token: string): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/progress`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
