import React, { useEffect, useRef, useState } from 'react';
import { GameBoardProps } from '../interfaces/ui.interfaces';
import { IRenderer } from '../interfaces/ui.interfaces';
import { PixiRenderer } from './PixiRenderer';
import { MapDataConverter, MapData } from './MapDataConverter';

const GameBoard: React.FC<GameBoardProps> = ({ visibleMap, player, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<IRenderer | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  
  // Инициализация рендерера
  useEffect(() => {
    const initRenderer = async () => {
      if (containerRef.current && !rendererRef.current) {
        console.log('Инициализация рендерера');
        try {
          const renderer = new PixiRenderer();
          await renderer.initialize(containerRef.current);
          rendererRef.current = renderer;
          renderer.drawGrid();
          console.log('Рендерер успешно инициализирован');
          setIsInitialized(true);
        } catch (error) {
          console.error('Ошибка инициализации рендерера:', error);
        }
      }
    };
    
    initRenderer();
    
    return () => {
      if (rendererRef.current) {
        console.log('Очистка рендерера');
        rendererRef.current.cleanup();
        rendererRef.current = null;
      }
    };
  }, []);
  
  // Обновление отображения карты
  useEffect(() => {
    if (!rendererRef.current) {
      console.log('Рендерер не инициализирован, пропускаем обновление карты');
      return;
    }
    
    console.log('Обновление карты. visibleMap:', visibleMap);
    
    if (visibleMap) {
      try {
        const gridData = MapDataConverter.convertToGrid(visibleMap as MapData);
        console.log('Сетка данных подготовлена, количество строк:', gridData.length);
        
        // Проверим, есть ли видимые ячейки
        let visibleCellsCount = 0;
        for (const row of gridData) {
          for (const cell of row) {
            if (cell.visible) visibleCellsCount++;
          }
        }
        console.log('Количество видимых ячеек:', visibleCellsCount);
        
        rendererRef.current.drawCellEvents(gridData);
        console.log('Карта отрисована');
      } catch (error) {
        console.error('Ошибка при обновлении карты:', error);
        rendererRef.current.drawGrid();
      }
    } else {
      console.log('Нет данных карты, рисуем пустую сетку');
      rendererRef.current.drawGrid();
    }
  }, [visibleMap, isInitialized]);
  
  // Обновление отображения игрока
  useEffect(() => {
    if (!rendererRef.current) {
      console.log('Рендерер не инициализирован, пропускаем обновление игрока');
      return;
    }
    
    console.log('Обновление игрока. player:', player);
    
    if (player) {
      try {
        rendererRef.current.drawPlayer(player.position.x, player.position.y);
        console.log(`Игрок отрисован на позиции (${player.position.x}, ${player.position.y})`);
        
        if (player.pathTaken && player.pathTaken.length > 0) {
          rendererRef.current.drawPath(player.pathTaken);
          console.log('Путь игрока отрисован, количество точек:', player.pathTaken.length);
        }
      } catch (error) {
        console.error('Ошибка при обновлении игрока:', error);
      }
    }
  }, [player, isInitialized]);
  
  return (
    <div className="game-board">
      {isLoading && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          Загрузка...
        </div>
      )}
      <div 
        className="game-canvas-container" 
        ref={containerRef}
        tabIndex={0}
        style={{
          position: 'relative',
          outline: 'none'
        }}
      />
    </div>
  );
};

export default GameBoard;