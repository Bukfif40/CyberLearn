import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { QuizQuestionCard } from '../components/QuizQuestionCard';
import { QuizService } from '../services/quizService';
import { QuizQuestion, QuizResult } from '../types';

interface QuizScreenProps {
  onBack: () => void;
  quizType?: 'random' | 'category' | 'difficulty' | 'mixed';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  onBack,
  quizType = 'mixed',
  category,
  difficulty,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadQuestions();
    setStartTime(Date.now());
  }, [quizType, category, difficulty]);

  const loadQuestions = () => {
    setLoading(true);
    let loadedQuestions: QuizQuestion[] = [];

    switch (quizType) {
      case 'category':
        loadedQuestions = QuizService.getQuestionsByCategory(category || 'Fundamentals', 5);
        break;
      case 'difficulty':
        loadedQuestions = QuizService.getQuestionsByDifficulty(difficulty || 'medium', 5);
        break;
      case 'random':
        loadedQuestions = QuizService.getRandomQuestions(5);
        break;
      case 'mixed':
      default:
        loadedQuestions = QuizService.getMixedDifficultyQuiz(5);
        break;
    }

    setQuestions(loadedQuestions);
    setAnswers(new Array(loadedQuestions.length).fill(null));
    setLoading(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
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
    const score = QuizService.calculateScore(answers as number[], questions);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;
    
    const result: QuizResult = {
      quizId: `quiz_${Date.now()}`,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      completedAt: new Date().toISOString(),
    };

    await QuizService.saveQuizResult(result);
    setShowResults(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  if (showResults) {
    const score = QuizService.calculateScore(answers as number[], questions);
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.resultsContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
              <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>{score}%</Text>
            </View>

            <Text style={resultsStyles.title}>Quiz Complete!</Text>
            <Text style={resultsStyles.subtitle}>
              You got {correctCount} out of {questions.length} questions correct
            </Text>

            <View style={resultsStyles.statsRow}>
              <View style={resultsStyles.stat}>
                <Text style={resultsStyles.statValue}>{correctCount}</Text>
                <Text style={resultsStyles.statLabel}>Correct</Text>
              </View>
              <View style={resultsStyles.stat}>
                <Text style={resultsStyles.statValue}>{questions.length - correctCount}</Text>
                <Text style={resultsStyles.statLabel}>Incorrect</Text>
              </View>
              <View style={resultsStyles.stat}>
                <Text style={resultsStyles.statValue}>{Math.round((Date.now() - startTime) / 1000 / 60)}m</Text>
                <Text style={resultsStyles.statLabel}>Time</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
              <Text style={styles.retryButtonText}>Try Another Quiz</Text>
            </TouchableOpacity>

            <Text style={styles.reviewTitle}>Review Answers:</Text>
            {questions.map((question, index) => (
              <QuizQuestionCard
                key={question.id}
                question={question}
                selectedAnswer={answers[index]}
                onAnswerSelect={() => {}}
                showResult={true}
              />
            ))}
          </View>
        </ScrollView>
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
        <Text style={styles.headerTitle}>Question {currentQuestionIndex + 1}/{questions.length}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.scrollView}>
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
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, answers[currentQuestionIndex] === null && styles.disabledButton]}
          onPress={handleNext}
          disabled={answers[currentQuestionIndex] === null}
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
  },
  resultsContainer: {
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
  retryButton: {
    backgroundColor: '#4ade80',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
});

const resultsStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
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
});
