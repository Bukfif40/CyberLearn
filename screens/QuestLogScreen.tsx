import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Quest } from '../types/game';

interface Props {
  activeQuests: Quest[];
  completedQuests: Quest[];
  completedObjectiveIds: Set<string>;
  onClose: () => void;
}

const objectiveKey = (questId: string, objectiveId: string) => `${questId}:${objectiveId}`;

export const QuestLogScreen: React.FC<Props> = ({ activeQuests, completedQuests, completedObjectiveIds, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quest Log</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>ACTIVE</Text>
        {activeQuests.length === 0 && <Text style={styles.emptyText}>No active quests yet.</Text>}
        {activeQuests.map(quest => (
          <View key={quest.id} style={styles.questCard}>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questDescription}>{quest.description}</Text>
            {quest.objectives.map(obj => {
              const done = completedObjectiveIds.has(objectiveKey(quest.id, obj.id));
              return (
                <Text key={obj.id} style={[styles.objective, done && styles.objectiveDone]}>
                  {done ? '☑' : '☐'} {obj.description}
                </Text>
              );
            })}
            <Text style={styles.reward}>Reward: ◈ {quest.creditReward}</Text>
          </View>
        ))}

        {completedQuests.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>COMPLETED</Text>
            {completedQuests.map(quest => (
              <View key={quest.id} style={[styles.questCard, styles.questCardDone]}>
                <Text style={styles.questTitle}>✓ {quest.title}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close quest log">
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  header: {
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#12151C',
    borderBottomWidth: 2,
    borderBottomColor: '#3A3F4B',
  },
  title: {
    color: '#F5F6FA',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    color: '#9298A8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: '#1A1D27',
    borderWidth: 1,
    borderColor: '#2A2E3A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  questCardDone: {
    opacity: 0.6,
  },
  questTitle: {
    color: '#F5F6FA',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  questDescription: {
    color: '#9298A8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  objective: {
    color: '#E6E8EF',
    fontSize: 14,
    marginBottom: 4,
  },
  objectiveDone: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  reward: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  closeButton: {
    padding: 18,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#3A3F4B',
    backgroundColor: '#12151C',
  },
  closeButtonText: {
    color: '#9298A8',
    fontSize: 14,
    fontWeight: '700',
  },
});
