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
    if (accuracy >= 80) return '#4ade80';
    if (accuracy >= 60) return '#fbbf24';
    return '#ef4444';
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
          <ActivityIndicator size="large" color="#e94560" />
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
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentQuestionIndex + 1}/{questions.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
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
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#16213e',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  scrollView: {
    flex: 1,
  },
  questionContent: {
    padding: 16,
  },
  domainTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#e94560',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#16213e',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#a0a0a0',
    fontSize: 16,
  },
  resultsContent: {
    padding: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 24,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#16213e',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
  domainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#bbb',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  domainBreakdownItem: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  domainBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainBreakdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  domainBreakdownAccuracy: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  domainBreakdownStats: {
    fontSize: 12,
    color: '#999',
  },
  retryButton: {
    backgroundColor: '#4ade80',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
