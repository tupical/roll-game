// Модуль для работы с игровым полем
import { Cell, CellEvent, GRID_SIZE, CellEventFactory, ICellEvent } from './constants';

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
    private board: Cell[][] = [];
    private eventGenerationStrategy: IBoardEventGenerationStrategy;

    constructor(strategy?: IBoardEventGenerationStrategy) {
        this.eventGenerationStrategy = strategy || new DefaultEventGenerationStrategy();
        this.initialize();
    }

    public getBoard(): Cell[][] {
        return this.board;
    }

    public getCell(x: number, y: number): Cell {
        return this.board[y][x];
    }

    // Метод для изменения стратегии генерации событий
    public setEventGenerationStrategy(strategy: IBoardEventGenerationStrategy): void {
        this.eventGenerationStrategy = strategy;
    }

    // Метод для пересоздания игрового поля с текущей стратегией
    public regenerateBoard(): void {
        this.initialize();
    }

    private initialize(): void {
        this.board = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                // Используем стратегию для генерации события
                const event = this.eventGenerationStrategy.generateEvent(x, y);
                row.push({ x, y, event });
            }
            this.board.push(row);
        }
    }
}
