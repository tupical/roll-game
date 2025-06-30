// components/DiceDisplay.tsx
import React from 'react';
import { DiceDisplayProps } from '../interfaces/ui.interfaces';

const Die: React.FC<{ value: number }> = ({ value }) => (
  <img
    className="dice"
    src={`/assets/dice/${value}.png`}
    alt={`Кубик со значением ${value}`}
    width={48}
    height={48}
    data-value={value}
  />
);

const Bonus: React.FC<{ value: number }> = ({ value }) =>
  value !== 0 ? (
    <span className={value > 0 ? 'bonus' : 'debuff'}>
      ({value > 0 ? '+' : ''}
      {value})
    </span>
  ) : null;

const DiceDisplay: React.FC<DiceDisplayProps> = ({ diceRoll, stepsLeft }) => {
  if (!diceRoll) {
    return (
      <div className="dice-display">
        <div className="steps-left">
          Нажмите R, чтобы сделать ход
        </div>
      </div>
    );
  }

  return (
    <div className="dice-display">
      <div className="dice-container">
        <Die value={diceRoll.die1} />
        <Die value={diceRoll.die2} />
      </div>
      <div className="steps-left">
        Шагов осталось: {stepsLeft}
        {diceRoll.bonusApplied != null && (
          <>
            <br />
            Бонус: <Bonus value={diceRoll.bonusApplied} />
          </>
        )}
      </div>
    </div>
  );
};

export default DiceDisplay;
