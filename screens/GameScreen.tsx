import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { GameMap } from '../components/GameMap';
import { DPad } from '../components/DPad';
import { DialogueBox } from '../components/DialogueBox';
import { EncounterScreen } from './EncounterScreen';
import { StoreScreen } from './StoreScreen';
import { QuestLogScreen } from './QuestLogScreen';
import { STARTER_ROOM } from '../data/world';
import { ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { Position, NPC, Encounter, Item } from '../types/game';

const TICK_MS = 1000;

interface PatrolRuntime {
  position: Position;
  pathIndex: number;
  direction: 1 | -1;
}

const initPatrolState = (start: Position): PatrolRuntime => ({
  position: start,
  pathIndex: 0,
  direction: 1,
});

const stepPatrol = (current: PatrolRuntime, path: Position[]): PatrolRuntime => {
  if (path.length <= 1) return current;
  let nextIndex = current.pathIndex + current.direction;
  let direction = current.direction;
  if (nextIndex >= path.length) {
    nextIndex = path.length - 2;
    direction = -1;
  } else if (nextIndex < 0) {
    nextIndex = 1;
    direction = 1;
  }
  return { position: path[nextIndex], pathIndex: nextIndex, direction };
};

const posKey = (p: Position) => `${p.x},${p.y}`;
const objectiveKey = (questId: string, objectiveId: string) => `${questId}:${objectiveId}`;

export const GameScreen: React.FC = () => {
  const room = STARTER_ROOM;

  const [playerPos, setPlayerPos] = useState<Position>(room.playerStart);
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);
  const [dialogueLine, setDialogueLine] = useState(0);
  const [activeEncounter, setActiveEncounter] = useState<Encounter | null>(null);
  const [clearedEncounterIds, setClearedEncounterIds] = useState<Set<string>>(new Set());
  const [activeStoreNpc, setActiveStoreNpc] = useState<NPC | null>(null);
  const [showQuestLog, setShowQuestLog] = useState(false);

  const [credits, setCredits] = useState(20);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set());
  const [activeQuestIds, setActiveQuestIds] = useState<Set<string>>(new Set());
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set());
  const [completedObjectiveIds, setCompletedObjectiveIds] = useState<Set<string>>(new Set());

  const [npcRuntime, setNpcRuntime] = useState<Record<string, PatrolRuntime>>(() => {
    const init: Record<string, PatrolRuntime> = {};
    room.npcs.forEach(npc => {
      init[npc.id] = initPatrolState(npc.position);
    });
    return init;
  });
  const [vehicleRuntime, setVehicleRuntime] = useState<Record<string, PatrolRuntime>>(() => {
    const init: Record<string, PatrolRuntime> = {};
    room.vehicles.forEach(v => {
      init[v.id] = initPatrolState(v.path[0]);
    });
    return init;
  });

  const playerPosRef = useRef(playerPos);
  playerPosRef.current = playerPos;
  const dialogueOrOverlayOpen = !!activeNpc || !!activeStoreNpc || showQuestLog;

  // Ambient movement tick: NPCs patrol, vehicles run their route, both skip a
  // step rather than collide with the player or another moving entity.
  useEffect(() => {
    const interval = setInterval(() => {
      setNpcRuntime(prev => {
        const occupied = new Set<string>([posKey(playerPosRef.current)]);
        Object.values(prev).forEach(r => occupied.add(posKey(r.position)));
        const next = { ...prev };
        room.npcs.forEach(npc => {
          if (npc.movement.type !== 'patrol') return;
          const candidate = stepPatrol(prev[npc.id], npc.movement.path);
          if (!occupied.has(posKey(candidate.position)) || posKey(candidate.position) === posKey(prev[npc.id].position)) {
            next[npc.id] = candidate;
            occupied.add(posKey(candidate.position));
          }
        });
        return next;
      });

      setVehicleRuntime(prev => {
        const occupied = new Set<string>([posKey(playerPosRef.current)]);
        Object.values(prev).forEach(r => occupied.add(posKey(r.position)));
        const next = { ...prev };
        room.vehicles.forEach(vehicle => {
          const candidate = stepPatrol(prev[vehicle.id], vehicle.path);
          if (!occupied.has(posKey(candidate.position))) {
            next[vehicle.id] = candidate;
            occupied.add(posKey(candidate.position));
          }
        });
        return next;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const npcPositions = useMemo(() => {
    const result: Record<string, Position> = {};
    Object.entries(npcRuntime).forEach(([id, r]) => (result[id] = r.position));
    return result;
  }, [npcRuntime]);

  const vehiclePositions = useMemo(() => {
    const result: Record<string, Position> = {};
    Object.entries(vehicleRuntime).forEach(([id, r]) => (result[id] = r.position));
    return result;
  }, [vehicleRuntime]);

  const handleMove = (dx: number, dy: number) => {
    if (dialogueOrOverlayOpen) return;
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;
    if (room.tiles[ny]?.[nx] === 'wall' || room.tiles[ny]?.[nx] === undefined) return;

    const npc = room.npcs.find(n => posKey(npcPositions[n.id]) === posKey({ x: nx, y: ny }));
    if (npc) {
      if (npc.role === 'vendor') {
        setActiveStoreNpc(npc);
      } else {
        setActiveNpc(npc);
        setDialogueLine(0);
      }
      return;
    }

    const vehicleHere = room.vehicles.some(v => posKey(vehiclePositions[v.id]) === posKey({ x: nx, y: ny }));
    if (vehicleHere) return; // wait for traffic

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
      return;
    }
    if (activeNpc.givesQuestId && !activeQuestIds.has(activeNpc.givesQuestId) && !completedQuestIds.has(activeNpc.givesQuestId)) {
      setActiveQuestIds(prev => new Set(prev).add(activeNpc.givesQuestId!));
    }
    setActiveNpc(null);
  };

  const finishEncounter = (cleared: boolean) => {
    if (!activeEncounter) return;
    const encounter = activeEncounter;
    setActiveEncounter(null);
    if (!cleared) return;

    setClearedEncounterIds(prev => new Set(prev).add(encounter.id));
    setCredits(c => c + encounter.creditReward);

    setCompletedObjectiveIds(prevCompleted => {
      const nextCompleted = new Set(prevCompleted);
      QUESTS.forEach(quest => {
        if (!activeQuestIds.has(quest.id) || completedQuestIds.has(quest.id)) return;
        quest.objectives.forEach(obj => {
          if (obj.encounterId === encounter.id) {
            nextCompleted.add(objectiveKey(quest.id, obj.id));
          }
        });
        const allDone = quest.objectives.every(obj => nextCompleted.has(objectiveKey(quest.id, obj.id)));
        if (allDone) {
          setCompletedQuestIds(prevQ => new Set(prevQ).add(quest.id));
          setActiveQuestIds(prevA => {
            const next = new Set(prevA);
            next.delete(quest.id);
            return next;
          });
          setCredits(c => c + quest.creditReward);
        }
      });
      return nextCompleted;
    });
  };

  const buyItem = (item: Item) => {
    if (ownedItemIds.has(item.id) || credits < item.price) return;
    setCredits(c => c - item.price);
    setOwnedItemIds(prev => new Set(prev).add(item.id));
  };

  if (activeEncounter) {
    return <EncounterScreen encounter={activeEncounter} onFinish={finishEncounter} />;
  }

  if (activeStoreNpc) {
    return (
      <StoreScreen
        vendorName={activeStoreNpc.name}
        items={ITEMS}
        credits={credits}
        ownedItemIds={ownedItemIds}
        onBuy={buyItem}
        onClose={() => setActiveStoreNpc(null)}
      />
    );
  }

  if (showQuestLog) {
    return (
      <QuestLogScreen
        activeQuests={QUESTS.filter(q => activeQuestIds.has(q.id))}
        completedQuests={QUESTS.filter(q => completedQuestIds.has(q.id))}
        completedObjectiveIds={completedObjectiveIds}
        onClose={() => setShowQuestLog(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomName}>{room.name}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.credits}>◈ {credits}</Text>
          <TouchableOpacity
            style={styles.questButton}
            onPress={() => setShowQuestLog(true)}
            accessibilityRole="button"
            accessibilityLabel="Open quest log"
          >
            <Text style={styles.questButtonText}>Quests</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapArea}>
        <GameMap
          room={room}
          playerPos={playerPos}
          npcPositions={npcPositions}
          vehiclePositions={vehiclePositions}
          clearedEncounterIds={clearedEncounterIds}
        />
      </View>

      <View style={styles.controls}>
        <DPad onMove={handleMove} disabled={dialogueOrOverlayOpen} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomName: {
    color: '#9298A8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  credits: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  questButton: {
    backgroundColor: '#1A1D27',
    borderWidth: 1,
    borderColor: '#2A2E3A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  questButtonText: {
    color: '#E6E8EF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: 28,
  },
});
