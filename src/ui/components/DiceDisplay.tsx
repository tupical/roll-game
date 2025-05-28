import React from 'react';
import { DiceDisplayProps } from '../interfaces/ui.interfaces';

const DiceDisplay: React.FC<DiceDisplayProps> = ({ diceRoll, stepsLeft }) => {
  // Если нет данных о броске кубиков, не отображаем ничего
  if (!diceRoll) {
    return null;
  }

  return (
    <div className="dice-display">
      <div className="dice-container">
        <div className="dice" data-value={diceRoll.die1}>
          {/* Здесь будет отображаться первый кубик через Canvas/WebGL */}
        </div>
        <div className="dice" data-value={diceRoll.die2}>
          {/* Здесь будет отображаться второй кубик через Canvas/WebGL */}
        </div>
      </div>
      <div className="steps-left">
        Шагов осталось: {stepsLeft}
        {diceRoll.bonusApplied && diceRoll.bonusApplied !== 0 && (
          <span className={diceRoll.bonusApplied > 0 ? "bonus" : "debuff"}>
            {' '}({diceRoll.bonusApplied > 0 ? '+' : ''}{diceRoll.bonusApplied})
          </span>
        )}
      </div>
    </div>
  );
};

export default DiceDisplay;
