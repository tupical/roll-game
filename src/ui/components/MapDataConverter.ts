import { COLORS, GRID_SIZE } from '../../utils/types';

export interface CellEvent {
  getType(): string;
  getColor(): number;
  getValue?(): number;
}

export interface GridCell {
  x: number;
  y: number;
  event: CellEvent;
  visible: boolean;
  explored?: boolean; // Для тумана войны
}

export interface MapData {
  centerX: number;
  centerY: number;
  cells?: Array<{
    x: number;
    y: number;
    eventType?: string;
    eventValue?: number;
    visible?: boolean;
    explored?: boolean; // Для тумана войны
  }>;
  fogOfWar?: {
    visibleCells: string[];
    exploredCells: string[];
  };
}

export class MapDataConverter {
  static convertToGrid(mapData: MapData): GridCell[][] {
    console.log('Преобразование данных карты:', mapData);
    console.log('FogOfWar данные:', mapData.fogOfWar);
    
    const gridSize = GRID_SIZE;
    const halfSize = Math.floor(gridSize / 2);
    const grid: GridCell[][] = [];
    
    // Создаем сеты для быстрой проверки видимости и исследованности
    const visibleCells = new Set(mapData.fogOfWar?.visibleCells || []);
    const exploredCells = new Set(mapData.fogOfWar?.exploredCells || []);
    
    // Если данных о тумане войны нет или они пустые, считаем все ячейки видимыми (обратная совместимость)
    const hasFogOfWarData = mapData.fogOfWar && mapData.fogOfWar.visibleCells && mapData.fogOfWar.exploredCells && 
      (mapData.fogOfWar.visibleCells.length > 0 || mapData.fogOfWar.exploredCells.length > 0);
    
    console.log('hasFogOfWarData:', hasFogOfWarData, 'visibleCells:', mapData.fogOfWar?.visibleCells?.length, 'exploredCells:', mapData.fogOfWar?.exploredCells?.length);
    
    // Создаем пустую сетку
    for (let y = 0; y < gridSize; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < gridSize; x++) {
        const cellX = mapData.centerX + (x - halfSize);
        const cellY = mapData.centerY + (y - halfSize);
        const cellKey = `${cellX},${cellY}`;
        
        // Если нет данных о тумане войны, считаем все ячейки видимыми
        const isVisible = hasFogOfWarData ? visibleCells.has(cellKey) : true;
        const isExplored = hasFogOfWarData ? exploredCells.has(cellKey) : true;
        
        row.push({
          x: cellX,
          y: cellY,
          event: {
            getType: () => 'EMPTY',
            getColor: () => this.getColorForEventType('EMPTY', isVisible, isExplored)
          },
          visible: isVisible,
          explored: isExplored
        });
      }
      grid.push(row);
    }
    
    // Заполняем сетку данными с сервера
    if (mapData.cells && Array.isArray(mapData.cells)) {
      for (const cell of mapData.cells) {
        const gridX = halfSize + (cell.x - mapData.centerX);
        const gridY = halfSize + (cell.y - mapData.centerY);
    
        
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
          const cellKey = `${cell.x},${cell.y}`;
          
          // Если нет данных о тумане войны, считаем все ячейки видимыми
          const isVisible = hasFogOfWarData ? visibleCells.has(cellKey) : true;
          const isExplored = hasFogOfWarData ? exploredCells.has(cellKey) : true;
          
          grid[gridY][gridX] = {
            x: cell.x,
            y: cell.y,
            event: {
              getType: () => cell.eventType || 'EMPTY',
              getColor: () => this.getColorForEventType(cell.eventType || 'EMPTY', isVisible, isExplored),
              getValue: () => cell.eventValue || 0
            },
            visible: isVisible,
            explored: isExplored
          };
        } else {
          console.warn(`Ячейка вне границ: gridX=${gridX}, gridY=${gridY}`);
        }
      }
    } else {
      console.warn('Отсутствуют данные о ячейках в mapData');
    }
    
    return grid;
  }
  
  private static getColorForEventType(eventType: string, isVisible: boolean = true, isExplored: boolean = false): number {
    // Если ячейка не исследована, возвращаем черный цвет (туман войны)
    if (!isExplored) {
      return 0x000000; // Черный цвет для неисследованных областей
    }
    
    // Если ячейка исследована, но не видна сейчас, затемняем цвет
    const baseColor = this.getBaseColorForEventType(eventType);
    if (!isVisible && isExplored) {
      // Применяем затемнение к исследованным, но не видимым ячейкам
      return this.darkenColor(baseColor, 0.5);
    }
    
    return baseColor;
  }
  
  private static getBaseColorForEventType(eventType: string): number {
    switch (eventType) {
      case 'EMPTY':
        return COLORS.EMPTY;
      case 'BONUS_STEPS':
        return COLORS.BONUS_STEPS;
      case 'DEBUFF_STEPS':
        return COLORS.DEBUFF_STEPS;
      case 'ENEMY':
        return COLORS.ENEMY;
      case 'UNKNOWN':
        return 0xAAAAAA; // Серый цвет для неизвестных
      default:
        console.log(`Неизвестный тип события: ${eventType}, используется EMPTY`);
        return COLORS.EMPTY;
    }
  }
  
  private static darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * factor);
    const g = Math.floor(((color >> 8) & 0xFF) * factor);
    const b = Math.floor((color & 0xFF) * factor);
    return (r << 16) | (g << 8) | b;
  }
}