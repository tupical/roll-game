// Контекст для управления состоянием игры
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IGameService } from '../../core/interfaces/game.services';
import { 
  Player, 
  World, 
  VisibleMap, 
  DiceRoll, 
  Direction,
  FogOfWarData,
  CellEventType,
  BattleState // добавлен импорт
} from '../../core/interfaces/game.models';

// Интерфейс для контекста игры
interface GameContextType {
  // Состояние
  player: Player | null;
  world: World | null;
  visibleMap: VisibleMap | null;
  fogOfWar: FogOfWarData | null;
  diceRoll: DiceRoll | null;
  stepsLeft: number;
  eventMessage: string | null;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
  battleState: BattleState | null;

  // Действия
  rollDice: () => void;
  movePlayer: (direction: Direction) => void;
  endTurn: () => void;
  joinWorld: (worldId: string) => Promise<void>;
  createWorld: (name: string) => Promise<World>;
  getWorlds: () => Promise<World[]>;
  setBattleState: (battle: BattleState | null) => void;
}

// Создание контекста с начальными значениями
const GameContext = createContext<GameContextType>({
  player: null,
  world: null,
  visibleMap: null,
  fogOfWar: null,
  diceRoll: null,
  stepsLeft: 0,
  eventMessage: null,
  isConnected: false,
  error: null,
  isLoading: false,
  battleState: null,
  setBattleState: () => {},
  rollDice: () => {},
  movePlayer: () => {},
  endTurn: () => {},
  joinWorld: async () => {},
  createWorld: async () => ({ id: '', name: '' }),
  getWorlds: async () => [],
});

// Пропсы для провайдера
interface GameProviderProps {
  children: ReactNode;
  gameService: IGameService;
}

// Провайдер контекста
export const GameProvider: React.FC<GameProviderProps> = ({ children, gameService }) => {
  // Получаем данные игрока из AuthService
  const getInitialPlayerState = () => {
    // Получаем доступ к AuthService через gameService
    const authService = (gameService as any)._authService;
    if (!authService) return null;
    
    const session = authService.getSession();
    if (!session) return null;
    
    return {
      id: session.playerId,
      username: session.username,
      position: { x: 0, y: 0 },
      pathTaken: [],
      stepsLeft: 0,
      currentRoll: 0,
      stepsTaken: 0,
      bonusSteps: 0,
      turnsToSkip: 0
    };
  };

  // Состояние
  const [player, setPlayer] = useState<Player | null>(getInitialPlayerState());
  const [world, setWorld] = useState<World | null>(null);
  const [visibleMap, setVisibleMap] = useState<VisibleMap | null>(null);
  const [fogOfWar, setFogOfWar] = useState<FogOfWarData | null>(null);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [stepsLeft, setStepsLeft] = useState<number>(0);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<BattleState | null>(null);

  // Настройка обработчиков событий при монтировании
  useEffect(() => {
    console.log('Setting up game context event handlers');
    
    // Обработчик обновления игрока
    gameService.onPlayerUpdate((updatedPlayer) => {
      console.log('GameContext: Player update received', updatedPlayer);
      setPlayer(prevPlayer => {
        console.log('GameContext: Updating player state', { prev: prevPlayer, new: updatedPlayer });
        return {
          ...prevPlayer,
          ...updatedPlayer
        };
      });
      if (updatedPlayer.stepsLeft !== undefined) {
        setStepsLeft(updatedPlayer.stepsLeft);
      }
      setIsConnected(true);
      
      // Обновляем данные тумана войны при обновлении игрока (после хода)
      updateFogOfWar();
    });

    // Обработчик обновления карты
    gameService.onMapUpdate((updatedMap) => {
      console.log('GameContext: Map update received', updatedMap);
      setVisibleMap(updatedMap);
      
      // Туман войны должен обновляться отдельно, не при каждом обновлении карты
      // updateFogOfWar(); // Убираем автоматическое обновление
    });

    // Обработчик броска кубиков
    gameService.onDiceRolled((roll) => {
      console.log('GameContext: Dice roll received', roll);
      setEventMessage(null);
      setDiceRoll(roll);
      setStepsLeft(roll.stepsLeft);
    });

    // Обработчик событий на клетках
    gameService.onEventTriggered((event) => {
      console.log('GameContext: Event triggered', event);
      setEventMessage(event.message);
      // Если сервер прислал состояние боя, обновляем его
      if ((event as any).battleState) {
        setBattleState((event as any).battleState);
      }
      // Удалена клиентская логика обновления типа ячейки, теперь только отображение сообщения
    });

    // Обработчик ошибок
    gameService.onError((err) => {
      console.error('GameContext: Error received', err);
      setError(err.message);
    });

    // Подписка на обновление состояния боя
    if (gameService.onBattleUpdate) {
      gameService.onBattleUpdate((battle: BattleState) => {
        setBattleState(battle);
      });
    }

    // Очистка обработчиков при размонтировании
    return () => {
      console.log('GameContext: Cleaning up event handlers');
      gameService.cleanup();
    };
  }, [gameService]);

  // Действия
  const rollDice = () => {
    if (player && player.stepsLeft && player.stepsLeft !== 0) {
      console.error(`GameContext: Player already has ${player.stepsLeft} steps left`);
      return;
    }

    gameService.rollDice();
  };

  const movePlayer = (direction: Direction) => {
    gameService.movePlayer(direction);
  };

  const endTurn = () => {
    gameService.endTurn();
  };

  const joinWorld = async (worldId: string) => {
    setIsLoading(true);
    try {
      console.log('GameContext: joinWorld called with worldId', worldId);
      
      // Если игрок не инициализирован, получаем данные из сессии
      if (!player) {
        console.log('GameContext: No player state, initializing from session');
        const authService = (gameService as any)._authService;
        if (authService) {
          // Получаем или создаем сессию
          let session = authService.getSession();
          if (!session) {
            console.log('GameContext: No session found, creating new session');
            session = authService.createSession();
          }
          console.log('GameContext: Session data', session);
          
          // Инициализируем игрока с данными из сессии
          const initialPlayer = {
            id: session.playerId,
            username: session.username,
            position: { x: 0, y: 0 },
            pathTaken: [],
            stepsLeft: 0,
            currentRoll: 0,
            stepsTaken: 0,
            bonusSteps: 0,
            turnsToSkip: 0
          };
          console.log('GameContext: Setting initial player state', initialPlayer);
          setPlayer(initialPlayer);
          
          // Используем данные из сессии для присоединения к миру
          console.log('GameContext: Joining world with session data');
          await gameService.joinWorld(worldId, session.playerId, session.username);
        } else {
          console.error('GameContext: AuthService not available');
          throw new Error('AuthService not available');
        }
      } else {
        // Используем существующие данные игрока
        console.log('GameContext: Using existing player data to join world', player);
        await gameService.joinWorld(worldId, player.id, player.username);
      }
      
      console.log('GameContext: Getting player state after join');
      const playerState = await gameService.getPlayerState();
      console.log('GameContext: Received player state', playerState);
      
      if (playerState) {
        console.log('GameContext: Updating state with player data');
        setPlayer(playerState);
        setWorld({ id: worldId, name: 'Game World' });
        setIsConnected(true);
        
        // Явно запрашиваем карту и данные тумана войны после успешного присоединения к миру
        console.log('GameContext: Requesting visible map after join');
        try {
          const mapData = await gameService.getVisibleMap();
          console.log('GameContext: Received map data', mapData);
          setVisibleMap(mapData);
          
          // Получаем данные тумана войны
          console.log('GameContext: Requesting fog of war data');
          const fogData = await gameService.getFogOfWar();
          console.log('GameContext: Received fog of war data', fogData);
          setFogOfWar(fogData);
        } catch (mapError) {
          console.error('GameContext: Error getting visible map or fog of war:', mapError);
          // Не устанавливаем общую ошибку, так как игрок уже присоединился
        }
      } else {
        console.warn('GameContext: No player state received after join');
      }
    } catch (err) {
      console.error('GameContext: Join world error:', err);
      setError('Failed to join world');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorld = async (name: string) => {
    setIsLoading(true);
    try {
      const newWorld = await gameService.createWorld(name);
      setWorld(newWorld);
      return newWorld;
    } catch (err) {
      setError('Failed to create world');
      return { id: '', name: '' };
    } finally {
      setIsLoading(false);
    }
  };

  const getWorlds = async () => {
    setIsLoading(true);
    try {
      return await gameService.getWorlds();
    } catch (err) {
      setError('Failed to get worlds');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для обновления данных тумана войны
  const updateFogOfWar = async () => {
    try {
      const fogData = await gameService.getFogOfWar();
      console.log('GameContext: Updated fog of war data', fogData);
      setFogOfWar(fogData);
    } catch (error) {
      console.error('GameContext: Error updating fog of war:', error);
    }
  };

  // Значение контекста
  const value = {
    player,
    world,
    visibleMap,
    fogOfWar,
    diceRoll,
    stepsLeft,
    eventMessage,
    isConnected,
    error,
    isLoading,
    battleState,
    setBattleState,
    
    rollDice,
    movePlayer,
    endTurn,
    joinWorld,
    createWorld,
    getWorlds,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Хук для использования контекста
export const useGame = () => useContext(GameContext);
