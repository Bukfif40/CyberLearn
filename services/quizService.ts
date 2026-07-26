import { QuizQuestion, QuizResult } from '../types';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { StorageService } from './storage';
import { GamificationService } from './gamification';

const QUIZ_RESULTS_KEY = '@cyberlearn_quiz_results';

export class QuizService {
  static getQuestionsByCategory(category: string, count: number = 5): QuizQuestion[] {
    const categoryQuestions = QUIZ_QUESTIONS.filter(q => q.category === category);
    return this.shuffleArray(categoryQuestions).slice(0, count);
  }

  static getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', count: number = 5): QuizQuestion[] {
    const difficultyQuestions = QUIZ_QUESTIONS.filter(q => q.difficulty === difficulty);
    return this.shuffleArray(difficultyQuestions).slice(0, count);
  }

  static getRandomQuestions(count: number = 5): QuizQuestion[] {
    return this.shuffleArray([...QUIZ_QUESTIONS]).slice(0, count);
  }

  static getMixedDifficultyQuiz(count: number = 5): QuizQuestion[] {
    const easy = this.getQuestionsByDifficulty('easy', Math.ceil(count / 3));
    const medium = this.getQuestionsByDifficulty('medium', Math.ceil(count / 3));
    const hard = this.getQuestionsByDifficulty('hard', Math.floor(count / 3));
    
    return this.shuffleArray([...easy, ...medium, ...hard]).slice(0, count);
  }

  static calculateScore(answers: number[], questions: QuizQuestion[]): number {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  }

  static async saveQuizResult(result: QuizResult): Promise<void> {
    try {
      const existingResults = await this.getQuizResults();
      existingResults.push(result);
      await StorageService.updatePreferences({ quizResults: existingResults });

      // Award XP based on score
      const xpReward = Math.round(result.score / 2);
      await GamificationService.addXP(xpReward);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  static async getQuizResults(): Promise<QuizResult[]> {
    try {
      const preferences = await StorageService.getUserPreferences();
      return (preferences as any)?.quizResults || [];
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  }

  static async getAverageScore(): Promise<number> {
    const results = await this.getQuizResults();
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
  }

  static async getTotalQuizzesTaken(): Promise<number> {
    const results = await this.getQuizResults();
    return results.length;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static getCategories(): string[] {
    return Array.from(new Set(QUIZ_QUESTIONS.map(q => q.category)));
  }

  static getQuestionById(id: string): QuizQuestion | undefined {
    return QUIZ_QUESTIONS.find(q => q.id === id);
  }
}
