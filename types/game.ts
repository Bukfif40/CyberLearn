export interface Position {
  x: number;
  y: number;
}

export type TileType = 'floor' | 'wall' | 'road';

// 'patrol' pings-pongs back and forth along path; 'static' never moves.
export type MovementPattern = { type: 'static' } | { type: 'patrol'; path: Position[] };

export type NPCRole = 'mentor' | 'vendor' | 'citizen';

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  badgeLabel: string;
  badgeColor: string;
  emoji: string; // used in dialogue header only, not on the map
  position: Position; // starting position
  movement: MovementPattern;
  lines: string[];
  givesQuestId?: string; // activated automatically once this NPC's dialogue finishes
}

export interface Vehicle {
  id: string;
  badgeLabel: string;
  badgeColor: string;
  path: Position[];
}

export interface EncounterQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface Encounter {
  id: string;
  name: string;
  emoji: string;
  position: Position;
  intro: string;
  questions: EncounterQuestion[];
  creditReward: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  badgeLabel: string;
  badgeColor: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  encounterId: string; // objective completes when this encounter is cleared
}

export interface Quest {
  id: string;
  title: string;
  giverNpcId: string;
  description: string;
  objectives: QuestObjective[];
  creditReward: number;
}

export interface RoomMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][]; // [y][x]
  playerStart: Position;
  npcs: NPC[];
  vehicles: Vehicle[];
  encounters: Encounter[];
}
