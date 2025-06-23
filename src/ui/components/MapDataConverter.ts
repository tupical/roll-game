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
}

export interface MapData {
  centerX: number;
  centerY: number;
  cells?: Array<{
    x: number;
    y: number;
    eventType?: string;
    eventValue?: number;
  }>;
}

export class MapDataConverter {
  static convertToGrid(mapData: MapData): GridCell[][] {
    console.log('Преобразование данных карты:', mapData);
    
    const gridSize = GRID_SIZE;
    const halfSize = Math.floor(gridSize / 2);
    const grid: GridCell[][] = [];
    
    // Создаем пустую сетку
    for (let y = 0; y < gridSize; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < gridSize; x++) {
        row.push({
          x: mapData.centerX + (x - halfSize),
          y: mapData.centerY + (y - halfSize),
          event: {
            getType: () => 'EMPTY',
            getColor: () => COLORS.EMPTY
          },
          visible: false
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
          grid[gridY][gridX] = {
            x: cell.x,
            y: cell.y,
            event: {
              getType: () => cell.eventType || 'EMPTY',
              getColor: () => this.getColorForEventType(cell.eventType || 'EMPTY'),
              getValue: () => cell.eventValue || 0
            },
            visible: true
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
  
  private static getColorForEventType(eventType: string): number {
    switch (eventType) {
      case 'EMPTY':
        return COLORS.EMPTY;
      case 'BONUS_STEPS':
        return COLORS.BONUS_STEPS;
      case 'DEBUFF_STEPS':
        return COLORS.DEBUFF_STEPS;
      case 'ENEMY':
        return COLORS.ENEMY;
      default:
        console.log(`Неизвестный тип события: ${eventType}, используется EMPTY`);
        return COLORS.EMPTY;
    }
  }
}