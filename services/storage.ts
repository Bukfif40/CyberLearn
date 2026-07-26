import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningProgress, UserPreferences } from '../types';

const KEYS = {
  USER_PREFERENCES: '@cyberlearn_user_preferences',
  LEARNING_PROGRESS: '@cyberlearn_learning_progress_',
  FAVORITES: '@cyberlearn_favorites',
};

export class StorageService {
  // User Preferences
  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  static async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  static async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
    try {
      const existing = (await this.getUserPreferences()) || {} as UserPreferences;
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify({ ...existing, ...patch }));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  static async updateGithubToken(token: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences();
      const updatedPreferences: UserPreferences = {
        ...preferences,
        githubToken: token,
        favoriteRoadmaps: preferences?.favoriteRoadmaps || [],
        learningGoals: preferences?.learningGoals || [],
        skillLevel: preferences?.skillLevel || 'beginner',
      };
      await this.saveUserPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating GitHub token:', error);
    }
  }

  // Favorites
  static async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addFavorite(roadmapId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(roadmapId)) {
        favorites.push(roadmapId);
        await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  static async removeFavorite(roadmapId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.filter(id => id !== roadmapId);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  static async isFavorite(roadmapId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(roadmapId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  // Learning Progress
  static async getLearningProgress(roadmapId: string): Promise<LearningProgress | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LEARNING_PROGRESS + roadmapId);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return null;
    }
  }

  static async saveLearningProgress(progress: LearningProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.LEARNING_PROGRESS + progress.roadmapId,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error('Error saving learning progress:', error);
    }
  }

  static async updateTopicProgress(
    roadmapId: string,
    topic: string,
    completed: boolean
  ): Promise<void> {
    try {
      const progress = await this.getLearningProgress(roadmapId);
      if (progress) {
        if (completed && !progress.completedTopics.includes(topic)) {
          progress.completedTopics.push(topic);
        } else if (!completed) {
          progress.completedTopics = progress.completedTopics.filter(t => t !== topic);
        }
        progress.lastAccessed = new Date().toISOString();
        await this.saveLearningProgress(progress);
      }
    } catch (error) {
      console.error('Error updating topic progress:', error);
    }
  }

  static async setCurrentTopic(roadmapId: string, topic: string | null): Promise<void> {
    try {
      const progress = await this.getLearningProgress(roadmapId);
      if (progress) {
        progress.currentTopic = topic;
        progress.lastAccessed = new Date().toISOString();
        await this.saveLearningProgress(progress);
      }
    } catch (error) {
      console.error('Error setting current topic:', error);
    }
  }

  static async updateNotes(roadmapId: string, notes: string): Promise<void> {
    try {
      const progress = await this.getLearningProgress(roadmapId);
      if (progress) {
        progress.notes = notes;
        progress.lastAccessed = new Date().toISOString();
        await this.saveLearningProgress(progress);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }

  // Get all learning progress for dashboard
  static async getAllLearningProgress(): Promise<LearningProgress[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const progressKeys = allKeys.filter(key => key.startsWith(KEYS.LEARNING_PROGRESS));
      const progressData = await AsyncStorage.multiGet(progressKeys);
      
      return progressData
        .map(([_, data]) => (data ? JSON.parse(data) : null))
        .filter(Boolean);
    } catch (error) {
      console.error('Error getting all learning progress:', error);
      return [];
    }
  }

  // Clear all data (for testing/logout)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
