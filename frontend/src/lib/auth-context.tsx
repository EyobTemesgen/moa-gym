import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

export interface AuthUser {
  id: string;
  employeeId: string;
  username?: string;
  fullName: string;
  department: string;
  email?: string;
  photoUrl?: string;
  role: 'ADMIN' | 'GYM_ATTENDANT' | 'STAFF_MEMBER' | 'HR_ADMIN';
  memberType?: string;
  waiverSigned: boolean;
}

export interface RegisterStaffPayload {
  memberType: 'INTERNAL' | 'EXTERNAL';
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  department: string;
  organization?: string;
  employeeId?: string;
  phone?: string;
  gender?: string;
  password: string;
  shiftPreference?: string;
  daysPerWeek?: number;
  workoutDays?: string[];
  fitnessGoal?: string;
  lockerNumber?: string;
  monthlyFee?: number;
  paymentMethod?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
}

export interface RegistrationResult {
  user: AuthUser;
  registration: {
    id: string;
    regNumber: number;
    memberType: string;
    shiftPreference: string;
    daysPerWeek: number;
    monthlyFee: number;
    lockerNumber?: string | null;
    paymentMethod?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<AuthUser>;
  claimAccount: (employeeId: string, pass: string, shiftPreference?: string, fullName?: string) => Promise<AuthUser>;
  registerStaff: (payload: RegisterStaffPayload) => Promise<RegistrationResult>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('moa_gym_token');
    const savedUser = localStorage.getItem('moa_gym_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Silently re-verify with /api/users/me
        apiRequest('/users/me')
          .then((profile) => {
            const updatedUser: AuthUser = {
              id: profile.id,
              employeeId: profile.employeeId,
              fullName: profile.fullName,
              department: profile.department,
              email: profile.email,
              photoUrl: profile.photoUrl,
              role: profile.role,
              waiverSigned: profile.waiverSigned,
            };
            setUser(updatedUser);
            localStorage.setItem('moa_gym_user', JSON.stringify(updatedUser));
          })
          .catch(() => {
            // invalid session, clear
            localStorage.removeItem('moa_gym_token');
            localStorage.removeItem('moa_gym_user');
            setUser(null);
            setToken(null);
          })
          .finally(() => setIsLoading(false));
      } catch (e) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<AuthUser> => {
    const res = await apiRequest<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password: pass }),
    });

    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('moa_gym_token', res.accessToken);
    localStorage.setItem('moa_gym_user', JSON.stringify(res.user));
    return res.user;
  };

  const claimAccount = async (
    employeeId: string,
    pass: string,
    shiftPreference?: string,
    fullName?: string,
  ): Promise<AuthUser> => {
    const res = await apiRequest<{ accessToken: string; user: AuthUser }>('/auth/claim', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password: pass, shiftPreference, fullName }),
    });

    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('moa_gym_token', res.accessToken);
    localStorage.setItem('moa_gym_user', JSON.stringify(res.user));
    return res.user;
  };

  const registerStaff = async (payload: RegisterStaffPayload): Promise<RegistrationResult> => {
    const res = await apiRequest<{ accessToken: string; user: AuthUser; registration: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('moa_gym_token', res.accessToken);
    localStorage.setItem('moa_gym_user', JSON.stringify(res.user));
    return { user: res.user, registration: res.registration };
  };

  const refreshProfile = async () => {
    try {
      const profile = await apiRequest('/users/me');
      const updatedUser: AuthUser = {
        id: profile.id,
        employeeId: profile.employeeId,
        fullName: profile.fullName,
        department: profile.department,
        email: profile.email,
        photoUrl: profile.photoUrl,
        role: profile.role,
        waiverSigned: profile.waiverSigned,
      };
      setUser(updatedUser);
      localStorage.setItem('moa_gym_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('moa_gym_token');
    localStorage.removeItem('moa_gym_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        claimAccount,
        registerStaff,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
