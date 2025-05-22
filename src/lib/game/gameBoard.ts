// Модуль для работы с игровым полем
import { Cell, CellEvent, GRID_SIZE, CellEventFactory, ICellEvent, WorldCoord, VISIBLE_RADIUS } from './constants';

// Интерфейс для стратегии генерации событий
export interface IBoardEventGenerationStrategy {
    generateEvent(x: number, y: number): ICellEvent;
}

// Конкретная реализация стратегии генерации событий
export class DefaultEventGenerationStrategy implements IBoardEventGenerationStrategy {
    generateEvent(x: number, y: number): ICellEvent {
        // Стартовая клетка всегда пустая
        if (x === 0 && y === 0) {
            return CellEventFactory.createEvent(CellEvent.EMPTY);
        } 
        // Бонусные клетки
        else if ((x + y) % 7 === 0 && Math.random() > 0.3) {
            return CellEventFactory.createEvent(CellEvent.BONUS_STEPS, 2);
        } 
        // Дебаффные клетки
        else if ((x + y) % 5 === 0 && Math.random() > 0.3) {
            return CellEventFactory.createEvent(CellEvent.DEBUFF_STEPS, -2);
        } 
        // Клетки с врагами
        else if ((x * y) % 11 === 0 && x > 0 && y > 0 && Math.random() > 0.5) {
            return CellEventFactory.createEvent(CellEvent.ENEMY, 1);
        } 
        // Пустые клетки по умолчанию
        else {
            return CellEventFactory.createEvent(CellEvent.EMPTY);
        }
    }
}

export class GameBoard {
    private board: Map<string, Cell> = new Map(); // Хранение ячеек по ключу "x,y"
    private visibleCells: Set<string> = new Set(); // Множество видимых ячеек
    private eventGenerationStrategy: IBoardEventGenerationStrategy;
    private centerX: number = 0; // Центр видимой области по X
    private centerY: number = 0; // Центр видимой области по Y

    constructor(strategy?: IBoardEventGenerationStrategy) {
        this.eventGenerationStrategy = strategy || new DefaultEventGenerationStrategy();
        this.initialize();
    }

    // Получение всех ячеек для отображения
    public getBoard(): Cell[][] {
        const result: Cell[][] = [];
        const halfSize = Math.floor(GRID_SIZE / 2);
        
        // Создаем двумерный массив для отображения
        for (let y = 0; y < GRID_SIZE; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                // Преобразуем координаты экрана в мировые координаты
                const worldX = this.centerX + (x - halfSize);
                const worldY = this.centerY + (y - halfSize);
                
                // Получаем ячейку из хранилища или генерируем новую
                const cell = this.getOrCreateCell(worldX, worldY);
                row.push(cell);
            }
            result.push(row);
        }
        
        return result;
    }

    // Получение конкретной ячейки по мировым координатам
    public getCell(worldX: number, worldY: number): Cell {
        return this.getOrCreateCell(worldX, worldY);
    }

    // Обновление центра видимой области (при движении игрока)
    public updateCenter(worldX: number, worldY: number): void {
        this.centerX = worldX;
        this.centerY = worldY;
        this.updateVisibility(worldX, worldY);
    }

    // Метод для изменения стратегии генерации событий
    public setEventGenerationStrategy(strategy: IBoardEventGenerationStrategy): void {
        this.eventGenerationStrategy = strategy;
    }

    // Получение ячейки из хранилища или создание новой
    private getOrCreateCell(x: number, y: number): Cell {
        const key = `${x},${y}`;
        
        if (!this.board.has(key)) {
            // Создаем новую ячейку
            const event = this.eventGenerationStrategy.generateEvent(x, y);
            const cell: Cell = { 
                x, 
                y, 
                event,
                visible: this.visibleCells.has(key)
            };
            this.board.set(key, cell);
        }
        
        return this.board.get(key)!;
    }

    // Обновление видимости ячеек
    private updateVisibility(playerX: number, playerY: number): void {
        // Обновляем видимость для всех ячеек в радиусе видимости
        for (let y = playerY - VISIBLE_RADIUS; y <= playerY + VISIBLE_RADIUS; y++) {
            for (let x = playerX - VISIBLE_RADIUS; x <= playerX + VISIBLE_RADIUS; x++) {
                // Проверяем, находится ли ячейка в радиусе видимости
                if (Math.abs(x - playerX) + Math.abs(y - playerY) <= VISIBLE_RADIUS * 1.5) {
                    const key = `${x},${y}`;
                    this.visibleCells.add(key);
                    
                    // Если ячейка уже существует, обновляем её видимость
                    const cell = this.board.get(key);
                    if (cell) {
                        cell.visible = true;
                    }
                }
            }
        }
    }

    // Инициализация начального состояния
    private initialize(): void {
        // Создаем начальную область вокруг игрока
        this.updateVisibility(0, 0);
    }
}
