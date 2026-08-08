import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  speakerName: string;
  speakerEmoji: string;
  line: string;
  isLastLine: boolean;
  onAdvance: () => void;
}

export const DialogueBox: React.FC<Props> = ({ speakerName, speakerEmoji, line, isLastLine, onAdvance }) => {
  return (
    <TouchableOpacity
      style={styles.box}
      activeOpacity={0.85}
      onPress={onAdvance}
      accessibilityRole="button"
      accessibilityLabel={isLastLine ? 'Close dialogue' : 'Next line'}
    >
      <Text style={styles.speaker}>
        {speakerEmoji} {speakerName}
      </Text>
      <Text style={styles.line}>{line}</Text>
      <Text style={styles.hint}>{isLastLine ? 'Tap to close ✕' : 'Tap to continue ▶'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#12151C',
    borderWidth: 2,
    borderColor: '#3A3F4B',
    borderRadius: 12,
    padding: 16,
  },
  speaker: {
    color: '#8B93FF',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
  },
  line: {
    color: '#E6E8EF',
    fontSize: 15,
    lineHeight: 21,
  },
  hint: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'right',
  },
});
