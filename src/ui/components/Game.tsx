import React, { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import GameBoard from './GameBoard';
import GameStatus from './GameStatus';
import DiceDisplay from './DiceDisplay';

const Game: React.FC = () => {
  const { 
    player, 
    visibleMap, 
    diceRoll, 
    stepsLeft, 
    eventMessage, 
    isConnected, 
    error, 
    isLoading,
    joinWorld,
    getWorlds
  } = useGame();

  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    const initGame = async () => {
      if (isInitializedRef.current) {
        console.log('Game component: Game already initialized, skipping');
        return;
      }
      
      isInitializedRef.current = true;
      
      try {
        console.log('Game component: Initializing game');
        
        console.log('Game component: Getting worlds list');
        const worlds = await getWorlds();
        console.log('Game component: Received worlds', worlds);
        
        if (worlds.length > 0) {
          console.log('Game component: Joining world', worlds[0]);
          await joinWorld(worlds[0].id);
          console.log('Game component: Join world completed');
        } else {  
          console.error('Game component: Static world not found on server');
        }
      } catch (err) {
        console.error('Game component: Error initializing game:', err);
        isInitializedRef.current = false;
      }
    };

    initGame();
  }, []);

  useKeyboardControls();
  console.log('Game component rendering with state:', {
    player,
    visibleMap,
    diceRoll,
    stepsLeft,
    eventMessage,
    isConnected,
    error,
    isLoading,
    isInitialized: isInitializedRef.current
  });

  // Если данные еще загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="game-page loading">
        <h1>Загрузка игры...</h1>
        <p>Подключение к серверу...</p>
      </div>
    );
  }

  // Если есть ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <div className="game-page error">
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button onClick={() => {
          // Сбрасываем флаг инициализации перед перезагрузкой
          isInitializedRef.current = false;
          window.location.reload();
        }}>Перезагрузить</button>
      </div>
    );
  }

  // Если нет данных игрока или карты после подключения, показываем сообщение
  if (isConnected && (!player || !visibleMap)) {
    return (
      <div className="game-page no-data">
        <h1>Ожидание данных</h1>
        <p>Соединение установлено, но данные игры еще не получены.</p>
        <p>Состояние: {player ? 'Игрок получен' : 'Игрок не получен'}, 
           {visibleMap ? 'Карта получена' : 'Карта не получена'}</p>
      </div>
    );
  }

  return (
    <div className="game-page">
      <GameStatus 
        player={player}
        isConnected={isConnected}
        eventMessage={eventMessage}
        error={error}
      />
      
      {visibleMap && player ? (
        <GameBoard 
          visibleMap={visibleMap}
          player={player}
          isLoading={isLoading}
        />
      ) : (
        <div className="game-board-placeholder">
          <p>Ожидание данных игры...</p>
        </div>
      )}
      
      <DiceDisplay 
        diceRoll={diceRoll}
        stepsLeft={stepsLeft}
      />
    </div>
  );
};

export default Game;
