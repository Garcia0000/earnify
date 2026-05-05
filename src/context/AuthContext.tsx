import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { User, Transaction, Withdrawal } from '../types';
import i18n from '../i18n/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await axios.get('/api/user/profile');
      const profile = res.data;
      // Map MySQL admin based on email or a column if added later
      profile.isAdmin = profile.email === 'fernandook2016@gmail.com';
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh profile", error);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        await refreshProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setAuthHeader(token);
    setUser(userData);
  };

  const register = async (email: string, password: string, referralCode?: string) => {
    const res = await axios.post('/api/auth/register', { email, password, referralCode });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setAuthHeader(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
