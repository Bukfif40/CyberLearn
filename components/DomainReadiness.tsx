import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DomainReadiness as DomainReadinessType, DOMAIN_INFO } from '../types';

interface Props {
  domainReadiness: DomainReadinessType[];
  overallReadiness: number;
}

export const DomainReadiness: React.FC<Props> = ({ domainReadiness, overallReadiness }) => {
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return '#22c55e'; // green
    if (accuracy >= 60) return '#eab308'; // yellow
    if (accuracy >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <View style={styles.container}>
      {/* Overall Readiness Score */}
      <View style={styles.overallSection}>
        <Text style={styles.overallLabel}>Overall Readiness</Text>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color: getAccuracyColor(overallReadiness) }]}>
            {overallReadiness}%
          </Text>
        </View>
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${overallReadiness}%`,
                backgroundColor: getAccuracyColor(overallReadiness),
              },
            ]}
          />
        </View>
      </View>

      {/* Domain Breakdown */}
      <Text style={styles.domainTitle}>Domain Breakdown</Text>
      {domainReadiness.map(domain => (
        <View key={domain.domain} style={styles.domainItem}>
          <View style={styles.domainHeader}>
            <Text style={styles.domainName}>{DOMAIN_INFO[domain.domain].icon} {domain.title}</Text>
            <Text style={styles.domainWeight}>{domain.weight}% of exam</Text>
          </View>
          <View style={styles.domainStats}>
            <Text style={[styles.accuracy, { color: getAccuracyColor(domain.accuracy) }]}>
              {domain.accuracy}% accuracy
            </Text>
            <Text style={styles.coverage}>
              {domain.questionsAnswered}/{domain.totalQuestions} questions
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${domain.accuracy}%`,
                  backgroundColor: getAccuracyColor(domain.accuracy),
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginVertical: 12,
  },
  overallSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  domainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#bbb',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  domainItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  domainWeight: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  domainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accuracy: {
    fontSize: 13,
    fontWeight: '600',
  },
  coverage: {
    fontSize: 12,
    color: '#999',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
