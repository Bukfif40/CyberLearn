import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { HomeScreen } from './screens/HomeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { FlashcardsScreen } from './screens/FlashcardsScreen';
import { PracticeExamScreen } from './screens/PracticeExamScreen';
import { LearningModulesScreen } from './screens/LearningModulesScreen';
import { ModuleDetailScreen } from './screens/ModuleDetailScreen';
import { LessonScreen } from './screens/LessonScreen';
import { LearningModuleService } from './services/learningModules';
import { SecurityDomain } from './types';

type Route =
  | { name: 'home' }
  | { name: 'quiz'; mode: 'adaptive' }
  | { name: 'mistakes' }
  | { name: 'flashcards' }
  | { name: 'exam' }
  | { name: 'modules' }
  | { name: 'moduleDetail'; moduleId: string }
  | { name: 'lesson'; moduleId: string; lessonId: string }
  | { name: 'bossBattle'; moduleId: string; domain: SecurityDomain };

export default function App() {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const [fontsLoaded, fontError] = useFonts({ PressStart2P_400Regular, VT323_400Regular });

  const current = stack[stack.length - 1];
  const push = (route: Route) => setStack(s => [...s, route]);
  const pop = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderScreen = () => {
    switch (current.name) {
      case 'quiz':
        return <QuizScreen onBack={pop} mode="adaptive" />;
      case 'mistakes':
        return <QuizScreen onBack={pop} mode="mistakes" />;
      case 'flashcards':
        return <FlashcardsScreen onBack={pop} />;
      case 'exam':
        return <PracticeExamScreen onBack={pop} />;
      case 'modules':
        return (
          <LearningModulesScreen
            onBack={pop}
            onSelectModule={moduleId => push({ name: 'moduleDetail', moduleId })}
          />
        );
      case 'moduleDetail':
        return (
          <ModuleDetailScreen
            moduleId={current.moduleId}
            onBack={pop}
            onSelectLesson={lessonId => push({ name: 'lesson', moduleId: current.moduleId, lessonId })}
            onStartBossBattle={domain => push({ name: 'bossBattle', moduleId: current.moduleId, domain })}
          />
        );
      case 'lesson':
        return (
          <LessonScreen
            moduleId={current.moduleId}
            lessonId={current.lessonId}
            onBack={pop}
            onComplete={pop}
          />
        );
      case 'bossBattle':
        return (
          <QuizScreen
            onBack={pop}
            mode="domain"
            domain={current.domain}
            count={15}
            onComplete={result => LearningModuleService.recordBossBattleResult(current.moduleId, result.score)}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onQuizPress={() => push({ name: 'quiz', mode: 'adaptive' })}
            onMistakesPress={() => push({ name: 'mistakes' })}
            onFlashcardsPress={() => push({ name: 'flashcards' })}
            onExamPress={() => push({ name: 'exam' })}
            onModulesPress={() => push({ name: 'modules' })}
          />
        );
      default: {
        const exhaustive: never = current;
        throw new Error(`Unhandled route: ${JSON.stringify(exhaustive)}`);
      }
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="light" />
    </>
  );
}
