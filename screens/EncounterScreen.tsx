import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Encounter } from '../types/game';

interface Props {
  encounter: Encounter;
  onFinish: (cleared: boolean) => void;
}

const MAX_HP = 100;
const DAMAGE_PER_WRONG_ANSWER = 25;

type Stage = 'intro' | 'question' | 'result';

export const EncounterScreen: React.FC<Props> = ({ encounter, onFinish }) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const question = encounter.questions[questionIndex];
  const defeated = hp <= 0;

  const beginBattle = () => {
    setStage('question');
  };

  const selectAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === question.correctIndex;
    setFeedback(correct ? question.correctFeedback : question.incorrectFeedback);
    if (!correct) {
      setHp(h => Math.max(0, h - DAMAGE_PER_WRONG_ANSWER));
    }
  };

  const continueAfterFeedback = () => {
    if (hp <= 0) {
      setStage('result');
      return;
    }
    if (questionIndex < encounter.questions.length - 1) {
      setQuestionIndex(i => i + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setStage('result');
    }
  };

  const cleared = stage === 'result' && !defeated;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {encounter.emoji} {encounter.name}
        </Text>
        <View style={styles.hpBarTrack}>
          <View style={[styles.hpBarFill, { width: `${(hp / MAX_HP) * 100}%` }]} />
        </View>
        <Text style={styles.hpLabel}>HP {hp}/{MAX_HP}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {stage === 'intro' && (
          <>
            <Text style={styles.introText}>{encounter.intro}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={beginBattle}
              accessibilityRole="button"
              accessibilityLabel="Begin encounter"
            >
              <Text style={styles.primaryButtonText}>Investigate ⚔️</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'question' && (
          <>
            <Text style={styles.questionPrompt}>{question.prompt}</Text>
            {question.options.map((option, i) => {
              const isSelected = selected === i;
              const isCorrect = i === question.correctIndex;
              const showState = selected !== null;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.option,
                    showState && isCorrect && styles.optionCorrect,
                    showState && isSelected && !isCorrect && styles.optionIncorrect,
                  ]}
                  onPress={() => selectAnswer(i)}
                  disabled={showState}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
            {feedback && (
              <>
                <Text style={styles.feedback}>{feedback}</Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={continueAfterFeedback}
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                >
                  <Text style={styles.primaryButtonText}>
                    {hp <= 0 ? 'Continue' : questionIndex < encounter.questions.length - 1 ? 'Next' : 'Finish'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {stage === 'result' && (
          <>
            <Text style={styles.resultTitle}>{cleared ? '✅ Threat Neutralized!' : '💀 You Need Backup'}</Text>
            <Text style={styles.resultSubtitle}>
              {cleared
                ? 'Nice catch — that\'s exactly the kind of vigilance a real SOC analyst needs.'
                : "Don't worry — review the feedback above and try again. Every analyst misses one before they get good."}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onFinish(cleared)}
              accessibilityRole="button"
              accessibilityLabel="Return to map"
            >
              <Text style={styles.primaryButtonText}>Return to Map</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  header: {
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#12151C',
    borderBottomWidth: 2,
    borderBottomColor: '#3A3F4B',
  },
  title: {
    color: '#F5F6FA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  hpBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2A2E3A',
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  hpLabel: {
    color: '#9298A8',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  introText: {
    color: '#E6E8EF',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 24,
  },
  questionPrompt: {
    color: '#F5F6FA',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 23,
  },
  option: {
    backgroundColor: '#1A1D27',
    borderWidth: 2,
    borderColor: '#2A2E3A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  optionText: {
    color: '#E6E8EF',
    fontSize: 15,
  },
  feedback: {
    color: '#9298A8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resultTitle: {
    color: '#F5F6FA',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultSubtitle: {
    color: '#9298A8',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
});
