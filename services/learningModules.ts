import { LearningModule, Lesson, ModuleProgress } from '../types';
import { LEARNING_MODULES, LEARNING_MODULE_IDS } from '../data/learningModules';
import { StorageService } from './storage';
import { GamificationService } from './gamification';

const LESSON_XP = 20;
const BOSS_BATTLE_PASS_BONUS_XP = 50;

const emptyProgress = (moduleId: string): ModuleProgress => ({
  moduleId,
  startedAt: null,
  lessons: {},
  bossBattleBestScore: null,
  bossBattlePassed: false,
  completedAt: null,
});

export class LearningModuleService {
  static getAllModules(): LearningModule[] {
    return LEARNING_MODULE_IDS.map(id => LEARNING_MODULES[id]);
  }

  static getModule(moduleId: string): LearningModule | undefined {
    return LEARNING_MODULES[moduleId];
  }

  static getLesson(moduleId: string, lessonId: string): Lesson | undefined {
    return this.getModule(moduleId)?.lessons.find(l => l.id === lessonId);
  }

  static async getModuleProgress(moduleId: string): Promise<ModuleProgress> {
    const stored = await StorageService.getModuleProgress(moduleId);
    return stored || emptyProgress(moduleId);
  }

  static async getAllModuleProgress(): Promise<Record<string, ModuleProgress>> {
    return StorageService.getAllModuleProgress();
  }

  static async markLessonComplete(moduleId: string, lessonId: string): Promise<void> {
    const module = this.getModule(moduleId);
    const lesson = this.getLesson(moduleId, lessonId);
    if (!module || !lesson) return;

    const progress = await this.getModuleProgress(moduleId);
    if (progress.lessons[lessonId]?.completedAt) {
      // Already completed — no-op, so XP is never double-awarded.
      return;
    }

    if (!progress.startedAt) {
      progress.startedAt = new Date().toISOString();
    }
    progress.lessons[lessonId] = { lessonId, completedAt: new Date().toISOString() };

    await StorageService.saveModuleProgress(moduleId, progress);
    await GamificationService.addXP(LESSON_XP);
  }

  static async recordBossBattleResult(moduleId: string, score: number): Promise<{ passed: boolean }> {
    const module = this.getModule(moduleId);
    if (!module) return { passed: false };

    const progress = await this.getModuleProgress(moduleId);
    progress.bossBattleBestScore = Math.max(progress.bossBattleBestScore ?? 0, score);

    const passed = score >= module.bossBattle.passThreshold;
    if (passed) {
      const firstPassForThisModule = !progress.bossBattlePassed;
      progress.bossBattlePassed = true;
      if (firstPassForThisModule) {
        progress.completedAt = new Date().toISOString();
        await GamificationService.addXP(BOSS_BATTLE_PASS_BONUS_XP);
        // Idempotent: unlockAchievement only fires the first time this is
        // ever called, regardless of which module triggers it.
        await GamificationService.unlockAchievement('module_master');
      }
    }

    await StorageService.saveModuleProgress(moduleId, progress);
    return { passed };
  }
}
