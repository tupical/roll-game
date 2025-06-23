// Реализация игрового сервиса
import { IGameService } from '../../core/interfaces/game.services';
import { 
  World, 
  Player, 
  Direction, 
  DiceRoll, 
  VisibleMap, 
  GameEvent 
} from '../../core/interfaces/game.models';
import { IHttpClient, ISocketClient, IAuthService } from '../../api/interfaces/api.interfaces';
import { API_CONFIG } from '../../utils/types';

export class GameService implements IGameService {
  private httpClient: IHttpClient;
  private socketClient: ISocketClient;
  // Expose authService for initialization
  _authService: IAuthService;
  
  private worldId: string | null = null;
  private playerId: string | null = null;
  
  // Обработчики событий
  private playerUpdateCallback: ((player: Player) => void) | null = null;
  private mapUpdateCallback: ((map: VisibleMap) => void) | null = null;
  private diceRolledCallback: ((roll: DiceRoll) => void) | null = null;
  private eventTriggeredCallback: ((event: GameEvent) => void) | null = null;
  private errorCallback: ((error: { message: string }) => void) | null = null;
  
  constructor(
    httpClient: IHttpClient, 
    socketClient: ISocketClient,
    authService: IAuthService
  ) {
    this.httpClient = httpClient;
    this.socketClient = socketClient;
    this._authService = authService;
    
    // Подключаемся к сокету
    this.socketClient.connect();
    
    // Настраиваем обработчики событий
    this.setupSocketListeners();
  }
  
  // Настройка обработчиков событий Socket.IO
  private setupSocketListeners(): void {
    console.log('Setting up socket listeners');
    
    this.socketClient.on<Player>(API_CONFIG.SOCKET_EVENTS.PLAYER_UPDATE, (data) => {
      console.log('Received player update:', data);
      if (this.playerUpdateCallback) {
        try {
          this.playerUpdateCallback(data);
        } catch (error) {
          console.error('Error in player update callback:', error);
        }
      }
    });
    
    this.socketClient.on<VisibleMap>(API_CONFIG.SOCKET_EVENTS.MAP_UPDATE, (data) => {
      console.log('Received map update:', data);
      if (this.mapUpdateCallback) {
        try {
          this.mapUpdateCallback(data);
        } catch (error) {
          console.error('Error in map update callback:', error);
        }
      }
    });
    
    this.socketClient.on<DiceRoll>(API_CONFIG.SOCKET_EVENTS.DICE_ROLLED, (data) => {
      console.log('Received dice rolled:', data);
      if (this.diceRolledCallback) {
        try {
          this.diceRolledCallback(data);
        } catch (error) {
          console.error('Error in dice rolled callback:', error);
        }
      }
    });
    
    this.socketClient.on<GameEvent>(API_CONFIG.SOCKET_EVENTS.EVENT_TRIGGERED, (data) => {
      console.log('Received event triggered:', data);
      if (this.eventTriggeredCallback) {
        try {
          this.eventTriggeredCallback(data);
        } catch (error) {
          console.error('Error in event triggered callback:', error);
        }
      }
    });
    
    this.socketClient.on<{ message: string }>(API_CONFIG.SOCKET_EVENTS.ERROR, (error) => {
      console.error('Received socket error:', error);
      if (this.errorCallback) {
        try {
          this.errorCallback(error);
        } catch (err) {
          console.error('Error in error callback:', err);
        }
      }
    });
  }
  
  // Получение списка доступных миров
  public async getWorlds(): Promise<World[]> {
    try {
      return await this.httpClient.get<World[]>(API_CONFIG.ENDPOINTS.WORLDS);
    } catch (error) {
      console.error('Error getting worlds:', error);
      throw error;
    }
  }
  
  // Создание нового мира
  public async createWorld(name: string): Promise<World> {
    try {
      return await this.httpClient.post<World>(API_CONFIG.ENDPOINTS.WORLDS, { name });
    } catch (error) {
      console.error('Error creating world:', error);
      throw error;
    }
  }
  
  // Присоединение к миру
  public async joinWorld(worldId: string, playerId: string, username: string): Promise<void> {
    try {
      console.log('Joining world:', { worldId, playerId, username });
      
      // Сохраняем ID мира и игрока
      this.worldId = worldId;
      this.playerId = playerId;
      
      // Регистрируем игрока через HTTP
      console.log('Registering player via HTTP');
      await this.httpClient.post<Player>(`${API_CONFIG.ENDPOINTS.PLAYERS}`, {
        worldId,
        playerId,
        username
      });
      
      // Подключаемся через Socket.IO - без await, так как emit не возвращает Promise
      console.log('Emitting player:join event');
      // Удаляем await, так как emit не возвращает Promise
      this.socketClient.emit(API_CONFIG.SOCKET_EVENTS.PLAYER_JOIN, { 
        worldId, 
        playerId, 
        username 
      });
      console.log('player:join event emitted successfully');
    } catch (error) {
      console.error('Error joining world:', error);
      throw error;
    }
  }
  
  // Бросок кубиков
  public rollDice(): void {
    if (!this.worldId || !this.playerId) {
      throw new Error('Необходимо сначала присоединиться к миру');
    }
    
    this.socketClient.emit(API_CONFIG.SOCKET_EVENTS.PLAYER_ROLL, { 
      worldId: this.worldId, 
      playerId: this.playerId 
    });
  }
  
  // Перемещение игрока
  public movePlayer(direction: Direction): void {
    if (!this.worldId || !this.playerId) {
      throw new Error('Необходимо сначала присоединиться к миру');
    }
    
    this.socketClient.emit(API_CONFIG.SOCKET_EVENTS.PLAYER_MOVE, { 
      worldId: this.worldId, 
      playerId: this.playerId, 
      direction 
    });
  }
  
  // Завершение хода
  public endTurn(): void {
    if (!this.worldId || !this.playerId) {
      throw new Error('Необходимо сначала присоединиться к миру');
    }
    
    this.socketClient.emit(API_CONFIG.SOCKET_EVENTS.PLAYER_END_TURN, { 
      worldId: this.worldId, 
      playerId: this.playerId 
    });
  }
  
  // Получение видимой части карты
  public async getVisibleMap(): Promise<VisibleMap> {
    if (!this.worldId || !this.playerId) {
      throw new Error('Необходимо сначала присоединиться к миру');
    }
    
    try {
      return await this.httpClient.get<VisibleMap>(
        `${API_CONFIG.ENDPOINTS.MAP}/${this.worldId}/${this.playerId}`
      );
    } catch (error) {
      console.error('Error getting map:', error);
      throw error;
    }
  }
  
  // Получение состояния игрока
  public async getPlayerState(): Promise<Player | null> {
    if (!this.worldId || !this.playerId) {
      return null;
    }
    
    try {
      return await this.httpClient.get<Player>(
        `${API_CONFIG.ENDPOINTS.PLAYERS}/${this.worldId}/${this.playerId}`
      );
    } catch (error) {
      console.error('Error getting player state:', error);
      return null;
    }
  }
  
  // Регистрация обработчиков событий
  public onPlayerUpdate(callback: (player: Player) => void): void {
    this.playerUpdateCallback = callback;
  }
  
  public onMapUpdate(callback: (map: VisibleMap) => void): void {
    this.mapUpdateCallback = callback;
  }
  
  public onDiceRolled(callback: (roll: DiceRoll) => void): void {
    this.diceRolledCallback = callback;
  }
  
  public onEventTriggered(callback: (event: GameEvent) => void): void {
    this.eventTriggeredCallback = callback;
  }
  
  public onError(callback: (error: { message: string }) => void): void {
    this.errorCallback = callback;
  }
  
  // Очистка ресурсов
  public cleanup(): void {
    this.socketClient.disconnect();
    
    this.playerUpdateCallback = null;
    this.mapUpdateCallback = null;
    this.diceRolledCallback = null;
    this.eventTriggeredCallback = null;
    this.errorCallback = null;
  }
}
