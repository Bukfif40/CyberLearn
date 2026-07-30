import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LearningModuleService } from '../services/learningModules';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { Lesson, QuizQuestion } from '../types';
import { QuizQuestionCard } from '../components/QuizQuestionCard';
import { PixelPanel } from '../components/retro/PixelPanel';
import { PixelButton } from '../components/retro/PixelButton';
import { SegmentedBar } from '../components/retro/SegmentedBar';
import { COLORS, FONTS, SPACING, PIXEL_BORDER } from '../constants/theme';

interface LessonScreenProps {
  moduleId: string;
  lessonId: string;
  onBack: () => void;
  onComplete: () => void;
}

type Stage = 'reading' | 'checkpoints' | 'done';

export const LessonScreen: React.FC<LessonScreenProps> = ({ moduleId, lessonId, onBack, onComplete }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>('reading');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [checkpointAnswers, setCheckpointAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    setLesson(LearningModuleService.getLesson(moduleId, lessonId) ?? null);
    setLoading(false);
  }, [moduleId, lessonId]);

  const checkpointQuestions = useMemo<QuizQuestion[]>(() => {
    if (!lesson?.checkpointQuestionIds) return [];
    return lesson.checkpointQuestionIds
      .map(id => QUIZ_QUESTIONS.find(q => q.id === id))
      .filter((q): q is QuizQuestion => !!q);
  }, [lesson]);

  useEffect(() => {
    setCheckpointAnswers(new Array(checkpointQuestions.length).fill(null));
  }, [checkpointQuestions]);

  if (loading || !lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  const goToCheckpointsOrFinish = () => {
    if (checkpointQuestions.length > 0) {
      setStage('checkpoints');
      setCheckpointIndex(0);
    } else {
      setStage('done');
    }
  };

  const handleCheckpointAnswer = (index: number) => {
    const next = [...checkpointAnswers];
    next[checkpointIndex] = index;
    setCheckpointAnswers(next);
  };

  const handleCheckpointContinue = () => {
    if (checkpointIndex < checkpointQuestions.length - 1) {
      setCheckpointIndex(checkpointIndex + 1);
    } else {
      setStage('done');
    }
  };

  const handleMarkComplete = async () => {
    await LearningModuleService.markLessonComplete(moduleId, lessonId);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PixelButton style={styles.backButton} variant="secondary" onPress={onBack} accessibilityLabel="Go back" title="← Back" />
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={{ width: 80 }} />
      </View>

      {stage === 'reading' && (
        <>
          <View style={styles.progressBarWrap}>
            <SegmentedBar segments={lesson.sections.length} filled={sectionIndex + 1} />
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <PixelPanel glow>
              <Text style={styles.sectionHeading}>{lesson.sections[sectionIndex].heading}</Text>
              <Text style={styles.sectionBody}>{lesson.sections[sectionIndex].body}</Text>
            </PixelPanel>
          </ScrollView>
          <View style={styles.footer}>
            <PixelButton
              style={styles.footerButton}
              variant="secondary"
              disabled={sectionIndex === 0}
              onPress={() => setSectionIndex(i => Math.max(0, i - 1))}
              accessibilityLabel="Previous section"
              title="Previous"
            />
            <PixelButton
              style={styles.footerButton}
              onPress={() =>
                sectionIndex < lesson.sections.length - 1
                  ? setSectionIndex(i => i + 1)
                  : goToCheckpointsOrFinish()
              }
              accessibilityLabel={sectionIndex < lesson.sections.length - 1 ? 'Next section' : 'Continue'}
              title={sectionIndex < lesson.sections.length - 1 ? 'Continue ▶' : 'Continue ▶'}
            />
          </View>
        </>
      )}

      {stage === 'checkpoints' && (
        <>
          <View style={styles.progressBarWrap}>
            <SegmentedBar segments={checkpointQuestions.length} filled={checkpointIndex + 1} color={COLORS.warning} />
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.checkpointLabel}>CHECK YOUR UNDERSTANDING</Text>
            <QuizQuestionCard
              question={checkpointQuestions[checkpointIndex]}
              selectedAnswer={checkpointAnswers[checkpointIndex]}
              onAnswerSelect={handleCheckpointAnswer}
              showResult={checkpointAnswers[checkpointIndex] !== null}
            />
          </ScrollView>
          <View style={styles.footer}>
            <PixelButton
              style={styles.footerButton}
              disabled={checkpointAnswers[checkpointIndex] === null}
              onPress={handleCheckpointContinue}
              accessibilityLabel={
                checkpointIndex < checkpointQuestions.length - 1 ? 'Next question' : 'Finish checkpoint'
              }
              title={checkpointIndex < checkpointQuestions.length - 1 ? 'Next' : 'Finish'}
            />
          </View>
        </>
      )}

      {stage === 'done' && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <PixelPanel glow style={styles.doneCard}>
            <Text style={styles.doneTitle}>🎓 Lesson Complete!</Text>
            <Text style={styles.doneSubtitle}>{lesson.title}</Text>
            <PixelButton
              style={styles.doneButton}
              onPress={handleMarkComplete}
              accessibilityLabel="Mark lesson complete and return"
              title="Mark Complete"
            />
          </PixelPanel>
        </ScrollView>
      )}
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
    gap: SPACING.sm,
  },
  backButton: {
    width: 80,
  },
  headerTitle: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
    textAlign: 'center',
  },
  progressBarWrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  sectionHeading: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.pixelDisplay,
    marginBottom: SPACING.md,
  },
  sectionBody: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelBody,
    lineHeight: 23,
  },
  checkpointLabel: {
    fontSize: 11,
    color: COLORS.warning,
    fontFamily: FONTS.pixelDisplay,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: PIXEL_BORDER,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  footerButton: {
    flex: 1,
  },
  doneCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  doneTitle: {
    fontSize: 16,
    color: COLORS.accent,
    fontFamily: FONTS.pixelDisplay,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  doneButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
