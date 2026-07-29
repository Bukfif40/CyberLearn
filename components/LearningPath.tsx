import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { DomainReadiness as DomainReadinessType, DOMAIN_INFO, SecurityDomain } from '../types';

interface Props {
  domainReadiness: DomainReadinessType[];
  overallReadiness: number;
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const DOMAIN_ORDER: SecurityDomain[] = [
  'general_security_concepts',
  'threats_vulnerabilities_mitigations',
  'security_architecture',
  'security_operations',
  'security_program_management',
];

export const LearningPath: React.FC<Props> = ({ domainReadiness, overallReadiness }) => {
  // Determine phase colors based on readiness accuracy
  const getPhaseColor = (accuracy: number): string => {
    if (accuracy >= 80) return '#4ade80'; // success green
    if (accuracy >= 40) return '#fbbf24'; // warning yellow
    return '#6b7280'; // gray for not started
  };

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
      color: '#6b7280',
    });

    // Phases 1-5: Exam domains
    DOMAIN_ORDER.forEach((domain, index) => {
      const readinessData = getDomainReadinessData(domain);
      const phaseNumber = (index + 1) as Phase;
      const accuracy = readinessData?.accuracy ?? 0;
      const color = getPhaseColor(accuracy);

      phaseData.push({
        number: phaseNumber,
        title: DOMAIN_INFO[domain].title,
        description: `Master domain concepts and practice questions.`,
        color,
        domain,
        stats: {
          accuracy,
          questionsAnswered: readinessData?.questionsAnswered ?? 0,
          totalQuestions: readinessData?.totalQuestions ?? 0,
        },
      });
    });

    // Phase 6: Sit the Exam
    phaseData.push({
      number: 6,
      title: 'Sit the Exam',
      description:
        'When your overall readiness consistently reaches 80%+, schedule and take the official CompTIA Security+ exam.',
      color: overallReadiness >= 80 ? '#4ade80' : '#6b7280',
    });

    // Phase 7: Beyond Security+
    phaseData.push({
      number: 7,
      title: 'Beyond Security+',
      description: 'Branch into specialized roles and expand your expertise.',
      color: '#9333ea', // purple for future path
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

      {/* Timeline */}
      <View style={styles.timeline}>
        {phases.map((phase, index) => (
          <View key={phase.number}>
            {/* Phase Node */}
            <View style={styles.phaseRow}>
              {/* Dot and connecting line */}
              <View style={styles.dotColumn}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: phase.color,
                      borderColor: phase.color,
                    },
                  ]}
                />
                {index < phases.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor: phases[index + 1].color,
                      },
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
                  overallReadiness >= 80 ? '#4ade80' : overallReadiness >= 40 ? '#fbbf24' : '#6b7280',
              },
            ]}
          />
        </View>
        <Text style={styles.readinessText}>{overallReadiness}% ready to attempt exam</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  timeline: {
    marginBottom: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotColumn: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#6b7280',
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: '#6b7280',
    marginTop: -8,
    marginBottom: 0,
  },
  phaseContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#333',
  },
  phaseHeader: {
    marginBottom: 8,
  },
  phaseNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  phaseDescription: {
    fontSize: 13,
    color: '#bbb',
    lineHeight: 18,
    marginBottom: 8,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  linkButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c084fc',
  },
  summarySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  readinessBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  readinessBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  readinessText: {
    fontSize: 13,
    color: '#bbb',
    fontWeight: '500',
  },
});
