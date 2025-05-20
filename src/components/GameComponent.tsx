import React, { useEffect, useRef } from 'react';
import { Game } from '../lib/game/game';
import '../App.css';

let gameInstance: Game | null = null;

const GameComponent: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGame = async () => {
      if (gameContainerRef.current && !gameInstance) {
        gameInstance = new Game();
        await gameInstance.init(gameContainerRef.current);
        return;
      }
    };

    initGame();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameInstance) {
        gameInstance.handleKeyDown(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      if (gameInstance) {
        gameInstance.cleanup();
      }
    };
  }, []);

  return (
    <div className="game-page">
      <h1>Игра с кубиками</h1>
      <div className="game-instructions">
        <p>Нажмите <strong>R</strong> чтобы бросить кубики и используйте <strong>стрелки</strong> для перемещения.</p>
        <p>Нельзя вставать на уже пройденную ячейку в текущем ходу.</p>
      </div>
      <div 
        className="game-container" 
        ref={gameContainerRef}
        tabIndex={0}
        onFocus={() => console.log('Game container focused')}
        onClick={() => {
          if (gameContainerRef.current) {
            gameContainerRef.current.focus();
          }
        }}
      ></div>
    </div>
  );
};

export default GameComponent;
