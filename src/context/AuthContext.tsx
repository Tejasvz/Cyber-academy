import { createContext, useState, useContext, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  level: number;
  xp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  introRequired: boolean;
  login: (user: User, token: string, options?: { startIntro?: boolean }) => void;
  completeIntro: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [introRequired, setIntroRequired] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return false;
    try {
      const parsedUser: User = JSON.parse(savedUser);
      return localStorage.getItem(`project-veil:intro-pending:${parsedUser.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const login = (userData: User, authToken: string, options?: { startIntro?: boolean }) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);

    const shouldStartIntro = options?.startIntro === true;
    setIntroRequired(shouldStartIntro);
    if (shouldStartIntro) {
      localStorage.setItem(`project-veil:intro-pending:${userData.id}`, 'true');
    }
  };

  const completeIntro = () => {
    if (!user) return;
    localStorage.removeItem(`project-veil:intro-pending:${user.id}`);
    localStorage.setItem(`project-veil:intro-complete:${user.id}`, 'true');
    setIntroRequired(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIntroRequired(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, introRequired, login, completeIntro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
