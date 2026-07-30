import { GamificationData, Achievement } from '../types';
import { StorageService } from './storage';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'Quiz Beginner',
    description: 'Complete your first quiz',
    icon: '📝',
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
    id: 'domain_master',
    title: 'Domain Master',
    description: 'Achieve 90%+ accuracy in any domain',
    icon: '🎯',
    unlockedAt: null,
    rarity: 'rare',
  },
  {
    id: 'exam_ready',
    title: 'Exam Ready',
    description: 'Achieve 80%+ overall readiness',
    icon: '🏆',
    unlockedAt: null,
    rarity: 'epic',
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
    id: 'module_master',
    title: 'Module Master',
    description: 'Complete your first Learning Module',
    icon: '🎓',
    unlockedAt: null,
    rarity: 'rare',
  },
];

export class GamificationService {
  static async getGamificationData(): Promise<GamificationData> {
    try {
      const stored = await StorageService.getGamificationRaw();
      if (stored) {
        // Merge with default achievements to ensure all exist
        return {
          ...stored,
          achievements: ACHIEVEMENTS.map(ach => {
            const saved = stored.achievements?.find((a: Achievement) => a.id === ach.id);
            return saved ? { ...ach, unlockedAt: saved.unlockedAt } : ach;
          }),
        };
      }
      // Return defaults
      return {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString(),
        achievements: ACHIEVEMENTS.map(ach => ({ ...ach })),
        totalStudyTime: 0,
      };
    } catch (error) {
      console.error('Error getting gamification data:', error);
      return {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString(),
        achievements: ACHIEVEMENTS.map(ach => ({ ...ach })),
        totalStudyTime: 0,
      };
    }
  }

  static async saveGamificationData(data: GamificationData): Promise<void> {
    try {
      await StorageService.setGamificationRaw(data);
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  static async addXP(amount: number): Promise<void> {
    const data = await this.getGamificationData();
    data.xp += amount;
    data.level = this.calculateLevel(data.xp);
    await this.saveGamificationData(data);
    await this.checkLevelAchievements(data);
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
    } else {
      // Streak broken
      data.streak = 1;
    }

    data.lastActiveDate = new Date().toISOString();
    await this.saveGamificationData(data);
    await this.checkStreakAchievements(data);
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

  private static calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private static getXPForRarity(rarity: string): number {
    switch (rarity) {
      case 'common':
        return 50;
      case 'rare':
        return 150;
      case 'epic':
        return 300;
      case 'legendary':
        return 500;
      default:
        return 50;
    }
  }

  private static async checkLevelAchievements(data: GamificationData): Promise<void> {
    if (data.level >= 5) await this.unlockAchievement('level_5');
    if (data.level >= 10) await this.unlockAchievement('level_10');
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
