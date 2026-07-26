import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IndustryStandards } from '../types';

interface StandardsBadgeProps {
  standards: IndustryStandards;
}

export const StandardsBadge: React.FC<StandardsBadgeProps> = ({ standards }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80'; // green
    if (score >= 60) return '#fbbf24'; // yellow
    if (score >= 40) return '#fb923c'; // orange
    return '#f87171'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const criteria = standards.criteria;
  
  const highlights = [];
  
  if (criteria.certifications.comptia) highlights.push('CompTIA');
  if (criteria.certifications.cissp) highlights.push('CISSP');
  if (criteria.certifications.oscp) highlights.push('OSCP');
  if (criteria.frameworks.nist) highlights.push('NIST');
  if (criteria.frameworks.mitre) highlights.push('MITRE');
  if (criteria.hands_on.tryhackme) highlights.push('TryHackMe');
  if (criteria.hands_on.hackthebox) highlights.push('HackTheBox');

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(standards.score) }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(standards.score) }]}>
            {Math.round(standards.score)}%
          </Text>
        </View>
        <Text style={[styles.scoreLabel, { color: getScoreColor(standards.score) }]}>
          {getScoreLabel(standards.score)}
        </Text>
      </View>
      
      {highlights.length > 0 && (
        <View style={styles.highlights}>
          <Text style={styles.highlightsTitle}>Industry Standards:</Text>
          <View style={styles.highlightTags}>
            {highlights.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  highlights: {
    marginTop: 8,
  },
  highlightsTitle: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 6,
  },
  highlightTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e94560',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});
