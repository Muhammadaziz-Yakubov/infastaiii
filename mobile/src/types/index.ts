// Core type definitions for the InFast AI mobile app

export interface User {
  _id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  authProvider: 'email' | 'google' | 'phone';
  isActive: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  lastLogin: string;
  subscriptionType: 'free' | 'premium' | 'enterprise';
  subscriptionPlan?: string;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'expired';
  subscriptionEndDate?: string;
  telegramChatId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLinkedAt?: string;
  telegramNotifications: {
    enabled: boolean;
    debts: boolean;
    tasks: boolean;
    goals: boolean;
    dailyReport: boolean;
  };
  familyId?: string;
  familyRole?: 'admin' | 'member' | 'child' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  estimatedTime?: number;
  actualTime?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  goalType: 'financial' | 'personal' | 'career' | 'health' | 'education';
  targetAmount?: number;
  currentAmount: number;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  steps?: GoalStep[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalStep {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Finance {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  receipt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'individual' | 'team';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  rewards?: string[];
  createdBy: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeParticipant {
  _id: string;
  challengeId: string;
  userId: string;
  joinedAt: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: string;
}

export interface Debt {
  _id: string;
  userId: string;
  type: 'given' | 'taken';
  personName: string;
  personContact?: string;
  amount: number;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: any;
  createdAt: string;
}

export interface ChatGroup {
  _id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdBy: string;
  members: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  messageType: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  timestamp: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  tasks: Task[];
  goals: Goal[];
  finances: Finance[];
  challenges: Challenge[];
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
  language: 'uz' | 'en';
  isOnline: boolean;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  estimatedTime?: number;
  tags?: string[];
}

export interface CreateGoalData {
  title: string;
  description?: string;
  goalType: 'financial' | 'personal' | 'career' | 'health' | 'education';
  targetAmount?: number;
  targetDate?: string;
}

export interface CreateFinanceData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  receipt?: string;
  tags?: string[];
}

export interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  finances: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
  };
  challenges: {
    active: number;
    completed: number;
    inProgress: number;
  };
}
