export interface Position {
  x: number;
  y: number;
}

export type TileType = 'floor' | 'wall';

export interface NPC {
  id: string;
  name: string;
  emoji: string;
  position: Position;
  lines: string[];
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
}

export interface RoomMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][]; // [y][x]
  playerStart: Position;
  npcs: NPC[];
  encounters: Encounter[];
}
