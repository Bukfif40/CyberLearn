import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StudyTimerService } from '../services/studyTimer';

interface StudyTimerProps {
  roadmapId?: string;
  onSessionComplete?: (duration: number) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ roadmapId = '', onSessionComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    checkActiveSession();
    const interval = setInterval(() => {
      if (isActive && sessionId) {
        updateDuration();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, sessionId]);

  const checkActiveSession = async () => {
    const activeSession = await StudyTimerService.getActiveSession();
    if (activeSession) {
      setIsActive(true);
      setSessionId(activeSession.id);
    }
  };

  const updateDuration = async () => {
    if (sessionId) {
      const currentDuration = await StudyTimerService.getSessionDuration(sessionId);
      setDuration(currentDuration);
    }
  };

  const handleStart = async () => {
    const newSessionId = await StudyTimerService.startSession();
    setSessionId(newSessionId);
    setIsActive(true);
  };

  const handleStop = async () => {
    if (sessionId) {
      await StudyTimerService.endSession(sessionId);
      setIsActive(false);
      setSessionId(null);
      onSessionComplete?.(duration);
      setDuration(0);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Study Time</Text>
      <Text style={styles.duration}>{formatTime(duration)}</Text>
      <TouchableOpacity
        style={[styles.button, isActive ? styles.stopButton : styles.startButton]}
        onPress={isActive ? handleStop : handleStart}
      >
        <Text style={styles.buttonText}>
          {isActive ? '⏹ Stop' : '▶ Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  duration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4ade80',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
