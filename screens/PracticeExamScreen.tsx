import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { QuizService } from '../services/quizService';
import { QuizQuestion, DOMAIN_INFO, SecurityDomain } from '../types';

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
    if (accuracy >= 75) return '#4ade80';
    if (accuracy >= 60) return '#fbbf24';
    return '#ef4444';
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
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

          <Text style={[styles.passText, { color: passed ? '#4ade80' : '#ef4444' }]}>
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

          <TouchableOpacity
            style={styles.retryButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Return to home screen"
          >
            <Text style={styles.retryButtonText}>Return Home</Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.confirmCancel}
              onPress={() => setConfirmSubmit(false)}
              accessibilityRole="button"
              accessibilityLabel="Keep going, do not submit yet"
            >
              <Text style={styles.confirmCancelText}>Keep Going</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmSubmitBtn}
              onPress={finishExam}
              accessibilityRole="button"
              accessibilityLabel="Confirm submit exam"
            >
              <Text style={styles.confirmSubmitText}>Submit</Text>
            </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous question"
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={() => setConfirmSubmit(true)}
            accessibilityRole="button"
            accessibilityLabel="Submit exam"
          >
            <Text style={styles.navButtonText}>Submit Exam</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
            accessibilityRole="button"
            accessibilityLabel="Next question"
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        )}
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
    width: 60,
  },
  backButtonText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timerLow: {
    color: '#ef4444',
  },
  answeredCount: {
    width: 60,
    textAlign: 'right',
    color: '#a0a0a0',
    fontSize: 13,
  },
  confirmBanner: {
    backgroundColor: '#0f3460',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 10,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancel: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  confirmSubmitBtn: {
    flex: 1,
    backgroundColor: '#e94560',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmSubmitText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  navigatorBar: {
    flexGrow: 0,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  navigatorContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  navDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  navDotAnswered: {
    backgroundColor: '#0f3460',
  },
  navDotFlagged: {
    borderColor: '#fbbf24',
  },
  navDotCurrent: {
    borderColor: '#e94560',
  },
  navDotText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  questionContent: {
    padding: 16,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
    textTransform: 'uppercase',
  },
  flagButton: {
    fontSize: 13,
    color: '#fbbf24',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 4,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#16213e',
  },
  selectedOption: {
    borderColor: '#e94560',
    backgroundColor: '#e9456020',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#d0d0d0',
  },
  selectedOptionText: {
    color: '#e94560',
    fontWeight: '600',
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
  submitButton: {
    backgroundColor: '#4ade80',
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
  passText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passHint: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  resultsContent: {
    padding: 16,
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
