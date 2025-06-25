import React from 'react';
import { BattleState } from '../../core/interfaces/game.models';
import './BattleModal.css';

interface BattleModalProps {
  battle: BattleState;
  onClose: () => void;
}

const BattleModal: React.FC<BattleModalProps> = ({ battle, onClose }) => {
  return (
    <div className="battle-modal-overlay">
      <div className="battle-modal">
        <h2>Бой!</h2>
        <div className="battle-hp">
          <div>HP Игрока: <b>{battle.playerHp}</b></div>
          <div>HP Врага: <b>{battle.enemyHp}</b></div>
        </div>
        <div className="battle-log">
          <h4>Ход боя:</h4>
          <ul>
            {battle.log.map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        </div>
        {battle.finished ? (
          <div className="battle-result">
            <h3>{battle.victory ? 'Победа!' : 'Поражение!'}</h3>
            <button onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <div className="battle-progress">Бой продолжается...</div>
        )}
      </div>
    </div>
  );
};

export default BattleModal;
