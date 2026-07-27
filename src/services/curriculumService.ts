import axios from 'axios';

export interface Lesson {
  id: string;
  title: string;
  technique: string;
  theory: string;
  lab: string;
  opSec: string;
}

export interface ModuleTier {
  name: string;
  modules: Lesson[];
}

export interface Curriculum {
  tiers: ModuleTier[];
}

export const fetchCurriculum = async (token: string): Promise<Curriculum> => {
  const response = await axios.get('http://localhost:3000/api/curriculum', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
