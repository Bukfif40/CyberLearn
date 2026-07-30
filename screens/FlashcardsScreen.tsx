import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FlashCard } from '../components/FlashCard';
import { PixelButton } from '../components/retro/PixelButton';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { DOMAIN_INFO, SecurityDomain } from '../types';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

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
        <PixelButton
          style={styles.navButton}
          variant="secondary"
          onPress={handlePrevious}
          disabled={cards.length === 0}
          accessibilityLabel="Previous flashcard"
          title="Previous"
        />
        <PixelButton
          style={styles.navButton}
          onPress={handleNext}
          disabled={cards.length === 0}
          accessibilityLabel="Next flashcard"
          title="Next"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 40,
    backgroundColor: COLORS.surface,
    borderBottomWidth: PIXEL_BORDER,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: FONTS.pixelDisplay,
  },
  headerTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelDisplay,
  },
  shuffleButton: {
    padding: SPACING.sm,
    width: 50,
    alignItems: 'flex-end',
  },
  shuffleButtonText: {
    fontSize: 18,
  },
  filterBar: {
    flexGrow: 0,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBarContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.none,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
  },
  filterChipTextActive: {
    color: COLORS.textOnAccent,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  progress: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: PIXEL_BORDER,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  navButton: {
    flex: 1,
  },
});
