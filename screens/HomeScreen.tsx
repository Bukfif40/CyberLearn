import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GamificationBar } from '../components/GamificationBar';
import { StudyGoals } from '../components/StudyGoals';
import { StudyTimer } from '../components/StudyTimer';
import { LearningPath } from '../components/LearningPath';
import { StudyResourceCard } from '../components/StudyResourceCard';
import { StudyNotesSection } from '../components/StudyNotesSection';
import { LabGuide } from '../components/LabGuide';
import { GamificationService } from '../services/gamification';
import { QuizService } from '../services/quizService';
import { GamificationData, DomainReadiness as DomainReadinessType } from '../types';
import { FREE_STUDY_RESOURCES, PAID_STUDY_RESOURCES } from '../data/studyResources';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';

interface HomeScreenProps {
  onQuizPress?: () => void;
  onMistakesPress?: () => void;
  onFlashcardsPress?: () => void;
  onExamPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onQuizPress,
  onMistakesPress,
  onFlashcardsPress,
  onExamPress,
}) => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [domainReadiness, setDomainReadiness] = useState<DomainReadinessType[]>([]);
  const [overallReadiness, setOverallReadiness] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load gamification
      const gameData = await GamificationService.getGamificationData();
      setGamificationData(gameData);

      // Update streak
      await GamificationService.updateStreak();
      const updatedGameData = await GamificationService.getGamificationData();
      setGamificationData(updatedGameData);

      // Load readiness
      const domainReadinessData = await QuizService.getDomainReadiness();
      setDomainReadiness(domainReadinessData);

      const overallScore = await QuizService.getOverallReadiness();
      setOverallReadiness(overallScore);

      const mistakes = await QuizService.getMistakeCount();
      setMistakeCount(mistakes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>CyberLearn</Text>
            <Text style={styles.subtitle}>CompTIA Security+ SY0-701 Exam Prep</Text>
          </View>

          {/* Gamification Bar */}
          {gamificationData && (
            <GamificationBar
              xp={gamificationData.xp}
              level={gamificationData.level}
              streak={gamificationData.streak}
            />
          )}

          {/* Start Adaptive Quiz Button */}
          <TouchableOpacity
            style={styles.adaptiveQuizButton}
            onPress={() => onQuizPress && onQuizPress()}
            accessibilityRole="button"
            accessibilityLabel="Start adaptive quiz"
          >
            <Text style={styles.adaptiveQuizButtonIcon}>🧠</Text>
            <View style={styles.adaptiveQuizButtonContent}>
              <Text style={styles.adaptiveQuizButtonTitle}>Start Adaptive Quiz</Text>
              <Text style={styles.adaptiveQuizButtonSubtitle}>
                Get personalized questions based on your learning progress
              </Text>
            </View>
            <Text style={styles.adaptiveQuizButtonArrow}>→</Text>
          </TouchableOpacity>

          {/* Study Mode Grid */}
          <View style={styles.modeGrid}>
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => onFlashcardsPress && onFlashcardsPress()}
              accessibilityRole="button"
              accessibilityLabel="Study flashcards"
            >
              <Text style={styles.modeCardIcon}>🗂️</Text>
              <Text style={styles.modeCardTitle}>Flashcards</Text>
              <Text style={styles.modeCardSubtitle}>Flip through key concepts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => onExamPress && onExamPress()}
              accessibilityRole="button"
              accessibilityLabel="Start full-length practice exam"
            >
              <Text style={styles.modeCardIcon}>⏱️</Text>
              <Text style={styles.modeCardTitle}>Practice Exam</Text>
              <Text style={styles.modeCardSubtitle}>90 questions, timed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, mistakeCount === 0 && styles.modeCardDisabled]}
              onPress={() => onMistakesPress && onMistakesPress()}
              disabled={mistakeCount === 0}
              accessibilityRole="button"
              accessibilityLabel={`Review mistakes, ${mistakeCount} questions to review`}
            >
              <Text style={styles.modeCardIcon}>🎯</Text>
              <Text style={styles.modeCardTitle}>Review Mistakes</Text>
              <Text style={styles.modeCardSubtitle}>
                {mistakeCount > 0 ? `${mistakeCount} to review` : 'None yet — nice work!'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Learning Path */}
          {domainReadiness.length > 0 && (
            <LearningPath
              domainReadiness={domainReadiness}
              overallReadiness={overallReadiness}
            />
          )}

          {/* Study Goals */}
          <StudyGoals />

          {/* Study Timer */}
          <StudyTimer />

          {/* Study Resources: Free & Open */}
          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesTitle}>Free &amp; Open</Text>
            <Text style={styles.resourcesSubtitle}>
              No cost, no account required — everything you need to reach exam readiness
            </Text>
            <StudyNotesSection />
            <LabGuide />
            {FREE_STUDY_RESOURCES.map(resource => (
              <StudyResourceCard key={resource.id} resource={resource} />
            ))}
          </View>

          {/* Study Resources: Paid */}
          <View style={styles.resourcesSection}>
            <View style={styles.paidDivider} />
            <Text style={styles.resourcesTitle}>The Armory</Text>
            <Text style={styles.resourcesSubtitle}>
              Paid resources worth the money if you want more structured, guided material
            </Text>
            {PAID_STUDY_RESOURCES.map(resource => (
              <StudyResourceCard key={resource.id} resource={resource} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent,
    fontFamily: FONTS.sans,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontFamily: FONTS.sans,
  },
  adaptiveQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  adaptiveQuizButtonIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  adaptiveQuizButtonContent: {
    flex: 1,
  },
  adaptiveQuizButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
  },
  adaptiveQuizButtonSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: FONTS.sans,
  },
  adaptiveQuizButtonArrow: {
    fontSize: 20,
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: SPACING.lg,
    marginBottom: 4,
  },
  modeCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeCardDisabled: {
    opacity: 0.5,
  },
  modeCardIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  modeCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.sans,
  },
  modeCardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans,
  },
  resourcesSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  paidDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontFamily: FONTS.sans,
  },
  resourcesSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.sans,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.sans,
  },
});
