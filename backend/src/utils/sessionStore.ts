export interface ShellSession {
  currentDir: string;
  isRootShell: boolean;
  isSubShell: boolean;
  isInterceptState: boolean;
  // Boss challenge progression flags
  // B08
  b08_nmapScanned?: boolean;
  b08_curlAnalyzed?: boolean;
  b08_hashCracked?: boolean;
  // M08
  m08_loginBypassed?: boolean;
  m08_lfiExecuted?: boolean;
  m08_suidEscalated?: boolean;
  // A07
  a07_sqlmapDumped?: boolean;
  a07_ssrfTriggered?: boolean;
  a07_commandInjected?: boolean;
  a07_avObfuscated?: boolean;
}

const sessions = new Map<string, ShellSession>();

const getSessionKey = (userId: string, lessonId: string): string => {
  return `${userId}:${lessonId}`;
};

export const getSession = (userId: string, lessonId: string): ShellSession => {
  const key = getSessionKey(userId, lessonId);
  if (!sessions.has(key)) {
    sessions.set(key, {
      currentDir: '~',
      isRootShell: false,
      isSubShell: false,
      isInterceptState: false
    });
  }
  return sessions.get(key)!;
};

export const updateSession = (userId: string, lessonId: string, updates: Partial<ShellSession>): ShellSession => {
  const key = getSessionKey(userId, lessonId);
  const current = getSession(userId, lessonId);
  const updated = { ...current, ...updates };
  sessions.set(key, updated);
  return updated;
};

export const resetSession = (userId: string, lessonId: string): ShellSession => {
  const key = getSessionKey(userId, lessonId);
  const initial = {
    currentDir: '~',
    isRootShell: false,
    isSubShell: false,
    isInterceptState: false
  };
  sessions.set(key, initial);
  return initial;
};
