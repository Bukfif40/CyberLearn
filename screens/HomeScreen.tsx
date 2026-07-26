import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RoadmapCard } from '../components/RoadmapCard';
import { GamificationBar } from '../components/GamificationBar';
import { CareerPathCard } from '../components/CareerPathCard';
import { StudyGoals } from '../components/StudyGoals';
import { ExternalPlatforms } from '../components/ExternalPlatforms';
import { StatsDashboard } from '../components/StatsDashboard';
import { GitHubApiService } from '../services/githubApi';
import { StorageService } from '../services/storage';
import { GamificationService } from '../services/gamification';
import { CAREER_PATHS } from '../data/careerPaths';
import { Roadmap, GamificationData, CareerPath } from '../types';

interface HomeScreenProps {
  onRoadmapPress?: (roadmap: Roadmap) => void;
  onQuizPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRoadmapPress, onQuizPress }) => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [minStars, setMinStars] = useState('200');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPath | null>(null);
  const [showCareerPaths, setShowCareerPaths] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const githubApi = new GitHubApiService();

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      if (githubToken) {
        githubApi.setToken(githubToken);
      }
      
      const minStarsValue = minStars === '' ? 200 : parseInt(minStars, 10);
      let query = `cybersecurity roadmap stars:>=${minStarsValue}`;
      
      // Add career path keywords if selected
      if (selectedCareerPath) {
        const careerPath = CAREER_PATHS.find(p => p.id === selectedCareerPath);
        if (careerPath) {
          const keywords = careerPath.searchKeywords.join(' OR ');
          query += ` (${keywords})`;
        }
      }
      
      const data = await githubApi.searchRoadmaps(minStarsValue, 365, query);
      setRoadmaps(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load roadmaps. Please check your connection and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadRoadmaps();
  }, []);

  const loadUserData = async () => {
    try {
      const preferences = await StorageService.getUserPreferences();
      if (preferences?.githubToken) {
        setGithubToken(preferences.githubToken);
        githubApi.setToken(preferences.githubToken);
      }
      const favs = await StorageService.getFavorites();
      setFavorites(favs);
      
      // Load gamification data
      const gameData = await GamificationService.getGamificationData();
      setGamificationData(gameData);
      
      // Update streak
      await GamificationService.updateStreak();
      const updatedData = await GamificationService.getGamificationData();
      setGamificationData(updatedData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSearch = () => {
    loadRoadmaps();
  };

  const handleTokenSave = async () => {
    if (githubToken) {
      await StorageService.updateGithubToken(githubToken);
      githubApi.setToken(githubToken);
      Alert.alert('Success', 'GitHub token saved successfully');
      setShowTokenInput(false);
    }
  };

  const handleRoadmapPress = async (roadmap: Roadmap) => {
    // Award XP for viewing roadmap
    await GamificationService.addXP(10);
    await GamificationService.logViewedRoadmap(roadmap.id);
    
    // Update gamification data
    const updatedData = await GamificationService.getGamificationData();
    setGamificationData(updatedData);
    
    if (onRoadmapPress) {
      onRoadmapPress(roadmap);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CyberLearn</Text>
        <Text style={styles.subtitle}>Your Cybersecurity Learning Journey</Text>
      </View>

      {gamificationData && (
        <GamificationBar
          xp={gamificationData.xp}
          level={gamificationData.level}
          streak={gamificationData.streak}
        />
      )}

      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => setShowStats(!showStats)}
      >
        <Text style={styles.statsButtonText}>📊 {showStats ? 'Hide' : 'Show'} Statistics</Text>
      </TouchableOpacity>

      {/* Temporarily disabled for debugging */}
      {/* {showStats && <StatsDashboard />} */}

      <TouchableOpacity
        style={styles.careerPathButton}
        onPress={() => setShowCareerPaths(!showCareerPaths)}
      >
        <Text style={styles.careerPathButtonText}>
          {selectedCareerPath 
            ? `🎯 ${CAREER_PATHS.find(p => p.id === selectedCareerPath)?.title}` 
            : '🎯 Choose Your Career Path'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => onQuizPress && onQuizPress()}
      >
        <Text style={styles.quizButtonText}>🧠 Test Your Knowledge</Text>
      </TouchableOpacity>

      {/* Temporarily disabled for debugging */}
      {/* <StudyGoals /> */}
      {/* <ExternalPlatforms careerPath={selectedCareerPath || undefined} /> */}

      {showCareerPaths && (
        <View style={styles.careerPathsContainer}>
          <Text style={styles.careerPathsTitle}>Select Your Career Path</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CAREER_PATHS.map((path) => (
              <CareerPathCard
                key={path.id}
                path={path}
                onPress={() => {
                  setSelectedCareerPath(path.id);
                  setShowCareerPaths(false);
                  loadRoadmaps();
                }}
                isSelected={selectedCareerPath === path.id}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.searchSection}>
        <TouchableOpacity
          style={styles.tokenButton}
          onPress={() => setShowTokenInput(!showTokenInput)}
        >
          <Text style={styles.tokenButtonText}>
            {githubToken ? '✓ Token Set' : '+ Add GitHub Token'}
          </Text>
        </TouchableOpacity>

        {showTokenInput && (
          <>
            <TextInput
              style={styles.tokenInput}
              placeholder="Enter GitHub Token (optional)"
              placeholderTextColor="#a0a0a0"
              value={githubToken}
              onChangeText={setGithubToken}
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveTokenButton} onPress={handleTokenSave}>
              <Text style={styles.saveTokenButtonText}>Save Token</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.filters}>
          <TextInput
            style={styles.filterInput}
            placeholder="Min Stars"
            placeholderTextColor="#a0a0a0"
            value={minStars}
            onChangeText={setMinStars}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Loading roadmaps...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.resultsHeader}>
            Found {roadmaps.length} Roadmaps
          </Text>
          {roadmaps.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onPress={() => handleRoadmapPress(roadmap)}
            />
          ))}
          {roadmaps.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No roadmaps found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 4,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  tokenButton: {
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tokenInput: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    marginBottom: 8,
  },
  saveTokenButton: {
    backgroundColor: '#4ade80',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveTokenButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
  },
  searchButton: {
    backgroundColor: '#e94560',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  resultsHeader: {
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  careerPathButton: {
    backgroundColor: '#0f3460',
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  careerPathButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizButton: {
    backgroundColor: '#a855f7',
    margin: 16,
    marginTop: 0,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  careerPathsContainer: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  careerPathsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsButton: {
    backgroundColor: '#60a5fa',
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
