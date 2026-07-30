import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GamificationService } from '../services/gamification';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface GamificationBarProps {
  xp: number;
  level: number;
  streak: number;
}

export const GamificationBar: React.FC<GamificationBarProps> = ({ xp, level, streak }) => {
  const progress = GamificationService.getProgressToNextLevel(xp, level);
  const xpToNext = GamificationService.getXPForNextLevel(level);

  return (
    <View style={styles.container}>
      <View style={styles.levelSection}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.levelLabel}>Level</Text>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp} / {xpToNext} XP</Text>
      </View>

      <View style={styles.streakSection}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>{streak}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: PIXEL_BORDER,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADII.none,
    gap: SPACING.md,
  },
  levelSection: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: RADII.none,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.textOnAccent,
    fontSize: 16,
    fontFamily: FONTS.pixelDisplay,
  },
  levelLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: SPACING.xs,
    fontFamily: FONTS.pixelBody,
  },
  xpSection: {
    flex: 1,
  },
  xpBarContainer: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: RADII.none,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADII.none,
  },
  xpText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
    fontFamily: FONTS.pixelBody,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.pixelDisplay,
  },
});
