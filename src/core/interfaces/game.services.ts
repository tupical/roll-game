// Интерфейсы для игровых сервисов
import { 
  World, 
  Player, 
  Direction, 
  DiceRoll, 
  VisibleMap, 
  GameEvent 
} from './game.models';

export interface IGameService {
  // Управление миром
  getWorlds(): Promise<World[]>;
  createWorld(name: string): Promise<World>;
  joinWorld(worldId: string, playerId: string, username: string): Promise<void>;
  
  // Игровые действия
  rollDice(): void;
  movePlayer(direction: Direction): void;
  endTurn(): void;
  
  // Получение данных
  getVisibleMap(): Promise<VisibleMap>;
  getPlayerState(): Promise<Player | null>;
  
  // Обработчики событий
  onPlayerUpdate(callback: (player: Player) => void): void;
  onMapUpdate(callback: (map: VisibleMap) => void): void;
  onDiceRolled(callback: (roll: DiceRoll) => void): void;
  onEventTriggered(callback: (event: GameEvent) => void): void;
  onError(callback: (error: { message: string }) => void): void;
  
  // Очистка ресурсов
  cleanup(): void;
}

export interface IGameState {
  player: Player | null;
  world: World | null;
  visibleMap: VisibleMap | null;
  diceRoll: DiceRoll | null;
  stepsLeft: number;
  eventMessage: string | null;
  isConnected: boolean;
  error: string | null;
  
  // Действия
  rollDice: () => void;
  movePlayer: (direction: Direction) => void;
  endTurn: () => void;
  joinWorld: (worldId: string) => Promise<void>;
  createWorld: (name: string) => Promise<World>;
}

export interface IEventHandler {
  handlePlayerUpdate(player: Player): void;
  handleMapUpdate(map: VisibleMap): void;
  handleDiceRolled(roll: DiceRoll): void;
  handleEventTriggered(event: GameEvent): void;
  handleError(error: { message: string }): void;
}
