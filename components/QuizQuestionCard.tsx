import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { QuizQuestion } from '../types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  showResult?: boolean;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
}) => {
  const getOptionStyle = (index: number) => {
    if (!showResult && selectedAnswer === null) {
      return styles.option;
    }
    
    if (showResult) {
      if (index === question.correctAnswer) {
        return [styles.option, styles.correctOption];
      } else if (selectedAnswer === index && index !== question.correctAnswer) {
        return [styles.option, styles.incorrectOption];
      }
      return styles.option;
    }
    
    if (selectedAnswer === index) {
      return [styles.option, styles.selectedOption];
    }
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (showResult) {
      if (index === question.correctAnswer) {
        return [styles.optionText, styles.correctOptionText];
      } else if (selectedAnswer === index && index !== question.correctAnswer) {
        return [styles.optionText, styles.incorrectOptionText];
      }
      return styles.optionText;
    }
    
    if (selectedAnswer === index) {
      return [styles.optionText, styles.selectedOptionText];
    }
    return styles.optionText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) }]}>
          <Text style={styles.difficultyText}>{question.difficulty.toUpperCase()}</Text>
        </View>
        <Text style={styles.category}>{question.domain}</Text>
      </View>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => !showResult && onAnswerSelect(index)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
            <Text style={getOptionTextStyle(index)}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showResult && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanation}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#4ade80';
    case 'medium': return '#fbbf24';
    case 'hard': return '#ef4444';
    default: return '#a0a0a0';
  }
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
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  category: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#16213e',
  },
  selectedOption: {
    borderColor: '#e94560',
    backgroundColor: '#e9456020',
  },
  correctOption: {
    borderColor: '#4ade80',
    backgroundColor: '#4ade8020',
  },
  incorrectOption: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444420',
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
  correctOptionText: {
    color: '#4ade80',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0f3460',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 13,
    color: '#d0d0d0',
    lineHeight: 20,
  },
});
