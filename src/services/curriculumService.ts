import axios from 'axios';
import { API_BASE_URL } from './api';

export interface Lesson {
  id: string;
  title: string;
  technique: string;
  theory: string;
  guide?: string;
  lab: string;
  opSec: string;
  flag?: string;
  cheatSheet?: string;
  blueTeamLogs?: string;
  remediation?: {
    vulnerableCode: string;
    language: string;
    secureCode: string;
    explanation: string;
  };
}

export interface ModuleTier {
  name: string;
  modules: Lesson[];
}

export interface Curriculum {
  tiers: ModuleTier[];
}

export const fetchCurriculum = async (token: string): Promise<Curriculum> => {
  const response = await axios.get(`${API_BASE_URL}/api/curriculum`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
