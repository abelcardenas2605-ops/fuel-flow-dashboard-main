import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  register: (name: string, email: string, password: string, role: string, employeeId?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:3000/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id) {
              console.log("Restoring session for:", userData);
              const roleRaw = userData.role || 'consumer';
              const user: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: roleRaw.toLowerCase() as UserRole,
                createdAt: userData.createdAt,
              };
              console.log("User state set to:", user);
              setUser(user);
              localStorage.setItem('user', JSON.stringify(user));
              setIsLoading(false);
              return;
            }
          } else {
            // Token invalid or expired
            console.warn("Token validation failed");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (e) {
        console.error("Session restore failed", e);
        // Do NOT remove token immediately on network error, allow offline/retry?
        // But for safe side, maybe keep local user if available?
        // Current logic: fall back to local storage if network fails
      }

      // Fallback to local storage if backend check failed (e.g. offline) or just to be safe before response
      // But if response was explicitly 401 (in else block), we already cleared it.
      const storedUser = localStorage.getItem('user');
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string, role: UserRole = 'consumer') => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      localStorage.setItem('token', data.access_token);

      const userData: User = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role.toLowerCase() as UserRole,
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string, employeeId?: string) => {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, employeeId }),
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      localStorage.setItem('token', data.access_token);

      const userData: User = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role.toLowerCase() as UserRole,
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
