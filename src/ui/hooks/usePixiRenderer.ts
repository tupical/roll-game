// hooks/usePixiRenderer.ts
import { useEffect, useRef, useState } from 'react';
import { PixiRenderer } from '../components/PixiRenderer';
import { MapData, MapDataConverter } from '../components/MapDataConverter';

export default function usePixiRenderer(
  containerRef: React.RefObject<HTMLDivElement>,
  visibleMap?: MapData,
  player?: { position: { x: number; y: number }; pathTaken?: any[] }
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
      const grid = visibleMap ? MapDataConverter.convertToGrid(visibleMap) : [];
      rendererRef.current!.drawCellEvents(grid);
      if (player) {
        rendererRef.current!.drawPlayer(player.position.x, player.position.y);
        if (player.pathTaken?.length) rendererRef.current!.drawPath(player.pathTaken);
      }
    } catch {
      rendererRef.current!.drawGrid();
    }
  }, [visibleMap, player, inited]);

  return { inited, renderer: rendererRef.current };
}
