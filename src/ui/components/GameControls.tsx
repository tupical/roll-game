// components/GameControls.tsx
import React from 'react';
import { GameControlsProps } from '../interfaces/ui.interfaces';
import { Direction } from '../../core/interfaces/game.models';

const directionConfig = [
  { dir: Direction.UP, label: '↑', pos: 'up' },
  { dir: Direction.LEFT, label: '←', pos: 'left' },
  { dir: Direction.RIGHT, label: '→', pos: 'right' },
  { dir: Direction.DOWN, label: '↓', pos: 'down' },
];

const GameControls: React.FC<GameControlsProps> = ({ stepsLeft, canRoll, onRollDice, onMove, onEndTurn }) => (
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
        <button className="roll-button" onClick={onRollDice}>Бросить кубики</button>
      ) : (
        <>
          <div className="direction-buttons">
            {directionConfig.map(({ dir, label, pos }) => (
              <button
                key={pos}
                className={`direction-button ${pos}`}
                onClick={() => onMove(dir)}
                disabled={stepsLeft <= 0}
              >
                {label}
              </button>
            ))}
          </div>
          {stepsLeft === 0 && (
            <button className="end-turn-button" onClick={onEndTurn}>
              Завершить ход
            </button>
          )}
        </>
      )}
    </div>
  </div>
);

export default GameControls;
