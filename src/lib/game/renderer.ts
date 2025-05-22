// Модуль для отрисовки игровых элементов
import { Graphics, Container } from 'pixi.js';
import { 
    CELL_SIZE, 
    GRID_COLOR, 
    PATH_COLOR, 
    PLAYER_COLOR, 
    STROKE_WIDTH, 
    GRID_SIZE, 
    Cell, 
    FOG_COLOR,
    FOG_ALPHA
} from './constants';

// Интерфейс для стратегии отрисовки ячеек
export interface ICellRenderStrategy {
    renderCell(graphics: Graphics, cell: Cell, screenX: number, screenY: number): void;
}

// Стандартная стратегия отрисовки ячеек с поддержкой тумана войны
export class FogOfWarCellRenderStrategy implements ICellRenderStrategy {
    renderCell(graphics: Graphics, cell: Cell, screenX: number, screenY: number): void {
        // Если ячейка никогда не была видна, рисуем туман войны
        if (cell.visible === undefined || cell.visible === false) {
            graphics.rect(
                screenX * CELL_SIZE, 
                screenY * CELL_SIZE, 
                CELL_SIZE, 
                CELL_SIZE
            );
            graphics.fill({ color: FOG_COLOR, alpha: FOG_ALPHA });
            return;
        }
        
        // Если ячейка видна и не пустая, рисуем её содержимое
        if (cell.event.getType() !== 'EMPTY') {
            graphics.rect(
                screenX * CELL_SIZE + STROKE_WIDTH, 
                screenY * CELL_SIZE + STROKE_WIDTH, 
                CELL_SIZE - STROKE_WIDTH * 2, 
                CELL_SIZE - STROKE_WIDTH * 2
            );
            graphics.fill({ color: cell.event.getColor(), alpha: 0.7 });
        }
    }
}

export class Renderer {
    private cellEventsGraphics: Graphics;
    private fogGraphics: Graphics;
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
        this.fogGraphics = new Graphics();
        this.gridGraphics = new Graphics();
        this.pathGraphics = new Graphics();
        this.playerGraphics = new Graphics();
        
        // Установка стратегии отрисовки ячеек
        this.cellRenderStrategy = cellRenderStrategy || new FogOfWarCellRenderStrategy();

        // Добавление графических объектов в контейнер
        this.gameContainer.addChild(this.cellEventsGraphics);
        this.gameContainer.addChild(this.fogGraphics);
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
        this.fogGraphics.clear();
        
        for (let screenY = 0; screenY < GRID_SIZE; screenY++) {
            for (let screenX = 0; screenX < GRID_SIZE; screenX++) {
                const cell = gameBoard[screenY][screenX];
                this.cellRenderStrategy.renderCell(this.cellEventsGraphics, cell, screenX, screenY);
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

    public drawPlayer(worldX: number, worldY: number): void {
        this.playerGraphics.clear();
        
        // Игрок всегда в центре видимой области
        const centerScreenPos = Math.floor(GRID_SIZE / 2);
        
        // Новый API Pixi.js 8: сначала создаем фигуру, затем заливаем
        this.playerGraphics.circle(
            centerScreenPos * CELL_SIZE + CELL_SIZE / 2, 
            centerScreenPos * CELL_SIZE + CELL_SIZE / 2, 
            CELL_SIZE / 3
        );
        this.playerGraphics.fill({ color: PLAYER_COLOR });
    }

    public drawPath(pathThisTurn: { x: number, y: number }[]): void {
        this.pathGraphics.clear();
        
        if (pathThisTurn.length <= 1) return;
        
        const centerScreenPos = Math.floor(GRID_SIZE / 2);
        const playerWorldX = pathThisTurn[pathThisTurn.length - 1].x;
        const playerWorldY = pathThisTurn[pathThisTurn.length - 1].y;
        
        this.pathGraphics.setStrokeStyle(CELL_SIZE / 6);
        this.pathGraphics.stroke({ color: PATH_COLOR, alpha: 0.6 });
        
        // Начинаем с первой точки пути
        const firstPoint = pathThisTurn[0];
        // Преобразуем мировые координаты в экранные
        const firstScreenX = centerScreenPos + (firstPoint.x - playerWorldX);
        const firstScreenY = centerScreenPos + (firstPoint.y - playerWorldY);
        
        this.pathGraphics.moveTo(
            firstScreenX * CELL_SIZE + CELL_SIZE / 2, 
            firstScreenY * CELL_SIZE + CELL_SIZE / 2
        );
        
        // Рисуем линии ко всем остальным точкам пути
        for (let i = 1; i < pathThisTurn.length; i++) {
            const point = pathThisTurn[i];
            // Преобразуем мировые координаты в экранные
            const screenX = centerScreenPos + (point.x - playerWorldX);
            const screenY = centerScreenPos + (point.y - playerWorldY);
            
            this.pathGraphics.lineTo(
                screenX * CELL_SIZE + CELL_SIZE / 2, 
                screenY * CELL_SIZE + CELL_SIZE / 2
            );
        }
    }
}
