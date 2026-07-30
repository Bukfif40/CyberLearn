import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StudyGoal } from '../types';
import { StudyTimerService } from '../services/studyTimer';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

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
    backgroundColor: COLORS.surface,
    borderRadius: RADII.none,
    borderWidth: PIXEL_BORDER,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.none,
  },
  addButtonText: {
    color: COLORS.textOnAccent,
    fontSize: 10,
    fontFamily: FONTS.pixelDisplay,
  },
  goalsList: {
    maxHeight: 200,
  },
  goalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.none,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelBody,
  },
  completedBadge: {
    fontSize: 16,
    color: COLORS.accent,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADII.none,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADII.none,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: FONTS.pixelBody,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  addGoalForm: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  formTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.pixelDisplay,
  },
  quickGoalButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: RADII.none,
    marginBottom: SPACING.sm,
  },
  quickGoalText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.pixelBody,
  },
});
