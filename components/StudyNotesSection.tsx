import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DOMAIN_INFO, SecurityDomain } from '../types';
import { STUDY_NOTES } from '../data/studyNotes';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';

const DOMAIN_ORDER: SecurityDomain[] = [
  'general_security_concepts',
  'threats_vulnerabilities_mitigations',
  'security_architecture',
  'security_operations',
  'security_program_management',
];

export const StudyNotesSection: React.FC = () => {
  const [expanded, setExpanded] = useState<SecurityDomain | null>(null);

  const toggle = (domain: SecurityDomain) => {
    setExpanded(prev => (prev === domain ? null : domain));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>📓</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Domain Study Notes</Text>
          <Text style={styles.freeTag}>Free</Text>
        </View>
      </View>
      <Text style={styles.description}>
        Concise, in-app notes for each Security+ domain — tap a domain to expand it.
      </Text>

      {DOMAIN_ORDER.map(domain => {
        const info = DOMAIN_INFO[domain];
        const isOpen = expanded === domain;
        return (
          <View key={domain} style={styles.domainBlock}>
            <TouchableOpacity
              style={styles.domainRow}
              onPress={() => toggle(domain)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              accessibilityLabel={`${isOpen ? 'Collapse' : 'Expand'} notes for ${info.title}`}
            >
              <Text style={styles.domainIcon}>{info.icon}</Text>
              <Text style={styles.domainTitle}>{info.title}</Text>
              <Text style={styles.domainWeight}>{info.weight}%</Text>
              <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
            </TouchableOpacity>
            {isOpen && (
              <Text style={styles.noteText}>{STUDY_NOTES[domain]}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 22,
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
    flex: 1,
  },
  freeTag: {
    backgroundColor: 'rgba(0, 217, 232, 0.15)',
    color: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.sans,
    lineHeight: 17,
  },
  domainBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  domainTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
  },
  domainWeight: {
    fontSize: 12,
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    marginRight: SPACING.sm,
  },
  chevron: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 14,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans,
    lineHeight: 20,
    marginTop: SPACING.sm,
    paddingLeft: SPACING.lg + 8,
  },
});
