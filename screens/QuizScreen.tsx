import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { QuizQuestionCard } from '../components/QuizQuestionCard';
import { QuizService } from '../services/quizService';
import { QuizQuestion, DOMAIN_INFO, SecurityDomain } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';

interface QuizScreenProps {
  onBack: () => void;
  mode?: 'adaptive' | 'mistakes';
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ onBack, mode = 'adaptive' }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const loadedQuestions =
        mode === 'mistakes'
          ? await QuizService.getMistakeQuestions(15)
          : await QuizService.getAdaptiveQuiz(10);
      setQuestions(loadedQuestions);
      setAnswers(new Array(loadedQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    // Spaced-repetition stats are recorded once, in bulk, by saveQuizResult() when the quiz finishes.
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    await QuizService.saveQuizResult(answers as number[], questions, timeTaken);
    setShowResults(true);
  };

  const getScoreColor = (accuracy: number): string => {
    if (accuracy >= 80) return COLORS.accent;
    if (accuracy >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Quiz...</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>
            {mode === 'mistakes' ? 'Gathering questions you missed...' : 'Preparing your adaptive quiz...'}
          </Text>
        </View>
      </View>
    );
  }

  if (showResults) {
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    // Calculate domain breakdown
    const domainBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!domainBreakdown[q.domain]) {
        domainBreakdown[q.domain] = { correct: 0, total: 0 };
      }
      domainBreakdown[q.domain].total += 1;
      if (answers[i] === q.correctAnswer) {
        domainBreakdown[q.domain].correct += 1;
      }
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.resultsContent}>
          {/* Score Circle */}
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>{score}%</Text>
          </View>

          <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          <Text style={styles.resultsSubtitle}>
            You got {correctCount} out of {questions.length} questions correct
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{questions.length - correctCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          {/* Domain Breakdown */}
          <Text style={styles.domainTitle}>By Domain:</Text>
          {Object.entries(domainBreakdown).map(([domain, stats]) => (
            <View key={domain} style={styles.domainBreakdownItem}>
              <View style={styles.domainBreakdownHeader}>
                <Text style={styles.domainBreakdownName}>
                  {DOMAIN_INFO[domain as SecurityDomain].icon} {DOMAIN_INFO[domain as SecurityDomain].title}
                </Text>
                <Text style={[styles.domainBreakdownAccuracy, { color: getScoreColor(Math.round((stats.correct / stats.total) * 100)) }]}>
                  {Math.round((stats.correct / stats.total) * 100)}%
                </Text>
              </View>
              <Text style={styles.domainBreakdownStats}>
                {stats.correct}/{stats.total} questions correct
              </Text>
            </View>
          ))}

          {/* Retry Button */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadQuestions}
            accessibilityRole="button"
            accessibilityLabel="Start a new quiz"
          >
            <Text style={styles.retryButtonText}>
              {mode === 'mistakes' ? '🔁 Review More Mistakes' : '🚀 New Adaptive Quiz'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === 'mistakes' ? 'Review Mistakes' : 'Quiz'}</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {mode === 'mistakes'
              ? 'No mistakes to review yet — nice work!'
              : 'No questions available'}
          </Text>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentQuestionIndex + 1}/{questions.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Segmented scan-line progress: one tick per question, filled left to right */}
      <View style={styles.scanLine} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: questions.length, now: currentQuestionIndex + 1 }}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[styles.scanTick, i <= currentQuestionIndex && styles.scanTickFilled]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.questionContent}>
        <Text style={styles.domainTag}>
          {DOMAIN_INFO[currentQuestion.domain].icon} {DOMAIN_INFO[currentQuestion.domain].title}
        </Text>
        <QuizQuestionCard
          question={currentQuestion}
          selectedAnswer={answers[currentQuestionIndex]}
          onAnswerSelect={handleAnswerSelect}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous question"
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, answers[currentQuestionIndex] === null && styles.disabledButton]}
          onPress={handleNext}
          disabled={answers[currentQuestionIndex] === null}
          accessibilityRole="button"
          accessibilityLabel={currentQuestionIndex === questions.length - 1 ? 'Finish quiz' : 'Next question'}
        >
          <Text style={styles.navButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sans,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
  },
  scanLine: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scanTick: {
    flex: 1,
    height: 4,
    borderRadius: 1,
    backgroundColor: COLORS.border,
  },
  scanTickFilled: {
    backgroundColor: COLORS.accent,
  },
  scrollView: {
    flex: 1,
  },
  questionContent: {
    padding: SPACING.lg,
  },
  domainTag: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    fontFamily: FONTS.sans,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: RADII.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  navButtonText: {
    color: COLORS.textOnAccent,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sans,
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
    fontFamily: FONTS.sans,
  },
  resultsContent: {
    padding: SPACING.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: SPACING.xl,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: FONTS.mono,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontFamily: FONTS.sans,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.sans,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    fontFamily: FONTS.mono,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontFamily: FONTS.sans,
  },
  domainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    fontFamily: FONTS.sans,
  },
  domainBreakdownItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
  },
  domainBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainBreakdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
  },
  domainBreakdownAccuracy: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.mono,
  },
  domainBreakdownStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  retryButtonText: {
    color: COLORS.textOnAccent,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sans,
  },
});
