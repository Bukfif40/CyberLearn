import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Item } from '../types/game';

interface Props {
  vendorName: string;
  items: Item[];
  credits: number;
  ownedItemIds: Set<string>;
  onBuy: (item: Item) => void;
  onClose: () => void;
}

export const StoreScreen: React.FC<Props> = ({ vendorName, items, credits, ownedItemIds, onBuy, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{vendorName}'s Stall</Text>
        <Text style={styles.credits}>◈ {credits}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.map(item => {
          const owned = ownedItemIds.has(item.id);
          const canAfford = credits >= item.price;
          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemBadge, { backgroundColor: item.badgeColor }]}>
                <Text style={styles.itemBadgeText}>{item.badgeLabel}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <TouchableOpacity
                  style={[styles.buyButton, (owned || !canAfford) && styles.buyButtonDisabled]}
                  onPress={() => onBuy(item)}
                  disabled={owned || !canAfford}
                  accessibilityRole="button"
                  accessibilityLabel={owned ? `${item.name} already owned` : `Buy ${item.name} for ${item.price} credits`}
                >
                  <Text style={styles.buyButtonText}>
                    {owned ? 'Owned' : canAfford ? `Buy — ◈ ${item.price}` : `◈ ${item.price} (not enough)`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Leave store">
        <Text style={styles.closeButtonText}>Leave</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#12151C',
    borderBottomWidth: 2,
    borderBottomColor: '#3A3F4B',
  },
  title: {
    color: '#F5F6FA',
    fontSize: 18,
    fontWeight: '700',
  },
  credits: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1D27',
    borderWidth: 1,
    borderColor: '#2A2E3A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  itemBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemBadgeText: {
    color: '#0B0D12',
    fontWeight: '800',
    fontSize: 13,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#F5F6FA',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#9298A8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#2A2E3A',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    padding: 18,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#3A3F4B',
    backgroundColor: '#12151C',
  },
  closeButtonText: {
    color: '#9298A8',
    fontSize: 14,
    fontWeight: '700',
  },
});
