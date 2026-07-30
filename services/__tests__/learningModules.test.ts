import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningModuleService } from '../learningModules';
import { GamificationService } from '../gamification';
import { LEARNING_MODULE_IDS } from '../../data/learningModules';

const MODULE_ID = 'threats-vulnerabilities-mitigations';
const OTHER_MODULE_ID = 'security-operations';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('getAllModules / getModule / getLesson', () => {
  it('returns all modules in LEARNING_MODULE_IDS order', () => {
    const modules = LearningModuleService.getAllModules();
    expect(modules.map(m => m.id)).toEqual([...LEARNING_MODULE_IDS]);
  });

  it('looks up a module and one of its lessons by id', () => {
    const module = LearningModuleService.getModule(MODULE_ID)!;
    const lesson = LearningModuleService.getLesson(MODULE_ID, module.lessons[0].id);
    expect(lesson).toBe(module.lessons[0]);
  });

  it('returns undefined for an unknown module or lesson id', () => {
    expect(LearningModuleService.getModule('nope')).toBeUndefined();
    expect(LearningModuleService.getLesson(MODULE_ID, 'nope')).toBeUndefined();
  });
});

describe('getModuleProgress', () => {
  it('returns an empty default shape when nothing is stored', async () => {
    const progress = await LearningModuleService.getModuleProgress(MODULE_ID);
    expect(progress).toEqual({
      moduleId: MODULE_ID,
      startedAt: null,
      lessons: {},
      bossBattleBestScore: null,
      bossBattlePassed: false,
      completedAt: null,
    });
  });
});

describe('markLessonComplete', () => {
  it('marks the lesson complete and awards xp once', async () => {
    const module = LearningModuleService.getModule(MODULE_ID)!;
    const lessonId = module.lessons[0].id;

    await LearningModuleService.markLessonComplete(MODULE_ID, lessonId);

    const progress = await LearningModuleService.getModuleProgress(MODULE_ID);
    expect(progress.lessons[lessonId].completedAt).not.toBeNull();
    expect(progress.startedAt).not.toBeNull();

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBe(20);
  });

  it('is idempotent: completing the same lesson twice does not double-award xp', async () => {
    const module = LearningModuleService.getModule(MODULE_ID)!;
    const lessonId = module.lessons[0].id;

    await LearningModuleService.markLessonComplete(MODULE_ID, lessonId);
    await LearningModuleService.markLessonComplete(MODULE_ID, lessonId);

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBe(20);
  });

  it('is a no-op for an unknown module or lesson id', async () => {
    await LearningModuleService.markLessonComplete('nope', 'nope');
    await LearningModuleService.markLessonComplete(MODULE_ID, 'nope');

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBe(0);
  });
});

describe('recordBossBattleResult', () => {
  it('records a failing score without marking the module passed or awarding bonus xp', async () => {
    const { passed } = await LearningModuleService.recordBossBattleResult(MODULE_ID, 50);
    expect(passed).toBe(false);

    const progress = await LearningModuleService.getModuleProgress(MODULE_ID);
    expect(progress.bossBattleBestScore).toBe(50);
    expect(progress.bossBattlePassed).toBe(false);
    expect(progress.completedAt).toBeNull();

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBe(0);
  });

  it('marks the module passed and awards bonus xp + the module_master achievement on a passing score', async () => {
    const { passed } = await LearningModuleService.recordBossBattleResult(MODULE_ID, 80);
    expect(passed).toBe(true);

    const progress = await LearningModuleService.getModuleProgress(MODULE_ID);
    expect(progress.bossBattlePassed).toBe(true);
    expect(progress.completedAt).not.toBeNull();

    const gamification = await GamificationService.getGamificationData();
    // 50 boss-battle bonus + 150 for the 'rare' module_master achievement itself.
    expect(gamification.xp).toBe(200);
    const achievement = gamification.achievements.find(a => a.id === 'module_master');
    expect(achievement?.unlockedAt).not.toBeNull();
  });

  it('tracks the best score across multiple attempts without re-awarding on repeat passes', async () => {
    await LearningModuleService.recordBossBattleResult(MODULE_ID, 80);
    await LearningModuleService.recordBossBattleResult(MODULE_ID, 90);

    const progress = await LearningModuleService.getModuleProgress(MODULE_ID);
    expect(progress.bossBattleBestScore).toBe(90);

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBe(200); // bonus + achievement only awarded once, on the first pass
  });

  it('unlocks module_master only once, even when a second module is later completed', async () => {
    await LearningModuleService.recordBossBattleResult(MODULE_ID, 80);
    const xpAfterFirst = (await GamificationService.getGamificationData()).xp;

    await LearningModuleService.recordBossBattleResult(OTHER_MODULE_ID, 80);
    const dataAfterSecond = await GamificationService.getGamificationData();

    // Both modules pay out their own completion bonus, but the achievement itself doesn't re-fire.
    expect(dataAfterSecond.xp).toBe(xpAfterFirst + 50);
    const achievement = dataAfterSecond.achievements.find(a => a.id === 'module_master');
    expect(achievement?.unlockedAt).not.toBeNull();
  });

  it('returns passed: false for an unknown module id without throwing', async () => {
    const result = await LearningModuleService.recordBossBattleResult('nope', 100);
    expect(result).toEqual({ passed: false });
  });
});
