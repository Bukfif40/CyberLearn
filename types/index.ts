// Security+ SY0-701 Domains
export type SecurityDomain =
  | 'general_security_concepts'
  | 'threats_vulnerabilities_mitigations'
  | 'security_architecture'
  | 'security_operations'
  | 'security_program_management';

export interface DomainInfo {
  title: string;
  weight: number; // Exam percentage
  icon: string;
}

export const DOMAIN_INFO: Record<SecurityDomain, DomainInfo> = {
  general_security_concepts: {
    title: 'General Security Concepts',
    weight: 12,
    icon: '🔐',
  },
  threats_vulnerabilities_mitigations: {
    title: 'Threats, Vulnerabilities & Mitigations',
    weight: 22,
    icon: '⚠️',
  },
  security_architecture: {
    title: 'Security Architecture',
    weight: 18,
    icon: '🏗️',
  },
  security_operations: {
    title: 'Security Operations',
    weight: 28,
    icon: '🛡️',
  },
  security_program_management: {
    title: 'Security Program Management',
    weight: 20,
    icon: '📋',
  },
};

// Quiz types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: SecurityDomain;
}

export interface QuestionStats {
  questionId: string;
  boxLevel: number; // 1-5 Leitner system
  timesCorrect: number;
  timesIncorrect: number;
  lastSeenAt: string | null; // ISO string
  nextReviewAt: string | null; // ISO string
}

export interface QuizResult {
  quizId: string;
  score: number; // Percentage
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // Seconds
  completedAt: string; // ISO string
  domainBreakdown: Record<SecurityDomain, { correct: number; total: number }>;
  answers: number[]; // Answer indices for each question
}

export interface DomainReadiness {
  domain: SecurityDomain;
  title: string;
  weight: number; // Official exam weight %
  accuracy: number; // Percentage correct
  questionsAnswered: number;
  totalQuestions: number;
  coverage: number; // Percentage of questions seen
}

// Study resources
export type ResourceType = 'video' | 'reading' | 'official' | 'practice_exam' | 'guide';

export interface StudyResource {
  id: string;
  title: string;
  type: ResourceType;
  domain: SecurityDomain | 'all';
  url: string;
  description: string;
  free: boolean;
}

// Gamification
export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // ISO string
  achievements: Achievement[];
  totalStudyTime: number; // Minutes
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO string
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Study session management
export interface StudySession {
  id: string;
  startedAt: string; // ISO string
  endedAt: string | null; // ISO string
  duration: number; // Minutes
  xpEarned: number;
  questionsAttempted: number;
  correctAnswers: number;
  startTime?: string; // For compatibility with old components
}

export interface StudyGoal {
  id: string;
  domain: SecurityDomain | 'all';
  targetAccuracy: number; // Percentage
  targetQuestionsPerDay: number;
  deadline: string; // ISO string
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string; // ISO string
  title?: string; // For compatibility with StudyGoals component
  completed?: boolean; // For compatibility
  currentMinutes?: number; // For compatibility
  targetMinutes?: number; // For compatibility
}

// User preferences (stored as single AsyncStorage key)
export interface UserPreferences {
  quizResults: QuizResult[];
  studySessions: StudySession[];
  studyGoals: StudyGoal[];
  activeSession: StudySession | null;
}
