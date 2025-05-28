import React from 'react';
import { GameControlsProps } from '../interfaces/ui.interfaces';
import { Direction } from '../../core/interfaces/game.models';

const GameControls: React.FC<GameControlsProps> = ({ 
  stepsLeft, 
  canRoll, 
  onRollDice, 
  onMove, 
  onEndTurn 
}) => {
  return (
    <div className="game-controls">
      <div className="controls-info">
        {canRoll ? (
          <p>Нажмите <strong>R</strong> или кнопку ниже, чтобы бросить кубики</p>
        ) : (
          <p>Используйте <strong>стрелки</strong> для перемещения. Осталось шагов: {stepsLeft}</p>
        )}
      </div>
      
      <div className="controls-buttons">
        {canRoll ? (
          <button 
            className="roll-button" 
            onClick={onRollDice}
            disabled={!canRoll}
          >
            Бросить кубики
          </button>
        ) : (
          <>
            <div className="direction-buttons">
              <button 
                className="direction-button up" 
                onClick={() => onMove(Direction.UP)}
                disabled={stepsLeft <= 0}
              >
                ↑
              </button>
              <div className="horizontal-buttons">
                <button 
                  className="direction-button left" 
                  onClick={() => onMove(Direction.LEFT)}
                  disabled={stepsLeft <= 0}
                >
                  ←
                </button>
                <button 
                  className="direction-button right" 
                  onClick={() => onMove(Direction.RIGHT)}
                  disabled={stepsLeft <= 0}
                >
                  →
                </button>
              </div>
              <button 
                className="direction-button down" 
                onClick={() => onMove(Direction.DOWN)}
                disabled={stepsLeft <= 0}
              >
                ↓
              </button>
            </div>
            
            {stepsLeft === 0 && (
              <button 
                className="end-turn-button" 
                onClick={onEndTurn}
              >
                Завершить ход
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameControls;
