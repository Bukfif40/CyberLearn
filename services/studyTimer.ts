import { StudySession, StudyGoal } from '../types';
import { StorageService } from './storage';
import { GamificationService } from './gamification';

export class StudyTimerService {
  static async startSession(): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: StudySession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      duration: 0,
      xpEarned: 0,
      questionsAttempted: 0,
      correctAnswers: 0,
    };

    await StorageService.setActiveSession(session);
    return sessionId;
  }

  static async endSession(sessionId: string, xpEarned: number = 0, questionsAttempted: number = 0, correctAnswers: number = 0): Promise<void> {
    const session = await StorageService.getActiveSession();
    if (!session || session.id !== sessionId) {
      throw new Error('No active session found');
    }

    const endTime = new Date();
    const startTime = new Date(session.startedAt);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const completedSession: StudySession = {
      ...session,
      endedAt: endTime.toISOString(),
      duration,
      xpEarned,
      questionsAttempted,
      correctAnswers,
    };

    await StorageService.saveCompletedSession(completedSession);
    await StorageService.setActiveSession(null);

    await GamificationService.addStudyTime(duration);
    const xpReward = Math.min(duration, 100);
    await GamificationService.addXP(xpReward);
  }

  static async getActiveSession(): Promise<StudySession | null> {
    return await StorageService.getActiveSession();
  }

  static async getSessionDuration(sessionId: string): Promise<number> {
    const session = await StorageService.getActiveSession();
    if (!session || session.id !== sessionId) {
      return 0;
    }

    const now = new Date();
    const startTime = new Date(session.startedAt);
    return Math.round((now.getTime() - startTime.getTime()) / 1000);
  }

  static async getStudySessions(): Promise<StudySession[]> {
    const preferences = await StorageService.getPreferences();
    return preferences.studySessions || [];
  }

  static async getStudyGoals(): Promise<StudyGoal[]> {
    return await StorageService.getStudyGoals();
  }

  static async getGoalById(goalId: string): Promise<StudyGoal | null> {
    const goals = await this.getStudyGoals();
    return goals.find(goal => goal.id === goalId) || null;
  }

  static async createStudyGoal(title: string, targetMinutes: number, deadline: string, domain: string = 'all'): Promise<string> {
    const goalId = `goal_${Date.now()}`;
    const newGoal: StudyGoal = {
      id: goalId,
      title,
      domain: domain as any,
      targetAccuracy: 0,
      targetQuestionsPerDay: 0,
      targetMinutes,
      currentMinutes: 0,
      completed: false,
      deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const goals = await this.getStudyGoals();
    goals.push(newGoal);
    await StorageService.saveStudyGoals(goals);
    return goalId;
  }

  static async updateStudyGoal(goalId: string, updates: Partial<StudyGoal>): Promise<void> {
    const goals = await this.getStudyGoals();
    const index = goals.findIndex(goal => goal.id === goalId);
    if (index === -1) {
      throw new Error('Goal not found');
    }

    goals[index] = { ...goals[index], ...updates };
    await StorageService.saveStudyGoals(goals);
  }

  static async updateGoalProgress(goalId: string, additionalMinutes: number): Promise<boolean> {
    const goal = await this.getGoalById(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (!goal.currentMinutes) {
      goal.currentMinutes = 0;
    }
    goal.currentMinutes += additionalMinutes;

    let completed = false;
    if (goal.targetMinutes && goal.currentMinutes >= goal.targetMinutes) {
      goal.completed = true;
      goal.status = 'completed';
      completed = true;
    }

    await this.updateStudyGoal(goalId, goal);
    return completed;
  }

  static async deleteStudyGoal(goalId: string): Promise<void> {
    const goals = await this.getStudyGoals();
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    await StorageService.saveStudyGoals(updatedGoals);
  }

  static async getTotalStudyTime(): Promise<number> {
    const sessions = await this.getStudySessions();
    return sessions.reduce((total, session) => total + session.duration, 0);
  }

  static async getStudyTimeToday(): Promise<number> {
    const sessions = await this.getStudySessions();
    const today = new Date().toDateString();
    return sessions
      .filter(session => new Date(session.startedAt).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);
  }

  static async getStudyTimeThisWeek(): Promise<number> {
    const sessions = await this.getStudySessions();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return sessions
      .filter(session => new Date(session.startedAt) >= weekAgo)
      .reduce((total, session) => total + session.duration, 0);
  }

  static async getStudyStreak(): Promise<number> {
    const sessions = await this.getStudySessions();
    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const dateString = currentDate.toDateString();
      const hasSession = sessions.some(
        session => new Date(session.startedAt).toDateString() === dateString
      );

      if (hasSession) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }

      if (streak > 365) break;
    }

    return streak;
  }
}
