import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { QuizQuestion, DOMAIN_INFO } from '../types';

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
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#16213e',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 26,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: '#16213e',
    marginVertical: 16,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a0a0a0',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 20,
  },
  hint: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
