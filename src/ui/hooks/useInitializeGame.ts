// hooks/useInitializeGame.ts
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';

export default function useInitializeGame() {
  const { getWorlds, joinWorld } = useGame();
  const inited = useRef(false);
  const [error, setError] = useState<string>();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    getWorlds()
      .then(worlds => worlds[0] ? joinWorld(worlds[0].id) : Promise.reject('Мир не найден'))
      .catch(err => setError(String(err)))
      .finally(() => setInitializing(false));
  }, []);

  return { initializing, error };
}
