// components/Game.tsx
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import useInitializeGame from '../hooks/useInitializeGame';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import NoDataScreen from './NoDataScreen';
import GameStatus from './GameStatus';
import GameBoard from './GameBoard';
import DiceDisplay from './DiceDisplay';
import BattleModal from './BattleModal';

const Game: React.FC = () => {
  const { player, visibleMap, fogOfWar, diceRoll, stepsLeft, eventMessage, isConnected, error, isLoading, battleState, setBattleState } = useGame();
  const initState = useInitializeGame(); // { initializing: boolean, error? }

  useKeyboardControls();

  if (isLoading || initState.initializing) return <LoadingScreen />;
  if (error || initState.error) return <ErrorScreen message={error || initState.error} />;
  if (isConnected && (!player || !visibleMap)) return <NoDataScreen player={player} map={visibleMap} />;

  return (
    <div className="game-page">
      {battleState && (
        <BattleModal
          battle={battleState}
          onClose={() => {
            setBattleState(null);
            // После закрытия боя можно добавить обновление карты/игрока, если нужно
          }}
        />
      )}
      <GameStatus player={player!} isConnected={isConnected} eventMessage={eventMessage} error={error} />
      {visibleMap && player ? (
        <GameBoard visibleMap={visibleMap} player={player} fogOfWar={fogOfWar} />
      ) : (
        <NoDataScreen player={player} map={visibleMap} />
      )}
      <DiceDisplay diceRoll={diceRoll} stepsLeft={stepsLeft} />
    </div>
  );
};

export default Game;
