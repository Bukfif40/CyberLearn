import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { StudyResource } from '../types';
import { COLORS, FONTS, RADII, SPACING, PIXEL_BORDER } from '../constants/theme';

interface Props {
  resource: StudyResource;
}

export const StudyResourceCard: React.FC<Props> = ({ resource }) => {
  const getResourceIcon = (type: string): string => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'reading':
        return '📚';
      case 'official':
        return '🏛️';
      case 'practice_exam':
        return '📝';
      case 'guide':
        return '🎓';
      default:
        return '📖';
    }
  };

  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(resource.url);
      if (canOpen) {
        await Linking.openURL(resource.url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !resource.free && styles.cardPaid]}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`Open resource: ${resource.title}${resource.free ? '' : ', paid'}`}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getResourceIcon(resource.type)}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{resource.title}</Text>
          {resource.free ? (
            <Text style={styles.freeTag}>Free</Text>
          ) : (
            <Text style={styles.paidTag}>Paid</Text>
          )}
        </View>
      </View>
      <Text style={styles.description}>{resource.description}</Text>
      <Text style={styles.cta}>Tap to open →</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.none,
    borderWidth: PIXEL_BORDER,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: SPACING.sm,
  },
  cardPaid: {
    borderColor: COLORS.warning,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: FONTS.pixelBody,
    flex: 1,
  },
  freeTag: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    color: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.none,
    fontSize: 10,
    fontFamily: FONTS.pixelDisplay,
    overflow: 'hidden',
  },
  paidTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    color: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.none,
    fontSize: 10,
    fontFamily: FONTS.pixelDisplay,
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.pixelBody,
    marginBottom: SPACING.sm,
    lineHeight: 17,
  },
  cta: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.pixelBody,
  },
});
