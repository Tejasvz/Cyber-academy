import axios from 'axios';

export const completeLesson = async (lessonId: string, token: string) => {
  const response = await axios.post(`http://localhost:3000/api/progress/${lessonId}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const fetchProgress = async (token: string): Promise<string[]> => {
  const response = await axios.get('http://localhost:3000/api/progress', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data; // array of lessonIds
};
