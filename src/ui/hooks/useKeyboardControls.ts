// Хук для обработки клавиатурных событий
import { useEffect } from 'react';
import { Direction } from '../../core/interfaces/game.models';
import { useGame } from '../contexts/GameContext';

export const useKeyboardControls = () => {
  const { stepsLeft, rollDice, movePlayer } = useGame();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Бросок кубиков (R или К в русской раскладке)
      if (key === 'r' || key === 'к') {
        rollDice();
      } 
      // Перемещение игрока
      else if (stepsLeft > 0) {
        let direction: Direction | null = null;
        
        switch (key) {
          case 'arrowup': case 'w': case 'ц':
            direction = Direction.UP;
            break;
          case 'arrowdown': case 's': case 'ы':
            direction = Direction.DOWN;
            break;
          case 'arrowleft': case 'a': case 'ф':
            direction = Direction.LEFT;
            break;
          case 'arrowright': case 'd': case 'в':
            direction = Direction.RIGHT;
            break;
        }
        
        if (direction !== null) {
          movePlayer(direction);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stepsLeft, rollDice, movePlayer]);
};
