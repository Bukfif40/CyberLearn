export interface Roadmap {
  id: string;
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  updated_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface IndustryStandards {
  score: number;
  criteria: {
    frameworks: {
      nist: boolean;
      mitre: boolean;
      iso: boolean;
      sans: boolean;
    };
    certifications: {
      comptia: boolean;
      cissp: boolean;
      oscp: boolean;
      ceh: boolean;
      aws: boolean;
    };
    hands_on: {
      tryhackme: boolean;
      hackthebox: boolean;
      labs: boolean;
      projects: boolean;
    };
    structure: {
      beginner: boolean;
      intermediate: boolean;
      advanced: boolean;
      career: boolean;
    };
  };
}

export interface LearningProgress {
  roadmapId: string;
  completedTopics: string[];
  currentTopic: string | null;
  startedAt: string;
  lastAccessed: string;
  notes: string;
}

export interface UserPreferences {
  githubToken: string;
  favoriteRoadmaps: string[];
  learningGoals: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  quizResults?: QuizResult[];
  studySessions?: StudySession[];
  studyGoals?: StudyGoal[];
  platformProgress?: PlatformProgress[];
  activeSession?: StudySession;
  viewedRoadmaps?: string[];
  notesCount?: number;
}

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  totalStudyTime: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type CareerPath = 'soc_analyst' | 'penetration_tester' | 'grc_analyst' | 'cloud_security' | 'incident_responder' | 'detection_engineer';

export interface CareerPathData {
  id: CareerPath;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  salaryRange: string;
  certifications: string[];
  keySkills: string[];
  searchKeywords: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
}

export interface StudySession {
  id: string;
  roadmapId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
  notes: string;
  topicsCovered: string[];
}

export interface StudyGoal {
  id: string;
  title: string;
  targetMinutes: number;
  currentMinutes: number;
  deadline: string;
  completed: boolean;
}

export interface ExternalPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
  description: string;
  features: string[];
}

export interface PlatformProgress {
  platformId: string;
  username: string;
  completedRooms: number;
  totalRooms: number;
  rank: string;
  lastUpdated: string;
}
