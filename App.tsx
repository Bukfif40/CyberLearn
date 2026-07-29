import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './screens/HomeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { FlashcardsScreen } from './screens/FlashcardsScreen';
import { PracticeExamScreen } from './screens/PracticeExamScreen';

type Screen = 'home' | 'quiz' | 'mistakes' | 'flashcards' | 'exam';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const goHome = () => setCurrentScreen('home');

  if (currentScreen === 'quiz') {
    return (
      <>
        <QuizScreen onBack={goHome} mode="adaptive" />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'mistakes') {
    return (
      <>
        <QuizScreen onBack={goHome} mode="mistakes" />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'flashcards') {
    return (
      <>
        <FlashcardsScreen onBack={goHome} />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'exam') {
    return (
      <>
        <PracticeExamScreen onBack={goHome} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <HomeScreen
        onQuizPress={() => setCurrentScreen('quiz')}
        onMistakesPress={() => setCurrentScreen('mistakes')}
        onFlashcardsPress={() => setCurrentScreen('flashcards')}
        onExamPress={() => setCurrentScreen('exam')}
      />
      <StatusBar style="light" />
    </>
  );
}
