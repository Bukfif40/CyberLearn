import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_BG: Record<Variant, string> = {
  primary: COLORS.accent,
  secondary: COLORS.surface,
  danger: COLORS.danger,
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: COLORS.textOnAccent,
  secondary: COLORS.textPrimary,
  danger: COLORS.textOnAccent,
};

export const PixelButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { backgroundColor: disabled ? COLORS.border : VARIANT_BG[variant] },
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? COLORS.textSecondary : VARIANT_TEXT[variant] }]}>
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADII.none,
    borderWidth: PIXEL_BORDER,
    borderTopColor: 'rgba(255,255,255,0.35)',
    borderLeftColor: 'rgba(255,255,255,0.35)',
    borderRightColor: 'rgba(0,0,0,0.35)',
    borderBottomColor: 'rgba(0,0,0,0.35)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONTS.pixelDisplay,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
