import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GamificationService } from '../services/gamification';

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
    backgroundColor: '#0f3460',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 12,
  },
  levelSection: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelLabel: {
    color: '#a0a0a0',
    fontSize: 10,
    marginTop: 2,
  },
  xpSection: {
    flex: 1,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: '#16213e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  xpText: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 4,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
