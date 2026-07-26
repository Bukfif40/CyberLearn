import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GamificationService } from '../services/gamification';
import { StudyTimerService } from '../services/studyTimer';
import { QuizService } from '../services/quizService';
import { StorageService } from '../services/storage';
import { GamificationData } from '../types';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statIcon, { color }]}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export const StatsDashboard: React.FC = () => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [studyTimeToday, setStudyTimeToday] = useState(0);
  const [studyTimeThisWeek, setStudyTimeThisWeek] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [roadmapsViewed, setRoadmapsViewed] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const gameData = await GamificationService.getGamificationData();
    setGamificationData(gameData);

    const totalTime = await StudyTimerService.getTotalStudyTime();
    setTotalStudyTime(totalTime);

    const todayTime = await StudyTimerService.getStudyTimeToday();
    setStudyTimeToday(todayTime);

    const weekTime = await StudyTimerService.getStudyTimeThisWeek();
    setStudyTimeThisWeek(weekTime);

    const quizzes = await QuizService.getTotalQuizzesTaken();
    setQuizCount(quizzes);

    const avgScore = await QuizService.getAverageScore();
    setAverageQuizScore(avgScore);

    const preferences = await StorageService.getUserPreferences();
    setRoadmapsViewed((preferences as any)?.viewedRoadmaps?.length || 0);
    setFavoritesCount((preferences as any)?.favoriteRoadmaps?.length || 0);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getUnlockedAchievements = () => {
    if (!gamificationData) return 0;
    return gamificationData.achievements.filter(a => a.unlockedAt).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Statistics</Text>
        <TouchableOpacity onPress={loadStats} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gamification Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress & Achievements</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Current Level"
              value={gamificationData?.level.toString() || '1'}
              icon="⭐"
              color="#fbbf24"
            />
            <StatCard
              title="Total XP"
              value={gamificationData?.xp.toString() || '0'}
              icon="✨"
              color="#a855f7"
            />
            <StatCard
              title="Current Streak"
              value={`${gamificationData?.streak || 0} days`}
              icon="🔥"
              color="#ef4444"
            />
            <StatCard
              title="Achievements"
              value={`${getUnlockedAchievements()}/${gamificationData?.achievements.length || 10}`}
              icon="🏆"
              color="#4ade80"
            />
          </View>
        </View>

        {/* Study Time Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Time</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Study Time"
              value={formatTime(totalStudyTime)}
              icon="⏱️"
              color="#60a5fa"
            />
            <StatCard
              title="Today"
              value={formatTime(studyTimeToday)}
              icon="📅"
              color="#4ade80"
            />
            <StatCard
              title="This Week"
              value={formatTime(studyTimeThisWeek)}
              icon="📊"
              color="#f97316"
            />
            <StatCard
              title="Daily Average"
              value={formatTime(Math.round(totalStudyTime / 30))}
              icon="📈"
              color="#a855f7"
            />
          </View>
        </View>

        {/* Quiz Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz Performance</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Quizzes Taken"
              value={quizCount.toString()}
              icon="🧠"
              color="#e94560"
            />
            <StatCard
              title="Average Score"
              value={`${averageQuizScore}%`}
              icon="🎯"
              color="#4ade80"
            />
            <StatCard
              title="Correct Answers"
              value={Math.round(quizCount * (averageQuizScore / 100) * 5).toString()}
              icon="✅"
              color="#60a5fa"
            />
            <StatCard
              title="Quiz Streak"
              value="0"
              icon="🔥"
              color="#fbbf24"
            />
          </View>
        </View>

        {/* Activity Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Roadmaps Viewed"
              value={roadmapsViewed.toString()}
              icon="🗺️"
              color="#60a5fa"
            />
            <StatCard
              title="Favorites"
              value={favoritesCount.toString()}
              icon="❤️"
              color="#ef4444"
            />
            <StatCard
              title="Notes Taken"
              value="0"
              icon="📝"
              color="#fbbf24"
            />
            <StatCard
              title="Goals Completed"
              value="0"
              icon="🎯"
              color="#4ade80"
            />
          </View>
        </View>

        {/* Recent Achievements */}
        {gamificationData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {gamificationData.achievements
                .filter(a => a.unlockedAt)
                .slice(0, 5)
                .map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementRarity}>{achievement.rarity}</Text>
                  </View>
                ))}
              {gamificationData.achievements.filter(a => a.unlockedAt).length === 0 && (
                <Text style={styles.noAchievements}>No achievements yet. Keep learning!</Text>
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  content: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a0a0a0',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    margin: '1%',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  achievementsScroll: {
    flexDirection: 'row',
  },
  achievementCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  achievementRarity: {
    fontSize: 10,
    color: '#a0a0a0',
  },
  noAchievements: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
