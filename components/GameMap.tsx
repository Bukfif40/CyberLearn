import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomMap, Position } from '../types/game';

interface Props {
  room: RoomMap;
  playerPos: Position;
  clearedEncounterIds: Set<string>;
}

export const TILE_SIZE = 34;

// Colored badges instead of emoji: renders identically across every
// platform/font (some ZWJ-sequence emoji like the player's silently fail to
// render in certain environments), and doubles as a placeholder "sprite"
// look until real character art exists.
const Badge: React.FC<{ label: string; background: string; color?: string }> = ({
  label,
  background,
  color = '#0B0D12',
}) => (
  <View style={[badgeStyles.badge, { backgroundColor: background }]}>
    <Text style={[badgeStyles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const GameMap: React.FC<Props> = ({ room, playerPos, clearedEncounterIds }) => {
  return (
    <View style={styles.mapWrap}>
      {room.tiles.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((tile, x) => {
            const npc = room.npcs.find(n => n.position.x === x && n.position.y === y);
            const encounter = room.encounters.find(e => e.position.x === x && e.position.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const cleared = encounter ? clearedEncounterIds.has(encounter.id) : false;

            return (
              <View
                key={x}
                style={[styles.tile, tile === 'wall' ? styles.wallTile : styles.floorTile]}
              >
                {!isPlayer && npc && <Badge label="N" background="#F59E0B" />}
                {!isPlayer && encounter && (
                  <Badge label={cleared ? '✓' : '!'} background={cleared ? '#10B981' : '#EF4444'} color="#FFFFFF" />
                )}
                {isPlayer && <Badge label="P" background="#6C5CE7" color="#FFFFFF" />}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {
    borderWidth: 2,
    borderColor: '#3A3F4B',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorTile: {
    backgroundColor: '#1E2430',
    borderWidth: 0.5,
    borderColor: '#262C3A',
  },
  wallTile: {
    backgroundColor: '#0B0D12',
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
