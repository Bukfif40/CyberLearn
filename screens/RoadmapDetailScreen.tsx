import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { Roadmap, LearningProgress } from '../types';
import { GitHubApiService } from '../services/githubApi';
import { StorageService } from '../services/storage';
import { StudyTimerService } from '../services/studyTimer';
import { StandardsBadge } from '../components/StandardsBadge';
import { StudyTimer } from '../components/StudyTimer';

interface RoadmapDetailScreenProps {
  roadmap: Roadmap;
  onBack: () => void;
}

export const RoadmapDetailScreen: React.FC<RoadmapDetailScreenProps> = ({ roadmap, onBack }) => {
  const [standards, setStandards] = useState<any>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const githubApi = new GitHubApiService();

  useEffect(() => {
    loadRoadmapDetails();
    loadUserProgress();
  }, []);

  const loadRoadmapDetails = async () => {
    setLoading(true);
    try {
      const readmeContent = await githubApi.getReadme(roadmap.full_name);
      setReadme(readmeContent);
      
      if (readmeContent) {
        const standardsData = githubApi.evaluateIndustryStandards(readmeContent);
        setStandards(standardsData);
      }

      // Check if favorite
      const fav = await StorageService.isFavorite(roadmap.id);
      setIsFavorite(fav);
    } catch (error) {
      console.error('Error loading roadmap details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progress = await StorageService.getLearningProgress(roadmap.id);
      if (progress) {
        setLearningProgress(progress);
        setNotes(progress.notes || '');
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const handleOpenRepo = () => {
    Linking.openURL(roadmap.html_url).catch((err) => {
      Alert.alert('Error', 'Could not open repository URL');
    });
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await StorageService.removeFavorite(roadmap.id);
        setIsFavorite(false);
        Alert.alert('Removed from favorites');
      } else {
        await StorageService.addFavorite(roadmap.id);
        setIsFavorite(true);
        Alert.alert('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleSaveNotes = async () => {
    try {
      if (!learningProgress) {
        const newProgress: LearningProgress = {
          roadmapId: roadmap.id,
          completedTopics: [],
          currentTopic: null,
          startedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          notes: notes,
        };
        await StorageService.saveLearningProgress(newProgress);
        setLearningProgress(newProgress);
      } else {
        await StorageService.updateNotes(roadmap.id, notes);
        learningProgress.notes = notes;
      }
      Alert.alert('Success', 'Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const handleStartLearning = async () => {
    try {
      if (!learningProgress) {
        const newProgress: LearningProgress = {
          roadmapId: roadmap.id,
          completedTopics: [],
          currentTopic: 'Getting Started',
          startedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          notes: '',
        };
        await StorageService.saveLearningProgress(newProgress);
        setLearningProgress(newProgress);
        Alert.alert('Started Learning', 'Your progress has been saved');
      }
    } catch (error) {
      console.error('Error starting learning:', error);
      Alert.alert('Error', 'Failed to start learning');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Loading roadmap details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{roadmap.name}</Text>
          <Text style={styles.owner}>by {roadmap.owner.login}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {roadmap.stars.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>🍴 {roadmap.forks.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Forks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>📅</Text>
            <Text style={styles.statLabel}>{formatDate(roadmap.updated_at)}</Text>
          </View>
        </View>

        {roadmap.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{roadmap.description}</Text>
          </View>
        )}

        {standards && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Industry Standards Analysis</Text>
            <StandardsBadge standards={standards} />
          </View>
        )}

        {readme && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>README Preview</Text>
            <Text style={styles.readme}>
              {readme.length > 500 ? readme.substring(0, 500) + '...' : readme}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.openButton} onPress={handleOpenRepo}>
          <Text style={styles.openButtonText}>Open on GitHub</Text>
        </TouchableOpacity>

        {!learningProgress && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartLearning}>
            <Text style={styles.startButtonText}>Start Learning Track</Text>
          </TouchableOpacity>
        )}

        {learningProgress && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressText}>
              Started: {new Date(learningProgress.startedAt).toLocaleDateString()}
            </Text>
            <Text style={styles.progressText}>
              Topics Completed: {learningProgress.completedTopics.length}
            </Text>
          </View>
        )}

        <StudyTimer
          roadmapId={roadmap.id}
          onSessionComplete={(duration) => {
            Alert.alert('Study Session Complete', `You studied for ${duration} minutes!`);
          }}
        />

        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => setShowNotes(!showNotes)}
        >
          <Text style={styles.notesButtonText}>
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Text>
        </TouchableOpacity>

        {showNotes && (
          <View style={styles.notesSection}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add your learning notes here..."
              placeholderTextColor="#a0a0a0"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveNotesButton} onPress={handleSaveNotes}>
              <Text style={styles.saveNotesButtonText}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteButtonText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#a0a0a0',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  owner: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f3460',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#d0d0d0',
    lineHeight: 24,
  },
  readme: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  openButton: {
    backgroundColor: '#e94560',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
  startButton: {
    backgroundColor: '#4ade80',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    backgroundColor: '#0f3460',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  notesButton: {
    backgroundColor: '#0f3460',
    margin: 20,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notesSection: {
    margin: 20,
    marginTop: 0,
  },
  notesInput: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    minHeight: 120,
    marginBottom: 12,
  },
  saveNotesButton: {
    backgroundColor: '#e94560',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveNotesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
