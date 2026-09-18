export type NavTab = 
  | 'DASHBOARD'
  | 'MISSIONS'
  | 'SKILL_TREE'
  | 'INTEL'
  | 'CONSPIRACY'
  | 'TERMINAL'
  | 'SANDBOX'
  | 'DATABASE'
  | 'UPGRADES'
  | 'OPERATOR'
  | 'NOTIFICATIONS'
  | 'SETTINGS';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  objective: string;
  progress: number;
  location: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  briefingText: string;
  rewardXP: number;
}

export interface Operator {
  name: string;
  callsign: string;
  clearance: string;
  trustLevel: number;
  level: number;
  xpCurrent: number;
  xpNext: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
  }>;
}

export interface TerminalEntry {
  id: string;
  type: 'prompt' | 'output' | 'error' | 'success' | 'warning' | 'info';
  content: string;
  timestamp?: string;
}

export interface AINotification {
  id: string;
  type: 'intel' | 'mission' | 'contract' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface IntelItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP SECRET';
  content: string;
  image?: string;
  number: number;
}

export interface SystemHealth {
  overall: number;
  coreSystems: number;
  networkStability: number;
  aiReliability: number;
  secureChannelActive: boolean;
}

export interface AudioSettings {
  muted: boolean;
  volume: number;
}
