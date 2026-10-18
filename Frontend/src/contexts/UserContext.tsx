import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserData {
  age: number;
  gender: string;
  weight: number;
  height: number;
  activity_level: string;
  dietary_restrictions: string[];
  health_conditions: string[];
  preferred_cuisine: string;
  current_mood: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  userData?: UserData;
  createdAt?: string;
}

interface RegisteredAccount {
  uid: string;
  email: string;
  username?: string;
  password: string;
  displayName: string;
  userData?: UserData;
  createdAt: string;
}

// 2 Pre-configured accounts with password: password123
const DEFAULT_ACCOUNTS: Record<string, RegisteredAccount> = {
  'demo@example.com': {
    uid: 'demo-user-001',
    email: 'demo@example.com',
    username: 'demo',
    password: 'password123',
    displayName: 'Demo User',
    createdAt: '2026-01-01T00:00:00Z',
    userData: {
      age: 26,
      gender: 'Female',
      weight: 62,
      height: 165,
      activity_level: 'Medium Active',
      dietary_restrictions: ['vegetarian'],
      health_conditions: [],
      preferred_cuisine: 'North Indian',
      current_mood: 'energetic',
      calorieGoal: 1850,
      proteinGoal: 65,
      carbsGoal: 230,
      fatGoal: 50,
    },
  },
  'test@example.com': {
    uid: 'test-user-002',
    email: 'test@example.com',
    username: 'test',
    password: 'password123',
    displayName: 'Test User',
    createdAt: '2026-01-01T00:00:00Z',
    userData: {
      age: 30,
      gender: 'Male',
      weight: 75,
      height: 178,
      activity_level: 'Highly Active',
      dietary_restrictions: ['non-vegetarian'],
      health_conditions: [],
      preferred_cuisine: 'Indian',
      current_mood: 'motivated',
      calorieGoal: 2400,
      proteinGoal: 95,
      carbsGoal: 280,
      fatGoal: 65,
    },
  },
};

const normalizeIdentifier = (input: string): string => {
  const clean = input.trim().toLowerCase();
  if (clean === 'demo' || clean === 'demo@nutrimind.com') return 'demo@example.com';
  if (clean === 'test' || clean === 'test@nutrimind.com') return 'test@example.com';
  return clean;
};

const getRegisteredAccounts = (): Record<string, RegisteredAccount> => {
  try {
    const raw = localStorage.getItem('nutrimind_registered_accounts');
    if (!raw) {
      localStorage.setItem('nutrimind_registered_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    // Ensure demo and test are always present with password123
    if (!parsed['demo@example.com'] || parsed['demo@example.com'].password !== 'password123') {
      parsed['demo@example.com'] = DEFAULT_ACCOUNTS['demo@example.com'];
      updated = true;
    }
    if (!parsed['test@example.com'] || parsed['test@example.com'].password !== 'password123') {
      parsed['test@example.com'] = DEFAULT_ACCOUNTS['test@example.com'];
      updated = true;
    }
    if (updated) {
      localStorage.setItem('nutrimind_registered_accounts', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isDarkMode: boolean;
  hasCompletedForm: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  updateUserData: (data: UserData) => Promise<void>;
  getUserData: () => UserData | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();

  // Check if user has completed the initial form
  const hasCompletedForm = user?.userData !== undefined;

  useEffect(() => {
    // Initialize default accounts in local storage
    getRegisteredAccounts();

    // Check for saved active session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser.createdAt && parsedUser.email) {
          const accounts = getRegisteredAccounts();
          const acc = Object.values(accounts).find(
            (a) => a.email.toLowerCase() === parsedUser.email.toLowerCase()
          );
          if (acc?.createdAt) {
            parsedUser.createdAt = acc.createdAt;
          }
        }
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const cleanIdentifier = identifier.trim();
      const cleanPass = pass.trim();

      if (!cleanIdentifier) {
        throw new Error('Please enter your email or username.');
      }
      if (!cleanPass) {
        throw new Error('Please enter your password.');
      }

      const normalized = normalizeIdentifier(cleanIdentifier);
      const accounts = getRegisteredAccounts();

      // Find user by normalized email OR username
      const account = Object.values(accounts).find(
        (acc) =>
          acc.email.toLowerCase() === normalized ||
          (acc.username && acc.username.toLowerCase() === cleanIdentifier.toLowerCase())
      );

      if (!account) {
        throw new Error('Account not found. Please Sign Up to create your account.');
      }

      if (account.password !== cleanPass) {
        throw new Error('Incorrect password. Please verify your password and try again.');
      }

      // Check if user has saved profile in localStorage
      const savedUserData =
        account.userData ||
        JSON.parse(localStorage.getItem(`userData_${account.email}`) || 'null');

      const loggedInUser: User = {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName || account.email.split('@')[0],
        photoURL: null,
        userData: savedUserData || undefined,
        createdAt: account.createdAt,
      };

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      navigate(loggedInUser.userData ? '/dashboard' : '/form');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    emailInput: string,
    pass: string,
    displayNameInput: string,
    usernameInput?: string
  ) => {
    setIsLoading(true);
    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const cleanPass = pass.trim();
      const cleanDisplayName = displayNameInput.trim();
      const cleanUsername = (usernameInput || cleanDisplayName || cleanEmail.split('@')[0]).trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error('Email address is required.');
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!cleanPass) {
        throw new Error('Password is required.');
      }
      if (cleanPass.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (!cleanDisplayName) {
        throw new Error('Display name is required.');
      }

      const normalized = normalizeIdentifier(cleanEmail);
      const accounts = getRegisteredAccounts();

      // Check if already exists by email or username
      const existingAccount = Object.values(accounts).find(
        (acc) =>
          acc.email.toLowerCase() === normalized ||
          (acc.username && acc.username.toLowerCase() === cleanUsername)
      );

      if (existingAccount) {
        throw new Error('An account with this email or username already exists. Please Sign In.');
      }

      // Create new registered account
      const newAccount: RegisteredAccount = {
        uid: `user_${Date.now()}`,
        email: normalized,
        username: cleanUsername,
        password: cleanPass,
        displayName: cleanDisplayName,
        createdAt: new Date().toISOString(),
      };

      accounts[normalized] = newAccount;
      localStorage.setItem('nutrimind_registered_accounts', JSON.stringify(accounts));

      const registeredUser: User = {
        uid: newAccount.uid,
        email: newAccount.email,
        displayName: newAccount.displayName,
        photoURL: null,
        createdAt: newAccount.createdAt,
      };

      setUser(registeredUser);
      localStorage.setItem('user', JSON.stringify(registeredUser));

      // Asynchronously sync user with Backend / MongoDB
      try {
        fetch('http://localhost:5000/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newAccount.email,
            display_name: newAccount.displayName,
          }),
        }).catch(() => {});
      } catch {}

      navigate('/form');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateUserData = async (data: UserData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      userData: data,
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem(`userData_${user.email}`, JSON.stringify(data));

    // Update in registered accounts database
    try {
      const accounts = getRegisteredAccounts();
      if (accounts[user.email]) {
        accounts[user.email].userData = data;
        localStorage.setItem('nutrimind_registered_accounts', JSON.stringify(accounts));
      }
    } catch {}

    // Asynchronously sync profile to Backend / MongoDB
    try {
      fetch('http://localhost:5000/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          display_name: user.displayName,
          ...data,
        }),
      }).catch(() => {});
    } catch {}

    navigate('/dashboard');
  };

  const getUserData = () => {
    return user?.userData;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isDarkMode,
        hasCompletedForm,
        login,
        register,
        logout,
        toggleTheme,
        updateUserData,
        getUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 