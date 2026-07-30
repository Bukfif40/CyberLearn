import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, RADII, SPACING, PIXEL_BORDER, glow } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
}

export const PixelPanel: React.FC<Props> = ({ children, style, glow: withGlow }) => {
  return <View style={[styles.panel, withGlow && (glow(COLORS.accent) as ViewStyle), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: PIXEL_BORDER,
    borderColor: COLORS.border,
    borderRadius: RADII.none,
    padding: SPACING.md,
  },
});
