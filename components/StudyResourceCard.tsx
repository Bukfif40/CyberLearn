import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { StudyResource } from '../types';

interface Props {
  resource: StudyResource;
}

export const StudyResourceCard: React.FC<Props> = ({ resource }) => {
  const getResourceIcon = (type: string): string => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'reading':
        return '📚';
      case 'official':
        return '🏛️';
      case 'practice_exam':
        return '📝';
      default:
        return '📖';
    }
  };

  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(resource.url);
      if (canOpen) {
        await Linking.openURL(resource.url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getResourceIcon(resource.type)}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{resource.title}</Text>
          {resource.free && <Text style={styles.freeTag}>Free</Text>}
        </View>
      </View>
      <Text style={styles.description}>{resource.description}</Text>
      <Text style={styles.cta}>Tap to open →</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  freeTag: {
    backgroundColor: '#22c55e',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 16,
  },
  cta: {
    fontSize: 11,
    color: '#e94560',
    fontWeight: '600',
  },
});
