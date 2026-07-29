import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './screens/HomeScreen';
import { QuizScreen } from './screens/QuizScreen';

type Screen = 'home' | 'quiz';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  if (currentScreen === 'quiz') {
    return (
      <>
        <QuizScreen onBack={() => setCurrentScreen('home')} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <HomeScreen onQuizPress={() => setCurrentScreen('quiz')} />
      <StatusBar style="light" />
    </>
  );
}
