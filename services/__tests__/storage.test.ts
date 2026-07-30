import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../storage';
import { GamificationData, QuizResult, StudySession } from '../../types';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('user preferences', () => {
  it('returns empty defaults when nothing is stored', async () => {
    const prefs = await StorageService.getPreferences();
    expect(prefs).toEqual({
      quizResults: [],
      studySessions: [],
      studyGoals: [],
      activeSession: null,
    });
  });

  it('updatePreferences merges a partial patch without clobbering other fields', async () => {
    await StorageService.updatePreferences({ quizResults: [{ quizId: 'a' } as QuizResult] });
    await StorageService.updatePreferences({ studyGoals: [{ id: 'g1' } as any] });

    const prefs = await StorageService.getPreferences();
    expect(prefs.quizResults).toEqual([{ quizId: 'a' }]);
    expect(prefs.studyGoals).toEqual([{ id: 'g1' }]);
  });

  it('saveUserPreferences overwrites the entire object', async () => {
    await StorageService.updatePreferences({ quizResults: [{ quizId: 'a' } as QuizResult] });
    await StorageService.saveUserPreferences({
      quizResults: [],
      studySessions: [],
      studyGoals: [],
      activeSession: null,
    });

    const prefs = await StorageService.getPreferences();
    expect(prefs.quizResults).toEqual([]);
  });
});

describe('question stats', () => {
  it('returns null for a question with no stats', async () => {
    expect(await StorageService.getQuestionStats('q999')).toBeNull();
  });

  it('round-trips saved question stats', async () => {
    await StorageService.saveQuestionStats('q001', {
      questionId: 'q001',
      boxLevel: 3,
      timesCorrect: 2,
      timesIncorrect: 1,
      lastSeenAt: '2026-01-01T00:00:00.000Z',
      nextReviewAt: '2026-01-05T00:00:00.000Z',
    });

    const stats = await StorageService.getQuestionStats('q001');
    expect(stats?.boxLevel).toBe(3);

    const all = await StorageService.getAllQuestionStats();
    expect(Object.keys(all)).toEqual(['q001']);
  });
});

describe('module progress', () => {
  it('returns null for a module with no stored progress', async () => {
    expect(await StorageService.getModuleProgress('m999')).toBeNull();
  });

  it('round-trips saved module progress', async () => {
    const progress = {
      moduleId: 'threats-vulnerabilities-mitigations',
      startedAt: '2026-01-01T00:00:00.000Z',
      lessons: { 'threat-actors-attack-surface': { lessonId: 'threat-actors-attack-surface', completedAt: '2026-01-01T00:05:00.000Z' } },
      bossBattleBestScore: 80,
      bossBattlePassed: true,
      completedAt: '2026-01-01T00:10:00.000Z',
    };
    await StorageService.saveModuleProgress('threats-vulnerabilities-mitigations', progress);

    expect(await StorageService.getModuleProgress('threats-vulnerabilities-mitigations')).toEqual(progress);

    const all = await StorageService.getAllModuleProgress();
    expect(Object.keys(all)).toEqual(['threats-vulnerabilities-mitigations']);
  });
});

describe('gamification data', () => {
  it('returns null when nothing is stored', async () => {
    expect(await StorageService.getGamificationRaw()).toBeNull();
  });

  it('round-trips saved gamification data', async () => {
    const data: GamificationData = {
      xp: 250,
      level: 3,
      streak: 4,
      lastActiveDate: '2026-01-01T00:00:00.000Z',
      achievements: [],
      totalStudyTime: 60,
    };
    await StorageService.setGamificationRaw(data);
    expect(await StorageService.getGamificationRaw()).toEqual(data);
  });
});

describe('quiz results', () => {
  it('appends results rather than overwriting', async () => {
    await StorageService.saveQuizResult({ quizId: 'quiz_1' } as QuizResult);
    await StorageService.saveQuizResult({ quizId: 'quiz_2' } as QuizResult);

    const results = await StorageService.getQuizResults();
    expect(results.map(r => r.quizId)).toEqual(['quiz_1', 'quiz_2']);
  });
});

describe('active and completed sessions', () => {
  it('sets and clears the active session', async () => {
    const session = { id: 's1' } as StudySession;
    await StorageService.setActiveSession(session);
    expect(await StorageService.getActiveSession()).toEqual(session);

    await StorageService.setActiveSession(null);
    expect(await StorageService.getActiveSession()).toBeNull();
  });

  it('moves a session into history and clears the active slot on completion', async () => {
    const session = { id: 's1' } as StudySession;
    await StorageService.setActiveSession(session);
    await StorageService.saveCompletedSession(session);

    expect(await StorageService.getActiveSession()).toBeNull();
    const prefs = await StorageService.getPreferences();
    expect(prefs.studySessions).toEqual([session]);
  });
});

describe('study goals', () => {
  it('round-trips saved goals', async () => {
    await StorageService.saveStudyGoals([{ id: 'g1' } as any]);
    expect(await StorageService.getStudyGoals()).toEqual([{ id: 'g1' }]);
  });
});

describe('clearAll', () => {
  it('wipes every stored key', async () => {
    await StorageService.saveQuizResult({ quizId: 'quiz_1' } as QuizResult);
    await StorageService.setGamificationRaw({ xp: 10 } as GamificationData);

    await StorageService.clearAll();

    expect(await StorageService.getQuizResults()).toEqual([]);
    expect(await StorageService.getGamificationRaw()).toBeNull();
  });
});
