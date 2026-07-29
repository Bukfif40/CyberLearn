import { QuizQuestion, QuizResult, QuestionStats, DomainReadiness, SecurityDomain, DOMAIN_INFO } from '../types';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { StorageService } from './storage';
import { GamificationService } from './gamification';

const LEITNER_INTERVALS = [1, 2, 4, 8, 16]; // Days for each box level

export class QuizService {
  // ===== Spaced Repetition & Leitner System =====

  static async recordAnswer(questionId: string, correct: boolean): Promise<void> {
    try {
      let stats = await StorageService.getQuestionStats(questionId);

      if (!stats) {
        stats = {
          questionId,
          boxLevel: 1,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastSeenAt: new Date().toISOString(),
          nextReviewAt: null,
        };
      }

      stats.lastSeenAt = new Date().toISOString();

      if (correct) {
        stats.timesCorrect += 1;
        // Advance to next box (max 5)
        stats.boxLevel = Math.min(stats.boxLevel + 1, 5);
      } else {
        stats.timesIncorrect += 1;
        // Reset to box 1
        stats.boxLevel = 1;
      }

      // Calculate next review date
      const intervalDays = LEITNER_INTERVALS[Math.min(stats.boxLevel - 1, 4)];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);
      stats.nextReviewAt = nextReview.toISOString();

      await StorageService.saveQuestionStats(questionId, stats);
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  }

  // ===== Adaptive Quiz =====

  static async getAdaptiveQuiz(count: number = 10): Promise<QuizQuestion[]> {
    try {
      const allStats = await StorageService.getAllQuestionStats();
      const now = new Date();

      // Separate questions by review status
      const dueForReview: QuizQuestion[] = [];
      const neverSeen: QuizQuestion[] = [];
      const other: QuizQuestion[] = [];

      for (const q of QUIZ_QUESTIONS) {
        const stats = allStats[q.id];

        if (!stats) {
          neverSeen.push(q);
        } else if (stats.nextReviewAt && new Date(stats.nextReviewAt) <= now) {
          dueForReview.push(q);
        } else {
          other.push(q);
        }
      }

      // Prioritize by review status, then by domain weight
      const result: QuizQuestion[] = [];
      const usedIds = new Set<string>();
      const addUnique = (candidates: QuizQuestion[], needed: number) => {
        for (const q of candidates) {
          if (needed <= 0) break;
          if (usedIds.has(q.id)) continue;
          usedIds.add(q.id);
          result.push(q);
          needed -= 1;
        }
      };

      // 1. Add due-for-review questions first
      addUnique(this.shuffleArray(dueForReview), count - result.length);

      // 2. Add never-seen questions, weighted toward higher-weight domains
      if (result.length < count) {
        const neverSeenWeighted = this.shuffleArray(this.weightQuestionsByDomain(neverSeen));
        addUnique(neverSeenWeighted, count - result.length);
      }

      // 3. Fill from remaining if needed
      if (result.length < count) {
        addUnique(this.shuffleArray(other), count - result.length);
      }

      return this.shuffleArray(result).slice(0, count);
    } catch (error) {
      console.error('Error getting adaptive quiz:', error);
      return this.getMixedDifficultyQuiz(count);
    }
  }

  private static weightQuestionsByDomain(questions: QuizQuestion[]): QuizQuestion[] {
    // Weight questions by domain exam percentage for balanced coverage
    const weighted: QuizQuestion[] = [];

    for (const q of questions) {
      const weight = DOMAIN_INFO[q.domain].weight;
      const count = Math.ceil(weight / 5); // Normalize weights
      for (let i = 0; i < count; i++) {
        weighted.push(q);
      }
    }

    return weighted;
  }

  // ===== Mixed Difficulty Quiz =====

  static getMixedDifficultyQuiz(count: number = 10): QuizQuestion[] {
    const easy = this.getQuestionsByDifficulty('easy', Math.ceil(count / 3));
    const medium = this.getQuestionsByDifficulty('medium', Math.ceil(count / 3));
    const hard = this.getQuestionsByDifficulty('hard', Math.floor(count / 3));

    return this.shuffleArray([...easy, ...medium, ...hard]).slice(0, count);
  }

  // ===== Difficulty-based Selection =====

  static getQuestionsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5
  ): QuizQuestion[] {
    const filtered = QUIZ_QUESTIONS.filter(q => q.difficulty === difficulty);
    return this.shuffleArray(filtered).slice(0, count);
  }

  static getQuestionsByDomain(domain: SecurityDomain, count: number = 5): QuizQuestion[] {
    const filtered = QUIZ_QUESTIONS.filter(q => q.domain === domain);
    return this.shuffleArray(filtered).slice(0, count);
  }

  static getRandomQuestions(count: number = 5): QuizQuestion[] {
    return this.shuffleArray([...QUIZ_QUESTIONS]).slice(0, count);
  }

  // ===== Full-length Practice Exam =====

  static getPracticeExam(count: number = 90): QuizQuestion[] {
    const domains = Object.entries(DOMAIN_INFO) as [SecurityDomain, (typeof DOMAIN_INFO)[SecurityDomain]][];
    const totalWeight = domains.reduce((sum, [, info]) => sum + info.weight, 0);

    const selected: QuizQuestion[] = [];
    for (const [domain, info] of domains) {
      const domainQuestions = QUIZ_QUESTIONS.filter(q => q.domain === domain);
      const target = Math.round((info.weight / totalWeight) * count);
      selected.push(...this.shuffleArray(domainQuestions).slice(0, Math.min(target, domainQuestions.length)));
    }

    if (selected.length < count) {
      const usedIds = new Set(selected.map(q => q.id));
      const remaining = QUIZ_QUESTIONS.filter(q => !usedIds.has(q.id));
      selected.push(...this.shuffleArray(remaining).slice(0, count - selected.length));
    }

    return this.shuffleArray(selected).slice(0, Math.min(count, selected.length));
  }

  // ===== Review Mistakes =====

  static async getMistakeQuestions(count: number = 10): Promise<QuizQuestion[]> {
    try {
      const allStats = await StorageService.getAllQuestionStats();
      const mistakes = QUIZ_QUESTIONS.filter(q => {
        const stats = allStats[q.id];
        return stats && stats.timesIncorrect > 0 && stats.boxLevel <= 2;
      });
      return this.shuffleArray(mistakes).slice(0, count);
    } catch (error) {
      console.error('Error getting mistake questions:', error);
      return [];
    }
  }

  static async getMistakeCount(): Promise<number> {
    try {
      const allStats = await StorageService.getAllQuestionStats();
      return QUIZ_QUESTIONS.filter(q => {
        const stats = allStats[q.id];
        return stats && stats.timesIncorrect > 0 && stats.boxLevel <= 2;
      }).length;
    } catch (error) {
      console.error('Error getting mistake count:', error);
      return 0;
    }
  }

  // ===== Quiz Results =====

  static async saveQuizResult(
    answers: number[],
    questions: QuizQuestion[],
    timeTaken: number
  ): Promise<void> {
    try {
      // Calculate correct answers (actual count, not just answered)
      let correctCount = 0;
      const domainStats: Record<SecurityDomain, { correct: number; total: number }> =
        Object.keys(DOMAIN_INFO).reduce(
          (acc, domain) => {
            acc[domain as SecurityDomain] = { correct: 0, total: 0 };
            return acc;
          },
          {} as Record<SecurityDomain, { correct: number; total: number }>
        );

      for (let i = 0; i < answers.length; i++) {
        const isCorrect = answers[i] === questions[i].correctAnswer;
        if (isCorrect) {
          correctCount++;
        }
        domainStats[questions[i].domain].correct += isCorrect ? 1 : 0;
        domainStats[questions[i].domain].total += 1;

        // Record answer in spaced repetition
        await this.recordAnswer(questions[i].id, isCorrect);
      }

      const score = Math.round((correctCount / questions.length) * 100);

      const result: QuizResult = {
        quizId: `quiz_${Date.now()}`,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
        completedAt: new Date().toISOString(),
        domainBreakdown: domainStats,
        answers,
      };

      await StorageService.saveQuizResult(result);

      // Award XP based on score and difficulty mix
      const baseXP = Math.round((correctCount / questions.length) * 100);
      await GamificationService.addXP(baseXP);

      // Unlock first_quiz achievement on first result
      const allResults = await StorageService.getQuizResults();
      if (allResults.length === 1) {
        await GamificationService.unlockAchievement('first_quiz');
      }

      // Check for domain and exam readiness achievements
      const readiness = await this.getOverallReadiness();
      const domainReadiness = await this.getDomainReadiness();

      if (readiness >= 80) {
        await GamificationService.unlockAchievement('exam_ready');
      }

      for (const dr of domainReadiness) {
        if (dr.accuracy >= 90) {
          await GamificationService.unlockAchievement('domain_master');
          break;
        }
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  // ===== Readiness Analysis =====

  static async getDomainReadiness(): Promise<DomainReadiness[]> {
    try {
      const results = await StorageService.getQuizResults();
      const readiness: DomainReadiness[] = [];

      for (const [domain, info] of Object.entries(DOMAIN_INFO)) {
        const domainKey = domain as SecurityDomain;
        let totalCorrect = 0;
        let totalAttempted = 0;

        for (const result of results) {
          const breakdown = result.domainBreakdown[domainKey];
          if (breakdown) {
            totalCorrect += breakdown.correct;
            totalAttempted += breakdown.total;
          }
        }

        const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        const coverage = totalAttempted > 0 ? Math.round((totalAttempted / QUIZ_QUESTIONS.filter(q => q.domain === domainKey).length) * 100) : 0;

        readiness.push({
          domain: domainKey,
          title: info.title,
          weight: info.weight,
          accuracy,
          questionsAnswered: totalAttempted,
          totalQuestions: QUIZ_QUESTIONS.filter(q => q.domain === domainKey).length,
          coverage,
        });
      }

      return readiness;
    } catch (error) {
      console.error('Error getting domain readiness:', error);
      return Object.entries(DOMAIN_INFO).map(([domain, info]) => ({
        domain: domain as SecurityDomain,
        title: info.title,
        weight: info.weight,
        accuracy: 0,
        questionsAnswered: 0,
        totalQuestions: QUIZ_QUESTIONS.filter(q => q.domain === (domain as SecurityDomain)).length,
        coverage: 0,
      }));
    }
  }

  static async getOverallReadiness(): Promise<number> {
    try {
      const domainReadiness = await this.getDomainReadiness();

      // Weighted average: sum(accuracy * weight) / sum(weight)
      let weightedSum = 0;
      let totalWeight = 0;

      for (const dr of domainReadiness) {
        weightedSum += dr.accuracy * dr.weight;
        totalWeight += dr.weight;
      }

      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    } catch (error) {
      console.error('Error getting overall readiness:', error);
      return 0;
    }
  }

  // ===== Convenience Methods =====

  static async getQuizResults(): Promise<QuizResult[]> {
    try {
      return await StorageService.getQuizResults();
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  }

  static async getAverageScore(): Promise<number> {
    try {
      const results = await this.getQuizResults();
      if (results.length === 0) return 0;
      const total = results.reduce((sum, result) => sum + result.score, 0);
      return Math.round(total / results.length);
    } catch (error) {
      console.error('Error getting average score:', error);
      return 0;
    }
  }

  static async getTotalQuizzesTaken(): Promise<number> {
    try {
      const results = await this.getQuizResults();
      return results.length;
    } catch (error) {
      console.error('Error getting total quizzes:', error);
      return 0;
    }
  }

  // ===== Utilities =====

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
