import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamificationService } from '../gamification';
import { StorageService } from '../storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('getGamificationData', () => {
  it('returns sensible defaults when nothing is stored', async () => {
    const data = await GamificationService.getGamificationData();
    expect(data.xp).toBe(0);
    expect(data.level).toBe(1);
    expect(data.streak).toBe(0);
    expect(data.totalStudyTime).toBe(0);
    expect(data.achievements.every(a => a.unlockedAt === null)).toBe(true);
  });
});

describe('addXP / leveling', () => {
  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [399, 2],
    [400, 3],
    [1599, 4],
    [1600, 5],
  ])('xp=%i results in level %i', async (xp, expectedLevel) => {
    await GamificationService.addXP(xp);
    const data = await GamificationService.getGamificationData();
    expect(data.level).toBe(expectedLevel);
  });

  it('accumulates xp across multiple calls', async () => {
    await GamificationService.addXP(30);
    await GamificationService.addXP(20);
    const data = await GamificationService.getGamificationData();
    expect(data.xp).toBe(50);
  });

  it('unlocks the level_5 achievement once level 5 is reached', async () => {
    await GamificationService.addXP(1600);
    const data = await GamificationService.getGamificationData();
    const achievement = data.achievements.find(a => a.id === 'level_5');
    expect(achievement?.unlockedAt).not.toBeNull();
  });

  it('does not unlock the level_5 achievement below level 5', async () => {
    await GamificationService.addXP(1599);
    const data = await GamificationService.getGamificationData();
    const achievement = data.achievements.find(a => a.id === 'level_5');
    expect(achievement?.unlockedAt).toBeNull();
  });
});

describe('updateStreak', () => {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  it('leaves the streak unchanged when already active today', async () => {
    const data = await GamificationService.getGamificationData();
    data.streak = 5;
    data.lastActiveDate = new Date().toISOString();
    await StorageService.setGamificationRaw(data);

    await GamificationService.updateStreak();

    const updated = await GamificationService.getGamificationData();
    expect(updated.streak).toBe(5);
  });

  it('increments the streak on a consecutive day', async () => {
    const data = await GamificationService.getGamificationData();
    data.streak = 5;
    data.lastActiveDate = daysAgo(1);
    await StorageService.setGamificationRaw(data);

    await GamificationService.updateStreak();

    const updated = await GamificationService.getGamificationData();
    expect(updated.streak).toBe(6);
  });

  it('resets the streak to 1 when a day is missed', async () => {
    const data = await GamificationService.getGamificationData();
    data.streak = 5;
    data.lastActiveDate = daysAgo(3);
    await StorageService.setGamificationRaw(data);

    await GamificationService.updateStreak();

    const updated = await GamificationService.getGamificationData();
    expect(updated.streak).toBe(1);
  });

  it('unlocks the week_streak achievement at a 7-day streak', async () => {
    const data = await GamificationService.getGamificationData();
    data.streak = 6;
    data.lastActiveDate = daysAgo(1);
    await StorageService.setGamificationRaw(data);

    await GamificationService.updateStreak();

    const updated = await GamificationService.getGamificationData();
    const achievement = updated.achievements.find(a => a.id === 'week_streak');
    expect(achievement?.unlockedAt).not.toBeNull();
  });
});

describe('unlockAchievement', () => {
  it('sets unlockedAt and awards xp for the achievement rarity', async () => {
    await GamificationService.unlockAchievement('first_quiz');
    const data = await GamificationService.getGamificationData();
    const achievement = data.achievements.find(a => a.id === 'first_quiz');
    expect(achievement?.unlockedAt).not.toBeNull();
    expect(data.xp).toBe(50); // 'common' rarity reward
  });

  it('is a no-op the second time it is unlocked', async () => {
    await GamificationService.unlockAchievement('first_quiz');
    await GamificationService.unlockAchievement('first_quiz');
    const data = await GamificationService.getGamificationData();
    expect(data.xp).toBe(50);
  });

  it('does nothing for an unknown achievement id', async () => {
    await GamificationService.unlockAchievement('does_not_exist');
    const data = await GamificationService.getGamificationData();
    expect(data.xp).toBe(0);
  });
});

describe('addStudyTime', () => {
  it('accumulates minutes across calls', async () => {
    await GamificationService.addStudyTime(10);
    await GamificationService.addStudyTime(15);
    const data = await GamificationService.getGamificationData();
    expect(data.totalStudyTime).toBe(25);
  });
});

describe('getXPForNextLevel', () => {
  it.each([
    [1, 100],
    [2, 400],
    [5, 2500],
  ])('level %i requires %i total xp for the next level', (level, expected) => {
    expect(GamificationService.getXPForNextLevel(level)).toBe(expected);
  });
});

describe('getProgressToNextLevel', () => {
  it('computes the percentage progress within the current level band', () => {
    // level 2 spans xp [100, 400); 150 xp is 50/300 of the way through
    const progress = GamificationService.getProgressToNextLevel(150, 2);
    expect(progress).toBeCloseTo((50 / 300) * 100, 5);
  });

  it('caps progress at 100 even if xp exceeds the next level threshold', () => {
    const progress = GamificationService.getProgressToNextLevel(500, 2);
    expect(progress).toBe(100);
  });

  it('is 0 at the start of a level', () => {
    const progress = GamificationService.getProgressToNextLevel(100, 2);
    expect(progress).toBe(0);
  });
});
