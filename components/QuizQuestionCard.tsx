import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { QuizQuestion } from '../types';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

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
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedAnswer === index }}
            accessibilityLabel={`Option ${String.fromCharCode(65 + index)}: ${option}`}
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
    case 'easy': return COLORS.accent;
    case 'medium': return COLORS.warning;
    case 'hard': return COLORS.danger;
    default: return COLORS.textSecondary;
  }
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
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.none,
  },
  difficultyText: {
    color: COLORS.textOnAccent,
    fontSize: 9,
    fontFamily: FONTS.pixelDisplay,
  },
  category: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.pixelBody,
  },
  question: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    lineHeight: 24,
    fontFamily: FONTS.pixelBody,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADII.none,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
  },
  correctOption: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
  },
  incorrectOption: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 59, 59, 0.12)',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: RADII.none,
    backgroundColor: COLORS.surface,
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
  correctOptionText: {
    color: COLORS.accent,
  },
  incorrectOptionText: {
    color: COLORS.danger,
  },
  explanationContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.none,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  explanationTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontFamily: FONTS.pixelDisplay,
  },
  explanation: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.pixelBody,
  },
});
