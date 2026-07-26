import { GamificationData, Achievement } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';

const GAMIFICATION_KEY = '@cyberlearn_gamification';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Start your first learning track',
    icon: '🎯',
    unlockedAt: null,
    rarity: 'common',
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    unlockedAt: null,
    rarity: 'rare',
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '⚡',
    unlockedAt: null,
    rarity: 'epic',
  },
  {
    id: 'roadmap_explorer',
    title: 'Roadmap Explorer',
    description: 'View 10 different roadmaps',
    icon: '🗺️',
    unlockedAt: null,
    rarity: 'common',
  },
  {
    id: 'note_taker',
    title: 'Note Taker',
    description: 'Add notes to 5 different roadmaps',
    icon: '📝',
    unlockedAt: null,
    rarity: 'common',
  },
  {
    id: 'cert_aware',
    title: 'Certification Aware',
    description: 'View a roadmap with certification content',
    icon: '📜',
    unlockedAt: null,
    rarity: 'common',
  },
  {
    id: 'industry_standards',
    title: 'Industry Standards',
    description: 'View a roadmap with 80%+ industry standards score',
    icon: '🏆',
    unlockedAt: null,
    rarity: 'rare',
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    unlockedAt: null,
    rarity: 'common',
  },
  {
    id: 'level_10',
    title: 'Skilled Learner',
    description: 'Reach level 10',
    icon: '🌟',
    unlockedAt: null,
    rarity: 'rare',
  },
  {
    id: 'level_25',
    title: 'Expert',
    description: 'Reach level 25',
    icon: '💫',
    unlockedAt: null,
    rarity: 'epic',
  },
];

export class GamificationService {
  static async getGamificationData(): Promise<GamificationData> {
    try {
      const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with default achievements to ensure all achievements exist
        return {
          ...parsed,
          achievements: ACHIEVEMENTS.map(ach => {
            const saved = parsed.achievements?.find((a: Achievement) => a.id === ach.id);
            return saved ? { ...ach, unlockedAt: saved.unlockedAt } : ach;
          }),
        };
      }
      // Return default data if not exists
      return {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString(),
        achievements: ACHIEVEMENTS,
        totalStudyTime: 0,
      };
    } catch (error) {
      console.error('Error getting gamification data:', error);
      return {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString(),
        achievements: ACHIEVEMENTS,
        totalStudyTime: 0,
      };
    }
  }

  static async saveGamificationData(data: GamificationData): Promise<void> {
    try {
      await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  static async addXP(amount: number): Promise<void> {
    const data = await this.getGamificationData();
    data.xp += amount;
    data.level = this.calculateLevel(data.xp);
    await this.saveGamificationData(data);
    this.checkLevelAchievements(data);
  }

  static async updateStreak(): Promise<void> {
    const data = await this.getGamificationData();
    const today = new Date().toDateString();
    const lastActive = new Date(data.lastActiveDate).toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (today === lastActive) {
      // Already active today, no change
      return;
    } else if (lastActive === yesterdayString) {
      // Consecutive day
      data.streak += 1;
    } else if (lastActive !== today) {
      // Streak broken
      data.streak = 1;
    }

    data.lastActiveDate = new Date().toISOString();
    await this.saveGamificationData(data);
    this.checkStreakAchievements(data);
  }

  static async unlockAchievement(achievementId: string): Promise<void> {
    const data = await this.getGamificationData();
    const achievement = data.achievements.find(a => a.id === achievementId);
    
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString();
      await this.saveGamificationData(data);
      
      // Award XP for achievement
      const xpReward = this.getXPForRarity(achievement.rarity);
      await this.addXP(xpReward);
    }
  }

  static async addStudyTime(minutes: number): Promise<void> {
    const data = await this.getGamificationData();
    data.totalStudyTime += minutes;
    await this.saveGamificationData(data);
  }

  static async logViewedRoadmap(roadmapId: string): Promise<void> {
    try {
      const viewed = await StorageService.getUserPreferences();
      const viewedRoadmaps = viewed?.viewedRoadmaps || [];
      
      if (!viewedRoadmaps.includes(roadmapId)) {
        viewedRoadmaps.push(roadmapId);
        await StorageService.updatePreferences({ viewedRoadmaps });
        
        if (viewedRoadmaps.length >= 10) {
          await this.unlockAchievement('roadmap_explorer');
        }
      }
    } catch (error) {
      console.error('Error logging viewed roadmap:', error);
    }
  }

  static async logNoteAdded(): Promise<void> {
    try {
      const preferences = await StorageService.getUserPreferences();
      const notesCount = preferences?.notesCount || 0;
      const newCount = notesCount + 1;
      
      await StorageService.updatePreferences({ notesCount: newCount });
      
      if (newCount >= 5) {
        await this.unlockAchievement('note_taker');
      }
    } catch (error) {
      console.error('Error logging note added:', error);
    }
  }

  private static calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private static getXPForRarity(rarity: string): number {
    switch (rarity) {
      case 'common': return 50;
      case 'rare': return 150;
      case 'epic': return 300;
      case 'legendary': return 500;
      default: return 50;
    }
  }

  private static async checkLevelAchievements(data: GamificationData): Promise<void> {
    if (data.level >= 5) await this.unlockAchievement('level_5');
    if (data.level >= 10) await this.unlockAchievement('level_10');
    if (data.level >= 25) await this.unlockAchievement('level_25');
  }

  private static async checkStreakAchievements(data: GamificationData): Promise<void> {
    if (data.streak >= 7) await this.unlockAchievement('week_streak');
    if (data.streak >= 30) await this.unlockAchievement('month_streak');
  }

  static getXPForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  static getProgressToNextLevel(currentXP: number, currentLevel: number): number {
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const progress = currentXP - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    return Math.min((progress / needed) * 100, 100);
  }
}
