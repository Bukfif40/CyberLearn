import { StudySession, StudyGoal } from '../types';
import { StorageService } from './storage';
import { GamificationService } from './gamification';

const STUDY_SESSIONS_KEY = '@cyberlearn_study_sessions';
const STUDY_GOALS_KEY = '@cyberlearn_study_goals';
const ACTIVE_SESSION_KEY = '@cyberlearn_active_session';

export class StudyTimerService {
  static async startSession(roadmapId: string): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: StudySession = {
      id: sessionId,
      roadmapId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      notes: '',
      topicsCovered: [],
    };

    await StorageService.updatePreferences({ activeSession: session });

    return sessionId;
  }

  static async endSession(sessionId: string, notes: string = '', topics: string[] = []): Promise<void> {
    const preferences = await StorageService.getUserPreferences();
    const activeSession = preferences?.activeSession;

    if (!activeSession || activeSession.id !== sessionId) {
      throw new Error('No active session found');
    }

    const endTime = new Date();
    const startTime = new Date(activeSession.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // Convert to minutes

    const completedSession: StudySession = {
      ...activeSession,
      endTime: endTime.toISOString(),
      duration,
      notes,
      topicsCovered: topics,
    };

    // Save to sessions history
    const sessions = await this.getStudySessions();
    sessions.push(completedSession);
    await StorageService.updatePreferences({ studySessions: sessions, activeSession: undefined });

    // Update gamification
    await GamificationService.addStudyTime(duration);
    
    // Award XP for study time (1 XP per minute, max 100 XP per session)
    const xpReward = Math.min(duration, 100);
    await GamificationService.addXP(xpReward);
  }

  static async getActiveSession(): Promise<StudySession | null> {
    const preferences = await StorageService.getUserPreferences();
    return (preferences as any)?.activeSession || null;
  }

  static async getSessionDuration(sessionId: string): Promise<number> {
    const session = await this.getActiveSession();
    if (!session || session.id !== sessionId) return 0;

    const startTime = new Date(session.startTime);
    const currentTime = new Date();
    return Math.round((currentTime.getTime() - startTime.getTime()) / 60000);
  }

  static async getStudySessions(): Promise<StudySession[]> {
    const preferences = await StorageService.getUserPreferences();
    return (preferences as any)?.studySessions || [];
  }

  static async getTotalStudyTime(): Promise<number> {
    const sessions = await this.getStudySessions();
    return sessions.reduce((total, session) => total + session.duration, 0);
  }

  static async getStudyTimeToday(): Promise<number> {
    const sessions = await this.getStudySessions();
    const today = new Date().toDateString();
    
    return sessions
      .filter(session => new Date(session.startTime).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);
  }

  static async getStudyTimeThisWeek(): Promise<number> {
    const sessions = await this.getStudySessions();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return sessions
      .filter(session => new Date(session.startTime) >= weekAgo)
      .reduce((total, session) => total + session.duration, 0);
  }

  static async createStudyGoal(title: string, targetMinutes: number, deadline: string): Promise<string> {
    const goalId = `goal_${Date.now()}`;
    const goal: StudyGoal = {
      id: goalId,
      title,
      targetMinutes,
      currentMinutes: 0,
      deadline,
      completed: false,
    };

    const goals = await this.getStudyGoals();
    goals.push(goal);
    
    await StorageService.updatePreferences({ studyGoals: goals });

    return goalId;
  }

  static async getStudyGoals(): Promise<StudyGoal[]> {
    const preferences = await StorageService.getUserPreferences();
    return (preferences as any)?.studyGoals || [];
  }

  static async updateStudyGoalProgress(goalId: string, additionalMinutes: number): Promise<void> {
    const goals = await this.getStudyGoals();
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
      goal.currentMinutes += additionalMinutes;
      if (goal.currentMinutes >= goal.targetMinutes) {
        goal.completed = true;
        await GamificationService.addXP(50); // Bonus XP for completing goal
      }
      
      await StorageService.updatePreferences({ studyGoals: goals });
    }
  }

  static async deleteStudyGoal(goalId: string): Promise<void> {
    const goals = await this.getStudyGoals();
    const updatedGoals = goals.filter(g => g.id !== goalId);
    
    await StorageService.updatePreferences({ studyGoals: updatedGoals });
  }

  static async getStudyStreak(): Promise<number> {
    const sessions = await this.getStudySessions();
    if (sessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today); // Create a new Date object to avoid mutating today

    // Check backwards from today
    while (true) {
      const dateString = currentDate.toDateString();
      const hasSessionOnDay = sessions.some(
        session => new Date(session.startTime).toDateString() === dateString
      );

      if (hasSessionOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0 && dateString === today.toDateString()) {
        // No session today yet, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }

      // Safety limit to prevent infinite loop
      if (streak > 365) break;
    }

    return streak;
  }
}
