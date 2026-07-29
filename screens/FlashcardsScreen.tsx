import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FlashCard } from '../components/FlashCard';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { DOMAIN_INFO, SecurityDomain } from '../types';

interface FlashcardsScreenProps {
  onBack: () => void;
}

type DomainFilter = SecurityDomain | 'all';

const shuffle = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ onBack }) => {
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const [order, setOrder] = useState<number[]>(() =>
    shuffle(QUIZ_QUESTIONS.map((_, i) => i))
  );
  const [index, setIndex] = useState(0);

  const filteredQuestions = useMemo(() => {
    if (domainFilter === 'all') return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter(q => q.domain === domainFilter);
  }, [domainFilter]);

  const cards = useMemo(() => {
    const indices = order.filter(i => filteredQuestions.includes(QUIZ_QUESTIONS[i]));
    return indices.length > 0 ? indices.map(i => QUIZ_QUESTIONS[i]) : filteredQuestions;
  }, [order, filteredQuestions]);

  const currentCard = cards[Math.min(index, cards.length - 1)];

  const changeDomain = (domain: DomainFilter) => {
    setDomainFilter(domain);
    setIndex(0);
  };

  const handleShuffle = () => {
    setOrder(shuffle(QUIZ_QUESTIONS.map((_, i) => i)));
    setIndex(0);
  };

  const handleNext = () => {
    setIndex(i => (i + 1 < cards.length ? i + 1 : 0));
  };

  const handlePrevious = () => {
    setIndex(i => (i > 0 ? i - 1 : cards.length - 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <TouchableOpacity onPress={handleShuffle} style={styles.shuffleButton} accessibilityRole="button" accessibilityLabel="Shuffle flashcards">
          <Text style={styles.shuffleButtonText}>🔀</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, domainFilter === 'all' && styles.filterChipActive]}
          onPress={() => changeDomain('all')}
        >
          <Text style={[styles.filterChipText, domainFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {(Object.entries(DOMAIN_INFO) as [SecurityDomain, typeof DOMAIN_INFO[SecurityDomain]][]).map(
          ([domain, info]) => (
            <TouchableOpacity
              key={domain}
              style={[styles.filterChip, domainFilter === domain && styles.filterChipActive]}
              onPress={() => changeDomain(domain)}
            >
              <Text style={[styles.filterChipText, domainFilter === domain && styles.filterChipTextActive]}>
                {info.icon} {info.title}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.progress}>
          {cards.length > 0 ? `${index + 1} / ${cards.length}` : 'No cards in this domain yet'}
        </Text>

        {currentCard && <FlashCard key={currentCard.id} question={currentCard} />}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, cards.length === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={cards.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous flashcard"
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, cards.length === 0 && styles.disabledButton]}
          onPress={handleNext}
          disabled={cards.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Next flashcard"
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shuffleButton: {
    padding: 8,
    width: 50,
    alignItems: 'flex-end',
  },
  shuffleButtonText: {
    fontSize: 18,
  },
  filterBar: {
    flexGrow: 0,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  filterBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#16213e',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#a855f7',
  },
  filterChipText: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  progress: {
    textAlign: 'center',
    color: '#a0a0a0',
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#a855f7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#16213e',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
