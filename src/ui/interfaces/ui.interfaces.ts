// Интерфейсы для UI компонентов
import { DiceRoll, Player, VisibleMap, Direction } from '../../core/interfaces/game.models';

export interface GameBoardProps {
  visibleMap: VisibleMap | null;
  player: Player | null;
  isLoading?: boolean;
}

export interface GameControlsProps {
  stepsLeft: number;
  canRoll: boolean;
  onRollDice: () => void;
  onMove: (direction: Direction) => void;
  onEndTurn: () => void;
}

export interface GameStatusProps {
  player: Player | null;
  isConnected: boolean;
  eventMessage: string | null;
  error: string | null;
}

export interface DiceDisplayProps {
  diceRoll: DiceRoll | null;
  stepsLeft: number;
}

export interface IRenderer {
  initialize(container: HTMLElement): Promise<void>;
  drawGrid(): void;
  drawCellEvents(grid: any[][]): void;
  drawPlayer(x: number, y: number): void;
  drawPath(path: { x: number, y: number }[]): void;
  updateDiceDisplay(die1Value: number, die2Value: number): void;
  cleanup(): void;
}
