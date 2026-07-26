import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { RoadmapDetailScreen } from './screens/RoadmapDetailScreen';
import { QuizScreen } from './screens/QuizScreen';
import { Roadmap } from './types';

type Screen = 'home' | 'detail' | 'quiz';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

  if (currentScreen === 'detail' && selectedRoadmap) {
    return (
      <>
        <RoadmapDetailScreen
          roadmap={selectedRoadmap}
          onBack={() => {
            setSelectedRoadmap(null);
            setCurrentScreen('home');
          }}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'quiz') {
    return (
      <>
        <QuizScreen
          onBack={() => setCurrentScreen('home')}
          quizType="mixed"
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <HomeScreen
        onRoadmapPress={(roadmap) => {
          setSelectedRoadmap(roadmap);
          setCurrentScreen('detail');
        }}
        onQuizPress={() => setCurrentScreen('quiz')}
      />
      <StatusBar style="light" />
    </>
  );
}
