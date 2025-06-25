// components/GameBoard.tsx
import React, { useRef } from 'react';
import { GameBoardProps } from '../interfaces/ui.interfaces';
import usePixiRenderer from '../hooks/usePixiRenderer';

const GameBoard: React.FC<GameBoardProps> = ({ visibleMap, player, isLoading, fogOfWar }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { inited } = usePixiRenderer(containerRef, visibleMap || undefined, player || undefined, fogOfWar || undefined);

  return (
    <div className="game-board">
      {isLoading && <div className="loading-overlay">Загрузка...</div>}
      <div ref={containerRef} className="game-canvas-container" tabIndex={0} />
    </div>
  );
};

export default GameBoard;
