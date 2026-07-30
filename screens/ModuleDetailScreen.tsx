import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LearningModuleService } from '../services/learningModules';
import { LearningModule, ModuleProgress, SecurityDomain } from '../types';
import { PixelPanel } from '../components/retro/PixelPanel';
import { PixelButton } from '../components/retro/PixelButton';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface ModuleDetailScreenProps {
  moduleId: string;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
  onStartBossBattle: (domain: SecurityDomain) => void;
}

export const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({
  moduleId,
  onBack,
  onSelectLesson,
  onStartBossBattle,
}) => {
  const [module, setModule] = useState<LearningModule | null>(null);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    setLoading(true);
    setModule(LearningModuleService.getModule(moduleId) ?? null);
    setProgress(await LearningModuleService.getModuleProgress(moduleId));
    setLoading(false);
  };

  if (loading || !module || !progress) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  const allLessonsComplete = module.lessons.every(l => progress.lessons[l.id]?.completedAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{module.icon} {module.title}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.description}>{module.description}</Text>

        {module.lessons.map((lesson, index) => {
          const completed = !!progress.lessons[lesson.id]?.completedAt;
          return (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => onSelectLesson(lesson.id)}
              accessibilityRole="button"
              accessibilityLabel={`${completed ? 'Completed lesson' : 'Open lesson'}: ${lesson.title}`}
            >
              <PixelPanel style={styles.lessonCard}>
                <View style={styles.lessonRow}>
                  <View style={[styles.lessonBadge, completed && styles.lessonBadgeComplete]}>
                    <Text style={styles.lessonBadgeText}>{completed ? '✓' : index + 1}</Text>
                  </View>
                  <View style={styles.lessonTextWrap}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonSummary}>{lesson.summary}</Text>
                  </View>
                </View>
              </PixelPanel>
            </TouchableOpacity>
          );
        })}

        <PixelPanel style={styles.bossBattleCard} glow={allLessonsComplete}>
          <Text style={styles.bossBattleTitle}>⚔️ Boss Battle</Text>
          <Text style={styles.bossBattleDescription}>
            {module.bossBattle.questionCount} questions from this domain. Score {module.bossBattle.passThreshold}%+ to clear it.
          </Text>
          {progress.bossBattleBestScore !== null && (
            <Text style={styles.bossBattleBest}>
              Best score: {progress.bossBattleBestScore}% {progress.bossBattlePassed ? '— Cleared!' : ''}
            </Text>
          )}
          <PixelButton
            style={styles.bossBattleButton}
            disabled={!allLessonsComplete}
            onPress={() => onStartBossBattle(module.domain)}
            accessibilityLabel={
              allLessonsComplete ? 'Start boss battle' : 'Complete every lesson to unlock the boss battle'
            }
            title={allLessonsComplete ? 'Start Boss Battle' : 'Locked — Finish All Lessons'}
          />
        </PixelPanel>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 40,
    backgroundColor: COLORS.surface,
    borderBottomWidth: PIXEL_BORDER,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: FONTS.pixelDisplay,
  },
  headerTitle: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },
  lessonCard: {
    marginBottom: SPACING.md,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonBadge: {
    width: 28,
    height: 28,
    borderRadius: RADII.none,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  lessonBadgeComplete: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
  },
  lessonBadgeText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  lessonTextWrap: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
    marginBottom: 4,
  },
  lessonSummary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  bossBattleCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderColor: COLORS.warning,
  },
  bossBattleTitle: {
    fontSize: 14,
    color: COLORS.warning,
    fontFamily: FONTS.pixelDisplay,
    marginBottom: SPACING.sm,
  },
  bossBattleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  bossBattleBest: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.md,
  },
  bossBattleButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
