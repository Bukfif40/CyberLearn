import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Animated, AccessibilityInfo } from 'react-native';
import { DomainReadiness as DomainReadinessType, DOMAIN_INFO, SecurityDomain } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';

interface Props {
  domainReadiness: DomainReadinessType[];
  overallReadiness: number;
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type NodeState = 'mastered' | 'review' | 'untouched';

const DOMAIN_ORDER: SecurityDomain[] = [
  'general_security_concepts',
  'threats_vulnerabilities_mitigations',
  'security_architecture',
  'security_operations',
  'security_program_management',
];

const STATE_COLOR: Record<NodeState, string> = {
  mastered: COLORS.accent,
  review: COLORS.warning,
  untouched: COLORS.textSecondary,
};

const getNodeState = (accuracy: number, questionsAnswered: number): NodeState => {
  if (questionsAnswered === 0) return 'untouched';
  if (accuracy >= 80) return 'mastered';
  return 'review'; // attempted, but not yet mastered — actively due for review
};

interface PhaseNodeProps {
  color: string;
  state: NodeState;
  reduceMotion: boolean;
}

// Encapsulates the per-node "lit up" treatment: a steady glow when mastered,
// a gentle pulse when actively due for review (skipped under reduced motion).
const PhaseNode: React.FC<PhaseNodeProps> = ({ color, state, reduceMotion }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'review' || reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, reduceMotion, pulse]);

  return (
    <View style={styles.dotWrap}>
      {state === 'mastered' && <View style={[styles.dotGlow, { backgroundColor: color }]} />}
      <Animated.View
        style={[
          styles.dot,
          { borderColor: color, opacity: state === 'review' ? pulse : 1 },
        ]}
      />
    </View>
  );
};

export const LearningPath: React.FC<Props> = ({ domainReadiness, overallReadiness }) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setReduceMotion).catch(() => {});
  }, []);

  const getDomainReadinessData = (domain: SecurityDomain): DomainReadinessType | undefined => {
    return domainReadiness.find(dr => dr.domain === domain);
  };

  // Build phase data
  const phases = useMemo(() => {
    const phaseData: {
      number: Phase;
      title: string;
      description: string;
      color: string;
      state: NodeState;
      domain?: SecurityDomain;
      stats?: { accuracy: number; questionsAnswered: number; totalQuestions: number };
      linkLabel?: string;
      linkUrl?: string;
    }[] = [];

    // Phase 0: Before You Start
    phaseData.push({
      number: 0,
      title: 'Before You Start',
      description: 'Refresh basic networking, OS fundamentals, and security mindset if needed.',
      color: STATE_COLOR.untouched,
      state: 'untouched',
    });

    // Phases 1-5: Exam domains
    DOMAIN_ORDER.forEach((domain, index) => {
      const readinessData = getDomainReadinessData(domain);
      const phaseNumber = (index + 1) as Phase;
      const accuracy = readinessData?.accuracy ?? 0;
      const questionsAnswered = readinessData?.questionsAnswered ?? 0;
      const state = getNodeState(accuracy, questionsAnswered);

      phaseData.push({
        number: phaseNumber,
        title: DOMAIN_INFO[domain].title,
        description: `Master domain concepts and practice questions.`,
        color: STATE_COLOR[state],
        state,
        domain,
        stats: {
          accuracy,
          questionsAnswered,
          totalQuestions: readinessData?.totalQuestions ?? 0,
        },
      });
    });

    // Phase 6: Sit the Exam
    const examState: NodeState = overallReadiness >= 80 ? 'mastered' : 'untouched';
    phaseData.push({
      number: 6,
      title: 'Sit the Exam',
      description:
        'When your overall readiness consistently reaches 80%+, schedule and take the official CompTIA Security+ exam.',
      color: STATE_COLOR[examState],
      state: examState,
    });

    // Phase 7: Beyond Security+
    phaseData.push({
      number: 7,
      title: 'Beyond Security+',
      description: 'Branch into specialized roles and expand your expertise.',
      color: COLORS.accent,
      state: 'untouched',
      linkLabel: 'Explore with roadmap.sh',
      linkUrl: 'https://roadmap.sh/cyber-security',
    });

    return phaseData;
  }, [domainReadiness, overallReadiness]);

  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Learning Path</Text>
      <Text style={styles.subtitle}>
        Progress through Security+ domains, then explore advanced specializations
      </Text>

      {/* Network map */}
      <View style={styles.timeline}>
        {phases.map((phase, index) => (
          <View key={phase.number}>
            {/* Phase Node */}
            <View style={styles.phaseRow}>
              {/* Node and connecting line */}
              <View style={styles.dotColumn}>
                <PhaseNode color={phase.color} state={phase.state} reduceMotion={reduceMotion} />
                {index < phases.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: phases[index + 1].color },
                    ]}
                  />
                )}
              </View>

              {/* Phase Content */}
              <View style={styles.phaseContent}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseNumber}>Phase {phase.number}</Text>
                  <Text style={[styles.phaseTitle, { color: phase.color }]}>{phase.title}</Text>
                </View>

                <Text style={styles.phaseDescription}>{phase.description}</Text>

                {/* Domain-specific stats (phases 1-5) */}
                {phase.stats && (
                  <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Accuracy:</Text>
                      <Text style={[styles.statValue, { color: phase.color }]}>
                        {phase.stats.accuracy}%
                      </Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Questions:</Text>
                      <Text style={styles.statValue}>
                        {phase.stats.questionsAnswered}/{phase.stats.totalQuestions}
                      </Text>
                    </View>
                  </View>
                )}

                {/* External link (phase 7) */}
                {phase.linkUrl && phase.linkLabel && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleOpenLink(phase.linkUrl!)}
                    accessibilityRole="link"
                    accessibilityLabel={phase.linkLabel}
                  >
                    <Text style={styles.linkButtonText}>{phase.linkLabel} →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Overall Readiness Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryLabel}>Overall Readiness</Text>
        <View style={styles.readinessBar}>
          <View
            style={[
              styles.readinessBarFill,
              {
                width: `${overallReadiness}%`,
                backgroundColor:
                  overallReadiness >= 80 ? COLORS.accent : overallReadiness > 0 ? COLORS.warning : COLORS.textSecondary,
              },
            ]}
          />
        </View>
        <Text style={styles.readinessText}>{overallReadiness}% ready to attempt exam</Text>
      </View>
    </View>
  );
};

const NODE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontFamily: FONTS.sans,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.sans,
  },
  timeline: {
    marginBottom: SPACING.xl,
  },
  phaseRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotColumn: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 36,
  },
  dotWrap: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotGlow: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    opacity: 0.35,
    // subtle diffuse glow behind the mastered node; a real box-shadow on web, ignored on native
    shadowColor: COLORS.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dot: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    backgroundColor: COLORS.background,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: -6,
    marginBottom: 0,
  },
  phaseContent: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phaseHeader: {
    marginBottom: SPACING.sm,
  },
  phaseNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: FONTS.mono,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
  },
  phaseDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.sans,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: FONTS.sans,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
  },
  linkButton: {
    backgroundColor: 'rgba(0, 217, 232, 0.12)',
    borderRadius: RADII.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    fontFamily: FONTS.sans,
  },
  summarySection: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.sans,
  },
  readinessBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  readinessBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  readinessText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: FONTS.sans,
  },
});
