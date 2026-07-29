import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, QuestionStats, GamificationData, QuizResult, StudySession, StudyGoal } from '../types';

const KEYS = {
  USER_PREFERENCES: '@cyberlearn_user_preferences',
  QUESTION_STATS: '@cyberlearn_question_stats',
  GAMIFICATION: '@cyberlearn_gamification',
};

export class StorageService {
  // ===== User Preferences (quizResults, studySessions, studyGoals, activeSession) =====
  
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : { quizResults: [], studySessions: [], studyGoals: [], activeSession: null };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return { quizResults: [], studySessions: [], studyGoals: [], activeSession: null };
    }
  }

  static async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
    try {
      const existing = await this.getPreferences();
      const merged = { ...existing, ...patch };
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(merged));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  static async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  static async updateGithubToken(token: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      await this.updatePreferences({ ...preferences, ...{ } });
    } catch (error) {
      console.error('Error updating GitHub token:', error);
    }
  }

  // ===== Question Stats (spaced repetition) =====

  static async getAllQuestionStats(): Promise<Record<string, QuestionStats>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUESTION_STATS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting question stats:', error);
      return {};
    }
  }

  static async getQuestionStats(questionId: string): Promise<QuestionStats | null> {
    try {
      const all = await this.getAllQuestionStats();
      return all[questionId] || null;
    } catch (error) {
      console.error('Error getting question stats:', error);
      return null;
    }
  }

  static async saveQuestionStats(questionId: string, stats: QuestionStats): Promise<void> {
    try {
      const all = await this.getAllQuestionStats();
      all[questionId] = stats;
      await AsyncStorage.setItem(KEYS.QUESTION_STATS, JSON.stringify(all));
    } catch (error) {
      console.error('Error saving question stats:', error);
    }
  }

  // ===== Gamification Data =====

  static async getGamificationRaw(): Promise<GamificationData | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.GAMIFICATION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting gamification data:', error);
      return null;
    }
  }

  static async setGamificationRaw(data: GamificationData): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.GAMIFICATION, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  // ===== Convenience Methods =====

  static async saveQuizResult(result: QuizResult): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      prefs.quizResults.push(result);
      await this.updatePreferences({ quizResults: prefs.quizResults });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  static async getQuizResults(): Promise<QuizResult[]> {
    try {
      const prefs = await this.getPreferences();
      return prefs.quizResults || [];
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  }

  static async getActiveSession(): Promise<StudySession | null> {
    try {
      const prefs = await this.getPreferences();
      return prefs.activeSession || null;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  static async setActiveSession(session: StudySession | null): Promise<void> {
    try {
      await this.updatePreferences({ activeSession: session });
    } catch (error) {
      console.error('Error setting active session:', error);
    }
  }

  static async saveCompletedSession(session: StudySession): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      prefs.studySessions.push(session);
      await this.updatePreferences({ studySessions: prefs.studySessions, activeSession: null });
    } catch (error) {
      console.error('Error saving completed session:', error);
    }
  }

  static async getStudyGoals(): Promise<StudyGoal[]> {
    try {
      const prefs = await this.getPreferences();
      return prefs.studyGoals || [];
    } catch (error) {
      console.error('Error getting study goals:', error);
      return [];
    }
  }

  static async saveStudyGoals(goals: StudyGoal[]): Promise<void> {
    try {
      await this.updatePreferences({ studyGoals: goals });
    } catch (error) {
      console.error('Error saving study goals:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
