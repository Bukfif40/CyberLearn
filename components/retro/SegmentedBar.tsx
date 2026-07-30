import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  segments: number;
  filled: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const SegmentedBar: React.FC<Props> = ({ segments, filled, color = COLORS.accent, style }) => {
  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: segments, now: filled }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, { backgroundColor: i < filled ? color : COLORS.border }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 3,
  },
  segment: {
    flex: 1,
    height: 6,
  },
});
