import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { QuizQuestion, DOMAIN_INFO } from '../types';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface FlashCardProps {
  question: QuizQuestion;
}

export const FlashCard: React.FC<FlashCardProps> = ({ question }) => {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFlipped(false);
    flipAnim.setValue(0);
  }, [question.id]);

  const toggleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleFlip}
      accessibilityRole="button"
      accessibilityLabel={flipped ? 'Showing answer, tap to see question' : 'Showing question, tap to reveal answer'}
      style={styles.wrapper}
    >
      <Animated.View
        style={[
          styles.card,
          styles.faceFront,
          { opacity: frontOpacity, transform: [{ perspective: 1200 }, { rotateY }] },
        ]}
        pointerEvents={flipped ? 'none' : 'auto'}
        importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={flipped}
      >
        <Text style={styles.domainTag}>
          {DOMAIN_INFO[question.domain].icon} {DOMAIN_INFO[question.domain].title}
        </Text>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.hint}>Tap to reveal answer</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.faceBack,
          { opacity: backOpacity, transform: [{ perspective: 1200 }, { rotateY: backRotateY }] },
        ]}
        pointerEvents={flipped ? 'auto' : 'none'}
        importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
        accessibilityElementsHidden={!flipped}
      >
        <Text style={styles.answerLabel}>Answer</Text>
        <Text style={styles.answerText}>{question.options[question.correctAnswer]}</Text>
        <View style={styles.divider} />
        <Text style={styles.explanationLabel}>Why:</Text>
        <Text style={styles.explanationText}>{question.explanation}</Text>
        <Text style={styles.hint}>Tap to flip back</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 280,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.none,
    padding: SPACING.xl,
    minHeight: 280,
    borderWidth: PIXEL_BORDER,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  faceFront: {},
  faceBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  domainTag: {
    fontSize: 11,
    color: COLORS.accent,
    marginBottom: SPACING.lg,
    textTransform: 'uppercase',
    fontFamily: FONTS.pixelDisplay,
  },
  questionText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    lineHeight: 27,
    fontFamily: FONTS.pixelBody,
  },
  answerLabel: {
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.pixelDisplay,
  },
  answerText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    lineHeight: 27,
    fontFamily: FONTS.pixelBody,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  explanationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: FONTS.pixelDisplay,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.pixelBody,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontFamily: FONTS.pixelBody,
  },
});
