import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomMap, Position } from '../types/game';

interface Props {
  room: RoomMap;
  playerPos: Position;
  npcPositions: Record<string, Position>;
  vehiclePositions: Record<string, Position>;
  clearedEncounterIds: Set<string>;
}

export const TILE_SIZE = 34;

const Badge: React.FC<{ label: string; background: string; color?: string }> = ({
  label,
  background,
  color = '#0B0D12',
}) => (
  <View style={[badgeStyles.badge, { backgroundColor: background }]}>
    <Text style={[badgeStyles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const GameMap: React.FC<Props> = ({
  room,
  playerPos,
  npcPositions,
  vehiclePositions,
  clearedEncounterIds,
}) => {
  return (
    <View style={styles.mapWrap}>
      {room.tiles.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((tile, x) => {
            const npc = room.npcs.find(n => {
              const pos = npcPositions[n.id];
              return pos && pos.x === x && pos.y === y;
            });
            const vehicle = room.vehicles.find(v => {
              const pos = vehiclePositions[v.id];
              return pos && pos.x === x && pos.y === y;
            });
            const encounter = room.encounters.find(e => e.position.x === x && e.position.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const cleared = encounter ? clearedEncounterIds.has(encounter.id) : false;

            const tileStyle =
              tile === 'wall' ? styles.wallTile : tile === 'road' ? styles.roadTile : styles.floorTile;

            return (
              <View key={x} style={[styles.tile, tileStyle]}>
                {!isPlayer && npc && <Badge label={npc.badgeLabel} background={npc.badgeColor} />}
                {!isPlayer && !npc && vehicle && (
                  <Badge label={vehicle.badgeLabel} background={vehicle.badgeColor} color="#0B0D12" />
                )}
                {!isPlayer && !npc && !vehicle && encounter && (
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
  roadTile: {
    backgroundColor: '#14171F',
    borderWidth: 0.5,
    borderColor: '#20242E',
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
