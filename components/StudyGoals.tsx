import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudyGoal } from '../types';
import { StudyTimerService } from '../services/studyTimer';

export const StudyGoals: React.FC = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const loadedGoals = await StudyTimerService.getStudyGoals();
    setGoals(loadedGoals);
  };

  const getProgress = (goal: StudyGoal) => {
    const completedMinutes = goal.currentMinutes ?? 0;
    const targetMinutes = goal.targetMinutes ?? 1;
    return Math.min((completedMinutes / targetMinutes) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddGoal(!showAddGoal)}
          accessibilityRole="button"
          accessibilityLabel={showAddGoal ? 'Close add goal form' : 'Add a study goal'}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No study goals yet</Text>
          <Text style={styles.emptySubtext}>Set a goal to track your progress</Text>
        </View>
      ) : (
        <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.completed && <Text style={styles.completedBadge}>✓</Text>}
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${getProgress(goal)}%` }]} />
              </View>

              <View style={styles.goalStats}>
                <Text style={styles.goalStat}>
                  {Math.round(goal.currentMinutes ?? 0)} / {goal.targetMinutes ?? 0} min
                </Text>
                <Text style={styles.goalStat}>
                  {getDaysRemaining(goal.deadline)} days left
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {showAddGoal && (
        <View style={styles.addGoalForm}>
          <Text style={styles.formTitle}>Quick Add Goal</Text>
          <TouchableOpacity
            style={styles.quickGoalButton}
            accessibilityRole="button"
            accessibilityLabel="Add weekly goal: 5 hours this week"
            onPress={async () => {
              const deadline = new Date();
              deadline.setDate(deadline.getDate() + 7);
              await StudyTimerService.createStudyGoal(
                'Weekly Study Goal',
                300, // 5 hours
                deadline.toISOString()
              );
              loadGoals();
              setShowAddGoal(false);
            }}
          >
            <Text style={styles.quickGoalText}>📅 5 hours this week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickGoalButton}
            accessibilityRole="button"
            accessibilityLabel="Add monthly goal: 20 hours this month"
            onPress={async () => {
              const deadline = new Date();
              deadline.setDate(deadline.getDate() + 30);
              await StudyTimerService.createStudyGoal(
                'Monthly Study Goal',
                1200, // 20 hours
                deadline.toISOString()
              );
              loadGoals();
              setShowAddGoal(false);
            }}
          >
            <Text style={styles.quickGoalText}>📅 20 hours this month</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalsList: {
    maxHeight: 200,
  },
  goalCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  completedBadge: {
    fontSize: 16,
    color: '#4ade80',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
  },
  addGoalForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  quickGoalButton: {
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickGoalText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
