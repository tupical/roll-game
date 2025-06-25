// Типы и интерфейсы для игровых сущностей
import { WorldCoord } from '../../utils/types';

export enum CellEventType {
  EMPTY = 'EMPTY',
  BONUS_STEPS = 'BONUS_STEPS',
  DEBUFF_STEPS = 'DEBUFF_STEPS',
  ENEMY = 'ENEMY'
}

export enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3
}

export interface Cell {
  x: number;
  y: number;
  eventType: CellEventType;
  eventValue?: number;
  visible: boolean;
  explored?: boolean; // Для тумана войны - ячейка была исследована ранее
}

export interface Player {
  id: string;
  username: string;
  position: WorldCoord;
  currentRoll: number;
  stepsTaken: number;
  stepsLeft: number;
  pathTaken: WorldCoord[];
  bonusSteps: number;
  turnsToSkip: number;
  visibleCells?: string[]; // Ячейки, видимые сейчас
  exploredCells?: string[]; // Ячейки, исследованные ранее (туман войны)
}

export interface World {
  id: string;
  name: string;
}

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  stepsLeft: number;
  bonusApplied?: number;
  turnsToSkip?: number;
}

export interface VisibleMap {
  cells: Cell[];
  centerX: number;
  centerY: number;
}

export interface FogOfWarData {
  visibleCells: string[];
  exploredCells: string[];
  currentPosition: WorldCoord;
}

export interface GameEvent {
  message: string;
  position: WorldCoord;
}

export interface MoveResult {
  success: boolean;
  newPosition?: WorldCoord;
  message?: string;
  eventTriggered?: boolean;
  eventMessage?: string;
  stepsLeft?: number;
}
