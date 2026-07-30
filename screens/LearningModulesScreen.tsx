import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LearningModuleService } from '../services/learningModules';
import { LearningModule, ModuleProgress } from '../types';
import { PixelPanel } from '../components/retro/PixelPanel';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface LearningModulesScreenProps {
  onBack: () => void;
  onSelectModule: (moduleId: string) => void;
}

export const LearningModulesScreen: React.FC<LearningModulesScreenProps> = ({ onBack, onSelectModule }) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progressByModule, setProgressByModule] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setModules(LearningModuleService.getAllModules());
    setProgressByModule(await LearningModuleService.getAllModuleProgress());
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Modules</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Structured lessons for each domain, capped off with a boss battle quiz.
        </Text>

        {modules.map(module => {
          const progress = progressByModule[module.id];
          const completedLessons = progress ? Object.keys(progress.lessons).length : 0;
          const totalLessons = module.lessons.length;
          const passed = progress?.bossBattlePassed ?? false;

          return (
            <TouchableOpacity
              key={module.id}
              onPress={() => onSelectModule(module.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open module: ${module.title}`}
            >
              <PixelPanel style={styles.moduleCard} glow={passed}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                  <View style={styles.moduleTitleWrap}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    {passed && <Text style={styles.passedTag}>CLEARED</Text>}
                  </View>
                </View>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                <Text style={styles.moduleProgress}>
                  {completedLessons}/{totalLessons} lessons complete
                </Text>
              </PixelPanel>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 40,
    backgroundColor: COLORS.surface,
    borderBottomWidth: PIXEL_BORDER,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: FONTS.pixelDisplay,
  },
  headerTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  intro: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.lg,
  },
  moduleCard: {
    marginBottom: SPACING.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  moduleTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleTitle: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  passedTag: {
    fontSize: 10,
    color: COLORS.accent,
    fontFamily: FONTS.pixelDisplay,
  },
  moduleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  moduleProgress: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.pixelBody,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
