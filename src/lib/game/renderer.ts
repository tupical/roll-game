// Модуль для отрисовки игровых элементов
import { Graphics, Container } from 'pixi.js';
import { CELL_SIZE, GRID_COLOR, PATH_COLOR, PLAYER_COLOR, STROKE_WIDTH, GRID_SIZE, Cell } from './constants';

// Интерфейс для стратегии отрисовки ячеек
export interface ICellRenderStrategy {
    renderCell(graphics: Graphics, cell: Cell, x: number, y: number): void;
}

// Стандартная стратегия отрисовки ячеек
export class DefaultCellRenderStrategy implements ICellRenderStrategy {
    renderCell(graphics: Graphics, cell: Cell, x: number, y: number): void {
        if (cell.event.getType() !== 'EMPTY') {
            // Новый API Pixi.js 8: сначала создаем фигуру, затем заливаем
            graphics.rect(
                x * CELL_SIZE + STROKE_WIDTH, 
                y * CELL_SIZE + STROKE_WIDTH, 
                CELL_SIZE - STROKE_WIDTH * 2, 
                CELL_SIZE - STROKE_WIDTH * 2
            );
            graphics.fill({ color: cell.event.getColor(), alpha: 0.7 });
        }
    }
}

export class Renderer {
    private cellEventsGraphics: Graphics;
    private gridGraphics: Graphics;
    private pathGraphics: Graphics;
    private playerGraphics: Graphics;
    private cellRenderStrategy: ICellRenderStrategy;

    constructor(
        private gameContainer: Container, 
        cellRenderStrategy?: ICellRenderStrategy
    ) {
        // Инициализация графических объектов
        this.cellEventsGraphics = new Graphics();
        this.gridGraphics = new Graphics();
        this.pathGraphics = new Graphics();
        this.playerGraphics = new Graphics();
        
        // Установка стратегии отрисовки ячеек
        this.cellRenderStrategy = cellRenderStrategy || new DefaultCellRenderStrategy();

        // Добавление графических объектов в контейнер
        this.gameContainer.addChild(this.cellEventsGraphics);
        this.gameContainer.addChild(this.gridGraphics);
        this.gameContainer.addChild(this.pathGraphics);
        this.gameContainer.addChild(this.playerGraphics);
    }

    // Метод для изменения стратегии отрисовки ячеек
    public setCellRenderStrategy(strategy: ICellRenderStrategy): void {
        this.cellRenderStrategy = strategy;
    }

    public drawCellEvents(gameBoard: Cell[][]): void {
        this.cellEventsGraphics.clear();
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = gameBoard[y][x];
                this.cellRenderStrategy.renderCell(this.cellEventsGraphics, cell, x, y);
            }
        }
    }

    public drawGrid(): void {
        this.gridGraphics.clear();
        this.gridGraphics.setStrokeStyle(STROKE_WIDTH);
        this.gridGraphics.stroke({ color: GRID_COLOR, alpha: 1 });
        
        for (let i = 0; i <= GRID_SIZE; i++) {
            // Вертикальные линии
            this.gridGraphics.moveTo(i * CELL_SIZE, 0);
            this.gridGraphics.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
            
            // Горизонтальные линии
            this.gridGraphics.moveTo(0, i * CELL_SIZE);
            this.gridGraphics.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        }
    }

    public drawPlayer(x: number, y: number): void {
        this.playerGraphics.clear();
        
        // Новый API Pixi.js 8: сначала создаем фигуру, затем заливаем
        this.playerGraphics.circle(
            x * CELL_SIZE + CELL_SIZE / 2, 
            y * CELL_SIZE + CELL_SIZE / 2, 
            CELL_SIZE / 3
        );
        this.playerGraphics.fill({ color: PLAYER_COLOR });
    }

    public drawPath(pathThisTurn: { x: number, y: number }[]): void {
        this.pathGraphics.clear();
        
        if (pathThisTurn.length > 0) {
            this.pathGraphics.setStrokeStyle(CELL_SIZE / 6);
            this.pathGraphics.stroke({ color: PATH_COLOR, alpha: 0.6 });
            
            this.pathGraphics.moveTo(
                pathThisTurn[0].x * CELL_SIZE + CELL_SIZE / 2, 
                pathThisTurn[0].y * CELL_SIZE + CELL_SIZE / 2
            );
            
            for (let i = 1; i < pathThisTurn.length; i++) {
                this.pathGraphics.lineTo(
                    pathThisTurn[i].x * CELL_SIZE + CELL_SIZE / 2, 
                    pathThisTurn[i].y * CELL_SIZE + CELL_SIZE / 2
                );
            }
        }
    }
}
