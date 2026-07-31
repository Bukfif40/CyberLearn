import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onMove: (dx: number, dy: number) => void;
  disabled?: boolean;
}

export const DPad: React.FC<Props> = ({ onMove, disabled }) => {
  const Btn = ({
    label,
    dx,
    dy,
    accessibilityLabel,
  }: {
    label: string;
    dx: number;
    dy: number;
    accessibilityLabel: string;
  }) => (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={() => onMove(dx, dy)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Btn label="▲" dx={0} dy={-1} accessibilityLabel="Move up" />
      </View>
      <View style={styles.row}>
        <Btn label="◀" dx={-1} dy={0} accessibilityLabel="Move left" />
        <View style={styles.spacer} />
        <Btn label="▶" dx={1} dy={0} accessibilityLabel="Move right" />
      </View>
      <View style={styles.row}>
        <Btn label="▼" dx={0} dy={1} accessibilityLabel="Move down" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1E2430',
    borderWidth: 1,
    borderColor: '#3A3F4B',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#E6E8EF',
    fontSize: 20,
    fontWeight: '700',
  },
  spacer: {
    width: 52,
    height: 52,
    margin: 3,
  },
});
