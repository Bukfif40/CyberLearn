import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyTimerService } from '../studyTimer';
import { StorageService } from '../storage';
import { GamificationService } from '../gamification';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const minutesAgo = (n: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d;
};

describe('startSession / endSession', () => {
  it('starts a session with zeroed-out fields', async () => {
    const sessionId = await StudyTimerService.startSession();
    const active = await StudyTimerService.getActiveSession();

    expect(active?.id).toBe(sessionId);
    expect(active?.endedAt).toBeNull();
    expect(active?.duration).toBe(0);
  });

  it('throws when ending a session that was never started', async () => {
    await expect(StudyTimerService.endSession('does_not_exist')).rejects.toThrow(
      'No active session found'
    );
  });

  it('throws when the sessionId does not match the active session', async () => {
    await StudyTimerService.startSession();
    await expect(StudyTimerService.endSession('wrong_id')).rejects.toThrow(
      'No active session found'
    );
  });

  it('computes duration from elapsed time and clears the active session', async () => {
    const sessionId = await StudyTimerService.startSession();
    const active = await StorageService.getActiveSession();
    await StorageService.setActiveSession({ ...active!, startedAt: minutesAgo(25).toISOString() });

    await StudyTimerService.endSession(sessionId, 0, 10, 8);

    expect(await StudyTimerService.getActiveSession()).toBeNull();

    const sessions = await StudyTimerService.getStudySessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].duration).toBe(25);
    expect(sessions[0].questionsAttempted).toBe(10);
    expect(sessions[0].correctAnswers).toBe(8);
  });

  it('awards study time and xp (capped at 100) on session end', async () => {
    const sessionId = await StudyTimerService.startSession();
    const active = await StorageService.getActiveSession();
    await StorageService.setActiveSession({ ...active!, startedAt: minutesAgo(150).toISOString() });

    await StudyTimerService.endSession(sessionId);

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.totalStudyTime).toBe(150);
    expect(gamification.xp).toBe(100); // duration (150) capped at 100
  });
});

describe('getSessionDuration', () => {
  it('returns 0 when the sessionId does not match the active session', async () => {
    await StudyTimerService.startSession();
    expect(await StudyTimerService.getSessionDuration('wrong_id')).toBe(0);
  });

  it('returns elapsed seconds for the matching active session', async () => {
    const sessionId = await StudyTimerService.startSession();
    const active = await StorageService.getActiveSession();
    await StorageService.setActiveSession({ ...active!, startedAt: minutesAgo(2).toISOString() });

    const duration = await StudyTimerService.getSessionDuration(sessionId);
    expect(duration).toBeGreaterThanOrEqual(119);
    expect(duration).toBeLessThanOrEqual(121);
  });
});

describe('study goals', () => {
  it('creates a goal with sensible defaults', async () => {
    const goalId = await StudyTimerService.createStudyGoal('Finish domain 1', 120, '2026-12-31');
    const goal = await StudyTimerService.getGoalById(goalId);

    expect(goal).not.toBeNull();
    expect(goal!.title).toBe('Finish domain 1');
    expect(goal!.targetMinutes).toBe(120);
    expect(goal!.currentMinutes).toBe(0);
    expect(goal!.completed).toBe(false);
    expect(goal!.status).toBe('active');
  });

  it('returns null for an unknown goal id', async () => {
    expect(await StudyTimerService.getGoalById('nope')).toBeNull();
  });

  it('updates an existing goal', async () => {
    const goalId = await StudyTimerService.createStudyGoal('Goal', 60, '2026-12-31');
    await StudyTimerService.updateStudyGoal(goalId, { title: 'Renamed goal' });
    const goal = await StudyTimerService.getGoalById(goalId);
    expect(goal!.title).toBe('Renamed goal');
  });

  it('throws when updating a goal that does not exist', async () => {
    await expect(StudyTimerService.updateStudyGoal('nope', { title: 'x' })).rejects.toThrow(
      'Goal not found'
    );
  });

  it('accumulates progress and marks a goal complete once the target is reached', async () => {
    const goalId = await StudyTimerService.createStudyGoal('Goal', 60, '2026-12-31');

    const firstUpdate = await StudyTimerService.updateGoalProgress(goalId, 30);
    expect(firstUpdate).toBe(false);

    const secondUpdate = await StudyTimerService.updateGoalProgress(goalId, 30);
    expect(secondUpdate).toBe(true);

    const goal = await StudyTimerService.getGoalById(goalId);
    expect(goal!.currentMinutes).toBe(60);
    expect(goal!.completed).toBe(true);
    expect(goal!.status).toBe('completed');
  });

  it('deletes a goal', async () => {
    const goalId = await StudyTimerService.createStudyGoal('Goal', 60, '2026-12-31');
    await StudyTimerService.deleteStudyGoal(goalId);
    expect(await StudyTimerService.getGoalById(goalId)).toBeNull();
  });
});

describe('study time aggregation', () => {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const session = (startedAt: string, duration: number) => ({
    id: `session_${startedAt}`,
    startedAt,
    endedAt: null,
    duration,
    xpEarned: 0,
    questionsAttempted: 0,
    correctAnswers: 0,
  });

  it('sums total study time across all sessions', async () => {
    await StorageService.saveCompletedSession(session(daysAgo(0), 10));
    await StorageService.saveCompletedSession(session(daysAgo(10), 20));

    expect(await StudyTimerService.getTotalStudyTime()).toBe(30);
  });

  it('only counts sessions started today for getStudyTimeToday', async () => {
    await StorageService.saveCompletedSession(session(daysAgo(0), 10));
    await StorageService.saveCompletedSession(session(daysAgo(1), 20));

    expect(await StudyTimerService.getStudyTimeToday()).toBe(10);
  });

  it('only counts sessions from the last 7 days for getStudyTimeThisWeek', async () => {
    await StorageService.saveCompletedSession(session(daysAgo(3), 10));
    await StorageService.saveCompletedSession(session(daysAgo(10), 20));

    expect(await StudyTimerService.getStudyTimeThisWeek()).toBe(10);
  });

  it('computes a consecutive-day streak', async () => {
    await StorageService.saveCompletedSession(session(daysAgo(0), 10));
    await StorageService.saveCompletedSession(session(daysAgo(1), 10));
    await StorageService.saveCompletedSession(session(daysAgo(2), 10));

    expect(await StudyTimerService.getStudyStreak()).toBe(3);
  });

  it('stops the streak count at the first missed day', async () => {
    await StorageService.saveCompletedSession(session(daysAgo(0), 10));
    await StorageService.saveCompletedSession(session(daysAgo(1), 10));
    // gap at 2 days ago
    await StorageService.saveCompletedSession(session(daysAgo(3), 10));

    expect(await StudyTimerService.getStudyStreak()).toBe(2);
  });

  it('returns 0 when there are no sessions', async () => {
    expect(await StudyTimerService.getStudyStreak()).toBe(0);
  });
});
