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
  briefing: string;
  threatAssessment?: string;
  loreUnlock?: string;
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

export interface CommandResponse {
  output: string;
  currentDir: string;
  isRootShell: boolean;
  isSubShell: boolean;
  isInterceptState: boolean;
}

export const executeTerminalCommand = async (
  lessonId: string,
  command: string,
  token: string
): Promise<CommandResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/lessons/${lessonId}/command`,
    { command },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
