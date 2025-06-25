// hooks/usePixiRenderer.ts
import { useEffect, useRef, useState } from 'react';
import { PixiRenderer } from '../components/PixiRenderer';
import { MapData, MapDataConverter } from '../components/MapDataConverter';
import { FogOfWarData } from '../../core/interfaces/game.models';

export default function usePixiRenderer(
  containerRef: React.RefObject<HTMLDivElement>,
  visibleMap?: MapData,
  player?: { position: { x: number; y: number }; pathTaken?: any[] },
  fogOfWar?: FogOfWarData
) {
  const rendererRef = useRef<PixiRenderer>();
  const [inited, setInited] = useState(false);

  // init & cleanup
  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;
    const r = new PixiRenderer();
    r.initialize(containerRef.current).then(() => {
      r.drawGrid();
      rendererRef.current = r;
      setInited(true);
    });
    return () => rendererRef.current?.cleanup();
  }, []);

  // draw map + player
  useEffect(() => {
    if (!inited || !rendererRef.current) return;
    try {
      // Объединяем данные карты с данными тумана войны
      const mapDataWithFog: MapData = {
        ...visibleMap,
        fogOfWar: fogOfWar ? {
          visibleCells: fogOfWar.visibleCells,
          exploredCells: fogOfWar.exploredCells
        } : undefined
      };
      
      const grid = mapDataWithFog ? MapDataConverter.convertToGrid(mapDataWithFog) : [];
      rendererRef.current!.drawCellEvents(grid);
      if (player) {
        rendererRef.current!.drawPlayer(player.position.x, player.position.y);
        if (player.pathTaken?.length) rendererRef.current!.drawPath(player.pathTaken);
      }
    } catch {
      rendererRef.current!.drawGrid();
    }
  }, [visibleMap, player, fogOfWar, inited]);

  return { inited, renderer: rendererRef.current };
}
