import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Roadmap } from '../types';

interface RoadmapCardProps {
  roadmap: Roadmap;
  onPress: () => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Image source={{ uri: roadmap.owner.avatar_url }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{roadmap.name}</Text>
          <Text style={styles.owner}>by {roadmap.owner.login}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {roadmap.description || 'No description available'}
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>⭐ {roadmap.stars.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Stars</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>🍴 {roadmap.forks.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Forks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>📅 {formatDate(roadmap.updated_at)}</Text>
          <Text style={styles.statLabel}>Updated</Text>
        </View>
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
    borderWidth: 1,
    borderColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 2,
  },
  owner: {
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
    color: '#0f3460',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
});
