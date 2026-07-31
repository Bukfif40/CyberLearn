import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GameMap } from '../components/GameMap';
import { DPad } from '../components/DPad';
import { DialogueBox } from '../components/DialogueBox';
import { EncounterScreen } from './EncounterScreen';
import { STARTER_ROOM } from '../data/world';
import { Position, NPC, Encounter } from '../types/game';

export const GameScreen: React.FC = () => {
  const room = STARTER_ROOM;
  const [playerPos, setPlayerPos] = useState<Position>(room.playerStart);
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);
  const [dialogueLine, setDialogueLine] = useState(0);
  const [activeEncounter, setActiveEncounter] = useState<Encounter | null>(null);
  const [clearedEncounterIds, setClearedEncounterIds] = useState<Set<string>>(new Set());

  const handleMove = (dx: number, dy: number) => {
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;
    if (room.tiles[ny]?.[nx] !== 'floor') return;

    const npc = room.npcs.find(n => n.position.x === nx && n.position.y === ny);
    if (npc) {
      setActiveNpc(npc);
      setDialogueLine(0);
      return;
    }

    const encounter = room.encounters.find(e => e.position.x === nx && e.position.y === ny);
    if (encounter) {
      setActiveEncounter(encounter);
      return;
    }

    setPlayerPos({ x: nx, y: ny });
  };

  const advanceDialogue = () => {
    if (!activeNpc) return;
    if (dialogueLine < activeNpc.lines.length - 1) {
      setDialogueLine(l => l + 1);
    } else {
      setActiveNpc(null);
    }
  };

  const finishEncounter = (cleared: boolean) => {
    if (cleared && activeEncounter) {
      setClearedEncounterIds(prev => new Set(prev).add(activeEncounter.id));
    }
    setActiveEncounter(null);
  };

  if (activeEncounter) {
    return <EncounterScreen encounter={activeEncounter} onFinish={finishEncounter} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomName}>{room.name}</Text>
      </View>

      <View style={styles.mapArea}>
        <GameMap room={room} playerPos={playerPos} clearedEncounterIds={clearedEncounterIds} />
      </View>

      <View style={styles.controls}>
        <DPad onMove={handleMove} disabled={!!activeNpc} />
      </View>

      {activeNpc && (
        <DialogueBox
          speakerName={activeNpc.name}
          speakerEmoji={activeNpc.emoji}
          line={activeNpc.lines[dialogueLine]}
          isLastLine={dialogueLine === activeNpc.lines.length - 1}
          onAdvance={advanceDialogue}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  roomName: {
    color: '#9298A8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: 28,
  },
});
