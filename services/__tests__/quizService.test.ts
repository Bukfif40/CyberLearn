import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizService } from '../quizService';
import { StorageService } from '../storage';
import { GamificationService } from '../gamification';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { DOMAIN_INFO, SecurityDomain } from '../../types';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('recordAnswer (Leitner spaced repetition)', () => {
  it('creates stats for a first-time question and advances the box on a correct answer', async () => {
    const before = new Date();
    await QuizService.recordAnswer('q001', true);
    const stats = await StorageService.getQuestionStats('q001');

    expect(stats).not.toBeNull();
    expect(stats!.boxLevel).toBe(2);
    expect(stats!.timesCorrect).toBe(1);
    expect(stats!.timesIncorrect).toBe(0);

    const diffDays = Math.round(
      (new Date(stats!.nextReviewAt!).getTime() - before.getTime()) / (24 * 60 * 60 * 1000)
    );
    expect(diffDays).toBe(2); // LEITNER_INTERVALS[boxLevel - 1] = LEITNER_INTERVALS[1] = 2
  });

  it('resets the box to 1 on an incorrect answer', async () => {
    await QuizService.recordAnswer('q001', true);
    await QuizService.recordAnswer('q001', true);
    await QuizService.recordAnswer('q001', false);

    const stats = await StorageService.getQuestionStats('q001');
    expect(stats!.boxLevel).toBe(1);
    expect(stats!.timesIncorrect).toBe(1);
  });

  it('caps the box level at 5 after repeated correct answers', async () => {
    for (let i = 0; i < 10; i++) {
      await QuizService.recordAnswer('q001', true);
    }
    const stats = await StorageService.getQuestionStats('q001');
    expect(stats!.boxLevel).toBe(5);

    const before = new Date();
    await QuizService.recordAnswer('q001', true);
    const updated = await StorageService.getQuestionStats('q001');
    const diffDays = Math.round(
      (new Date(updated!.nextReviewAt!).getTime() - before.getTime()) / (24 * 60 * 60 * 1000)
    );
    expect(diffDays).toBe(16); // LEITNER_INTERVALS[4]
  });
});

describe('question selection helpers', () => {
  it('getRandomQuestions returns the requested count with no duplicates', () => {
    const result = QuizService.getRandomQuestions(5);
    expect(result.length).toBe(5);
    expect(new Set(result.map(q => q.id)).size).toBe(5);
  });

  it('getQuestionsByDifficulty only returns questions of the requested difficulty', () => {
    const result = QuizService.getQuestionsByDifficulty('easy', 5);
    expect(result.every(q => q.difficulty === 'easy')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('getQuestionsByDomain only returns questions of the requested domain', () => {
    const domain: SecurityDomain = 'security_operations';
    const result = QuizService.getQuestionsByDomain(domain, 5);
    expect(result.every(q => q.domain === domain)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('getMixedDifficultyQuiz returns a balanced mix summing to the requested count', () => {
    const result = QuizService.getMixedDifficultyQuiz(9);
    expect(result.length).toBe(9);
    expect(new Set(result.map(q => q.id)).size).toBe(9);

    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    for (const q of result) byDifficulty[q.difficulty]++;
    expect(byDifficulty.easy).toBe(3);
    expect(byDifficulty.medium).toBe(3);
    expect(byDifficulty.hard).toBe(3);
  });

  it('getPracticeExam returns a unique set sized to the request (bounded by available questions)', () => {
    const count = 90;
    const result = QuizService.getPracticeExam(count);
    expect(result.length).toBe(Math.min(count, QUIZ_QUESTIONS.length));
    expect(new Set(result.map(q => q.id)).size).toBe(result.length);
  });

  it('getPracticeExam never exceeds the total number of available questions', () => {
    const result = QuizService.getPracticeExam(QUIZ_QUESTIONS.length + 100);
    expect(result.length).toBe(QUIZ_QUESTIONS.length);
    expect(new Set(result.map(q => q.id)).size).toBe(QUIZ_QUESTIONS.length);
  });
});

describe('getAdaptiveQuiz', () => {
  it('prioritizes a question that is due for review', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await StorageService.saveQuestionStats('q001', {
      questionId: 'q001',
      boxLevel: 2,
      timesCorrect: 1,
      timesIncorrect: 0,
      lastSeenAt: yesterday.toISOString(),
      nextReviewAt: yesterday.toISOString(),
    });

    const result = await QuizService.getAdaptiveQuiz(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('q001');
  });

  it('falls back to covering every question when nothing has been seen', async () => {
    const result = await QuizService.getAdaptiveQuiz(QUIZ_QUESTIONS.length);
    expect(new Set(result.map(q => q.id)).size).toBe(QUIZ_QUESTIONS.length);
  });
});

describe('getMistakeQuestions / getMistakeCount', () => {
  it('only surfaces questions with at least one miss that are still in a low box', async () => {
    await QuizService.recordAnswer('q001', false); // mistake: boxLevel 1, timesIncorrect 1
    await QuizService.recordAnswer('q002', true); // not a mistake: never missed
    await QuizService.recordAnswer('q003', false);
    await QuizService.recordAnswer('q003', true); // boxLevel now 2, still <= 2, still a mistake

    const count = await QuizService.getMistakeCount();
    expect(count).toBe(2);

    const mistakes = await QuizService.getMistakeQuestions(10);
    expect(mistakes.map(q => q.id).sort()).toEqual(['q001', 'q003']);
  });

  it('drops a question from mistakes once it climbs above box 2', async () => {
    await QuizService.recordAnswer('q001', false);
    await QuizService.recordAnswer('q001', true);
    await QuizService.recordAnswer('q001', true); // boxLevel 3, above the mistake threshold

    const count = await QuizService.getMistakeCount();
    expect(count).toBe(0);
  });
});

describe('saveQuizResult', () => {
  // q001, q002, q003 are all in the 'general_security_concepts' domain with correctAnswer index 1
  const questions = QUIZ_QUESTIONS.filter(q => ['q001', 'q002', 'q003'].includes(q.id));

  it('records score, correct count, and domain breakdown', async () => {
    const answers = [1, 1, 0]; // q001 correct, q002 correct, q003 incorrect
    await QuizService.saveQuizResult(answers, questions, 120);

    const results = await QuizService.getQuizResults();
    expect(results).toHaveLength(1);
    expect(results[0].correctAnswers).toBe(2);
    expect(results[0].totalQuestions).toBe(3);
    expect(results[0].score).toBe(67);

    const breakdown = results[0].domainBreakdown.general_security_concepts;
    expect(breakdown).toEqual({ correct: 2, total: 3 });
  });

  it('awards xp proportional to the score and unlocks the first_quiz achievement', async () => {
    const answers = [1, 1, 0];
    await QuizService.saveQuizResult(answers, questions, 120);

    const gamification = await GamificationService.getGamificationData();
    expect(gamification.xp).toBeGreaterThanOrEqual(67); // score xp, plus any achievement bonus
    const achievement = gamification.achievements.find(a => a.id === 'first_quiz');
    expect(achievement?.unlockedAt).not.toBeNull();
  });

  it('feeds recorded answers into the spaced repetition system', async () => {
    const answers = [1, 1, 0];
    await QuizService.saveQuizResult(answers, questions, 120);

    const q003Stats = await StorageService.getQuestionStats('q003');
    expect(q003Stats!.timesIncorrect).toBe(1);
    expect(q003Stats!.boxLevel).toBe(1);
  });
});

describe('readiness analysis', () => {
  const questions = QUIZ_QUESTIONS.filter(q => ['q001', 'q002', 'q003'].includes(q.id));

  it('computes per-domain accuracy and coverage', async () => {
    await QuizService.saveQuizResult([1, 1, 0], questions, 120);

    const readiness = await QuizService.getDomainReadiness();
    const domain = readiness.find(r => r.domain === 'general_security_concepts')!;
    expect(domain.accuracy).toBe(67);
    expect(domain.questionsAnswered).toBe(3);

    const totalInDomain = QUIZ_QUESTIONS.filter(q => q.domain === 'general_security_concepts').length;
    expect(domain.coverage).toBe(Math.round((3 / totalInDomain) * 100));
  });

  it('computes an overall readiness weighted by domain exam weight', async () => {
    await QuizService.saveQuizResult([1, 1, 0], questions, 120);

    const weight = DOMAIN_INFO.general_security_concepts.weight;
    const expected = Math.round((67 * weight) / 100); // every other domain has 0 accuracy
    const overall = await QuizService.getOverallReadiness();
    expect(overall).toBe(expected);
  });

  it('returns 0 readiness when no quizzes have been taken', async () => {
    const overall = await QuizService.getOverallReadiness();
    expect(overall).toBe(0);
  });
});

describe('getAverageScore / getTotalQuizzesTaken', () => {
  const questions = QUIZ_QUESTIONS.filter(q => ['q001', 'q002', 'q003'].includes(q.id));

  it('returns 0 / 0 with no history', async () => {
    expect(await QuizService.getAverageScore()).toBe(0);
    expect(await QuizService.getTotalQuizzesTaken()).toBe(0);
  });

  it('averages scores across multiple quizzes', async () => {
    await QuizService.saveQuizResult([1, 1, 1], questions, 60); // 100%
    await QuizService.saveQuizResult([0, 0, 0], questions, 60); // 0%

    expect(await QuizService.getTotalQuizzesTaken()).toBe(2);
    expect(await QuizService.getAverageScore()).toBe(50);
  });
});
