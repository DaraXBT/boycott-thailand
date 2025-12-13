import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('boycott_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Hardcoded Admin Logic
    if (email.toLowerCase() === 'admin@boycott.com' && password === 'admin123') {
      const adminUser: User = { email, name: 'Administrator', role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('boycott_user', JSON.stringify(adminUser));
      return true;
    }

    // Standard User Logic (Mock)
    const stdUser: User = { email, name: email.split('@')[0], role: 'user' };
    setUser(stdUser);
    localStorage.setItem('boycott_user', JSON.stringify(stdUser));
    return true;
  };

  const signup = async (email: string, _password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = { email, name, role: 'user' };
    setUser(newUser);
    localStorage.setItem('boycott_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('boycott_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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