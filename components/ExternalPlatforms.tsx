import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, Alert } from 'react-native';
import { ExternalPlatform, PlatformProgress } from '../types';
import { PlatformIntegrationService } from '../services/platformIntegration';

interface ExternalPlatformsProps {
  careerPath?: string;
}

export const ExternalPlatforms: React.FC<ExternalPlatformsProps> = ({ careerPath }) => {
  const [platforms, setPlatforms] = useState<ExternalPlatform[]>([]);
  const [progress, setProgress] = useState<PlatformProgress[]>([]);
  const [showConnect, setShowConnect] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [completedRooms, setCompletedRooms] = useState('');

  useEffect(() => {
    loadPlatforms();
    loadProgress();
  }, [careerPath]);

  const loadPlatforms = () => {
    if (careerPath) {
      setPlatforms(PlatformIntegrationService.getRecommendedPlatforms(careerPath));
    } else {
      setPlatforms(PlatformIntegrationService.getPlatforms());
    }
  };

  const loadProgress = async () => {
    const loadedProgress = await PlatformIntegrationService.getPlatformProgress();
    setProgress(loadedProgress);
  };

  const handleConnect = async (platformId: string) => {
    if (!username || !completedRooms) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const platformProgress: PlatformProgress = {
      platformId,
      username,
      completedRooms: parseInt(completedRooms),
      totalRooms: 100, // Default, would be fetched from API
      rank: 'Beginner',
      lastUpdated: new Date().toISOString(),
    };

    await PlatformIntegrationService.savePlatformProgress(platformProgress);
    setShowConnect(null);
    setUsername('');
    setCompletedRooms('');
    loadProgress();
    Alert.alert('Success', 'Platform connected successfully!');
  };

  const handleDisconnect = async (platformId: string) => {
    await PlatformIntegrationService.deletePlatformProgress(platformId);
    loadProgress();
    Alert.alert('Success', 'Platform disconnected');
  };

  const getPlatformProgress = (platformId: string) => {
    return progress.find(p => p.platformId === platformId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learning Platforms</Text>
      <Text style={styles.subtitle}>
        {careerPath ? 'Recommended for your career path' : 'Connect your accounts'}
      </Text>

      <ScrollView style={styles.platformsList} showsVerticalScrollIndicator={false}>
        {platforms.map((platform) => {
          const platformProgress = getPlatformProgress(platform.id);
          return (
            <View key={platform.id} style={styles.platformCard}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformIcon}>{platform.icon}</Text>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformDescription} numberOfLines={2}>
                    {platform.description}
                  </Text>
                </View>
              </View>

              {platformProgress ? (
                <View style={styles.connectedView}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Username:</Text>
                    <Text style={styles.progressValue}>{platformProgress.username}</Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Completed:</Text>
                    <Text style={styles.progressValue}>{platformProgress.completedRooms} rooms</Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Rank:</Text>
                    <Text style={styles.progressValue}>{platformProgress.rank}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => handleDisconnect(platform.id)}
                  >
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.notConnectedView}>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => setShowConnect(platform.id)}
                  >
                    <Text style={styles.connectButtonText}>Connect Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.visitButton}
                    onPress={() => Linking.openURL(platform.url)}
                  >
                    <Text style={styles.visitButtonText}>Visit {platform.name}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showConnect === platform.id && (
                <View style={styles.connectForm}>
                  <Text style={styles.formTitle}>Connect {platform.name}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#666"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Completed rooms"
                    value={completedRooms}
                    onChangeText={setCompletedRooms}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowConnect(null);
                        setUsername('');
                        setCompletedRooms('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleConnect(platform.id)}
                    >
                      <Text style={styles.saveButtonText}>Connect</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.features}>
                {platform.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  platformsList: {
    maxHeight: 400,
  },
  platformCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  platformHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  platformIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  connectedView: {
    backgroundColor: '#0f3460',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ade80',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notConnectedView: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#4ade80',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  visitButton: {
    flex: 1,
    backgroundColor: '#0f3460',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  visitButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  connectForm: {
    backgroundColor: '#0f3460',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 6,
    padding: 10,
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#e94560',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: '#e9456020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#e94560',
  },
});
