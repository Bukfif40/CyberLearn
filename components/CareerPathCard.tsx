import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CareerPathData } from '../types';

interface CareerPathCardProps {
  path: CareerPathData;
  onPress: () => void;
  isSelected?: boolean;
}

export const CareerPathCard: React.FC<CareerPathCardProps> = ({ path, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: isSelected ? path.color : '#16213e' },
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{path.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{path.title}</Text>
          <Text style={styles.duration}>{path.duration}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {path.description}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{path.salaryRange}</Text>
          <Text style={styles.statLabel}>Salary Range</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{path.certifications.length}</Text>
          <Text style={styles.statLabel}>Certifications</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {path.keySkills.slice(0, 3).map((skill, index) => (
          <View key={index} style={[styles.skillTag, { backgroundColor: path.color + '20' }]}>
            <Text style={[styles.skillText, { color: path.color }]}>{skill}</Text>
          </View>
        ))}
        {path.keySkills.length > 3 && (
          <Text style={styles.moreSkills}>+{path.keySkills.length - 3} more</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#16213e',
  },
  selectedCard: {
    backgroundColor: '#1a1a2e',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  description: {
    fontSize: 14,
    color: '#d0d0d0',
    marginBottom: 12,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreSkills: {
    fontSize: 11,
    color: '#a0a0a0',
    marginLeft: 4,
  },
});
