import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { QuizService } from '../services/quizService';
import { QuizQuestion, DOMAIN_INFO, SecurityDomain } from '../types';
import { PixelButton } from '../components/retro/PixelButton';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface PracticeExamScreenProps {
  onBack: () => void;
}

const QUESTION_COUNT = 90;
const EXAM_SECONDS = QUESTION_COUNT * 60; // 1 minute per question, matching real exam pacing

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const PracticeExamScreen: React.FC<PracticeExamScreenProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const exam = QuizService.getPracticeExam(QUESTION_COUNT);
    setQuestions(exam);
    setAnswers(new Array(exam.length).fill(null));
    setFlagged(new Array(exam.length).fill(false));
    setSecondsLeft(exam.length * 60);
    startTimeRef.current = Date.now();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || showResults || questions.length === 0) return;
    if (secondsLeft <= 0) {
      finishExam();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, loading, showResults, questions.length]);

  const answeredCount = useMemo(() => answers.filter(a => a !== null).length, [answers]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = [...prev];
      next[currentIndex] = !next[currentIndex];
      return next;
    });
  };

  const finishExam = async () => {
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const finalAnswers = answers.map(a => (a === null ? -1 : a));
    await QuizService.saveQuizResult(finalAnswers, questions, timeTaken);
    setShowResults(true);
  };

  const getScoreColor = (accuracy: number): string => {
    if (accuracy >= 75) return COLORS.accent;
    if (accuracy >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Assembling your practice exam...</Text>
        </View>
      </View>
    );
  }

  if (showResults) {
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;
    const unansweredCount = answers.filter(a => a === null).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 75;

    const domainBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!domainBreakdown[q.domain]) domainBreakdown[q.domain] = { correct: 0, total: 0 };
      domainBreakdown[q.domain].total += 1;
      if (answers[i] === q.correctAnswer) domainBreakdown[q.domain].correct += 1;
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exam Results</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.resultsContent}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>{score}%</Text>
          </View>

          <Text style={[styles.passText, { color: passed ? COLORS.accent : COLORS.danger }]}>
            {passed ? '✅ Likely Pass' : '❌ Needs More Study'}
          </Text>
          <Text style={styles.passHint}>
            Estimate only — the real CompTIA Security+ exam uses a scaled score (100-900) with a passing score of 750.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{questions.length - correctCount - unansweredCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{unansweredCount}</Text>
              <Text style={styles.statLabel}>Unanswered</Text>
            </View>
          </View>

          <Text style={styles.domainTitle}>By Domain:</Text>
          {Object.entries(domainBreakdown).map(([domain, stats]) => (
            <View key={domain} style={styles.domainBreakdownItem}>
              <View style={styles.domainBreakdownHeader}>
                <Text style={styles.domainBreakdownName}>
                  {DOMAIN_INFO[domain as SecurityDomain].icon} {DOMAIN_INFO[domain as SecurityDomain].title}
                </Text>
                <Text
                  style={[
                    styles.domainBreakdownAccuracy,
                    { color: getScoreColor(Math.round((stats.correct / stats.total) * 100)) },
                  ]}
                >
                  {Math.round((stats.correct / stats.total) * 100)}%
                </Text>
              </View>
              <Text style={styles.domainBreakdownStats}>{stats.correct}/{stats.total} questions correct</Text>
            </View>
          ))}

          <PixelButton
            style={styles.retryButton}
            onPress={onBack}
            accessibilityLabel="Return to home screen"
            title="Return Home"
          />
        </ScrollView>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLow = secondsLeft <= 300;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setConfirmSubmit(true)}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Exit practice exam"
        >
          <Text style={styles.backButtonText}>Exit</Text>
        </TouchableOpacity>
        <Text style={[styles.timerText, isLow && styles.timerLow]}>⏱ {formatTime(secondsLeft)}</Text>
        <Text style={styles.answeredCount}>{answeredCount}/{questions.length}</Text>
      </View>

      {confirmSubmit && (
        <View style={styles.confirmBanner}>
          <Text style={styles.confirmText}>
            Submit exam now? {questions.length - answeredCount} question(s) unanswered.
          </Text>
          <View style={styles.confirmActions}>
            <PixelButton
              style={styles.confirmButton}
              variant="secondary"
              onPress={() => setConfirmSubmit(false)}
              accessibilityLabel="Keep going, do not submit yet"
              title="Keep Going"
            />
            <PixelButton
              style={styles.confirmButton}
              onPress={finishExam}
              accessibilityLabel="Confirm submit exam"
              title="Submit"
            />
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navigatorBar}
        contentContainerStyle={styles.navigatorContent}
      >
        {questions.map((_, i) => {
          const isAnswered = answers[i] !== null;
          const isFlagged = flagged[i];
          const isCurrent = i === currentIndex;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[
                styles.navDot,
                isAnswered && styles.navDotAnswered,
                isFlagged && styles.navDotFlagged,
                isCurrent && styles.navDotCurrent,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Go to question ${i + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
            >
              <Text style={styles.navDotText}>{i + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.questionContent}>
        <View style={styles.questionHeaderRow}>
          <Text style={styles.domainTag}>
            {DOMAIN_INFO[currentQuestion.domain].icon} {DOMAIN_INFO[currentQuestion.domain].title}
          </Text>
          <TouchableOpacity onPress={toggleFlag} accessibilityRole="button" accessibilityLabel="Flag question for review">
            <Text style={styles.flagButton}>{flagged[currentIndex] ? '🚩 Flagged' : '⚑ Flag'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText}>Question {currentIndex + 1} of {questions.length}</Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, answers[currentIndex] === i && styles.selectedOption]}
              onPress={() => selectAnswer(i)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: answers[currentIndex] === i }}
              accessibilityLabel={`Option ${String.fromCharCode(65 + i)}: ${option}`}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
              <Text style={[styles.optionText, answers[currentIndex] === i && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PixelButton
          style={styles.navButton}
          variant="secondary"
          onPress={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          accessibilityLabel="Previous question"
          title="Previous"
        />

        {currentIndex === questions.length - 1 ? (
          <PixelButton
            style={styles.navButton}
            onPress={() => setConfirmSubmit(true)}
            accessibilityLabel="Submit exam"
            title="Submit Exam"
          />
        ) : (
          <PixelButton
            style={styles.navButton}
            onPress={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
            accessibilityLabel="Next question"
            title="Next"
          />
        )}
      </View>
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
    width: 64,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 9,
    fontFamily: FONTS.pixelDisplay,
  },
  headerTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  timerText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  timerLow: {
    color: COLORS.danger,
  },
  answeredCount: {
    width: 60,
    textAlign: 'right',
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.pixelBody,
  },
  confirmBanner: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  confirmText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.md,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
  },
  navigatorBar: {
    flexGrow: 0,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navigatorContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 6,
  },
  navDot: {
    width: 32,
    height: 32,
    borderRadius: RADII.none,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  navDotAnswered: {
    backgroundColor: COLORS.surface,
  },
  navDotFlagged: {
    borderColor: COLORS.warning,
  },
  navDotCurrent: {
    borderColor: COLORS.accent,
  },
  navDotText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.pixelBody,
  },
  scrollView: {
    flex: 1,
  },
  questionContent: {
    padding: SPACING.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainTag: {
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase',
    fontFamily: FONTS.pixelDisplay,
  },
  flagButton: {
    fontSize: 13,
    color: COLORS.warning,
    fontFamily: FONTS.pixelBody,
  },
  questionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontFamily: FONTS.pixelBody,
  },
  question: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    marginTop: 4,
    lineHeight: 24,
    fontFamily: FONTS.pixelBody,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.none,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: RADII.none,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: SPACING.md,
    fontFamily: FONTS.pixelDisplay,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  selectedOptionText: {
    color: COLORS.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: PIXEL_BORDER,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  navButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.pixelBody,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: RADII.none,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: SPACING.xl,
  },
  scoreText: {
    fontSize: 28,
    fontFamily: FONTS.pixelDisplay,
  },
  passText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONTS.pixelDisplay,
  },
  passHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    fontFamily: FONTS.pixelBody,
  },
  resultsContent: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    color: COLORS.accent,
    fontFamily: FONTS.pixelDisplay,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontFamily: FONTS.pixelBody,
  },
  domainTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    fontFamily: FONTS.pixelDisplay,
  },
  domainBreakdownItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: RADII.none,
    marginBottom: SPACING.sm,
  },
  domainBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainBreakdownName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelBody,
  },
  domainBreakdownAccuracy: {
    fontSize: 16,
    fontFamily: FONTS.pixelDisplay,
  },
  domainBreakdownStats: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  retryButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
