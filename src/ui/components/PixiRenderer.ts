import { Application, Container, Graphics, Color } from 'pixi.js';
import { IRenderer } from '../interfaces/ui.interfaces';
import { CELL_SIZE, GRID_SIZE, APP_WIDTH, APP_HEIGHT } from '../../utils/types';

export class PixiRenderer implements IRenderer {
  private app: Application | null = null;
  private gameContainer: Container | null = null;
  private playerSprite: Container | null = null;
  private pathContainer: Container | null = null;
  private gridContainer: Container | null = null;
  private diceContainer: Container | null = null;
  private die1Sprite: Container | null = null;
  private die2Sprite: Container | null = null;

  async initialize(container: HTMLElement): Promise<void> {
    try {
      this.app = new Application();

      await this.app.init({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        backgroundColor: new Color(0x333333).toHex(),
        antialias: true,
      });

      if (container.querySelector('canvas')) {
        container.removeChild(container.querySelector('canvas') as HTMLCanvasElement);
      }
      
      container.appendChild(this.app.canvas as HTMLCanvasElement);
      this.createContainers();
      this.initializeDice();
    } catch (error) {
      console.error('Error initializing Pixi renderer:', error);
      throw error;
    }
  }

  private createContainers(): void {
    if (!this.app?.stage) {
      throw new Error('Pixi application not initialized');
    }

    this.gameContainer = new Container();
    this.gridContainer = new Container();
    this.pathContainer = new Container();
    this.playerSprite = new Container();
    this.diceContainer = new Container();
    
    this.app.stage.addChild(this.gameContainer);
    this.gameContainer.addChild(this.gridContainer);
    this.gameContainer.addChild(this.pathContainer);
    this.gameContainer.addChild(this.playerSprite);
  }

  private initializeDice(): void {
    if (!this.gameContainer || !this.diceContainer) return;
    
    this.diceContainer.x = 10;
    this.diceContainer.y = APP_HEIGHT - 100;
    this.gameContainer.addChild(this.diceContainer);
    
    this.die1Sprite = new Container();
    this.die1Sprite.visible = false;
    this.diceContainer.addChild(this.die1Sprite);
    
    this.die2Sprite = new Container();
    this.die2Sprite.x = 50;
    this.die2Sprite.visible = false;
    this.diceContainer.addChild(this.die2Sprite);
  }

  drawGrid(): void {
    if (!this.gridContainer) return;
    
    this.gridContainer.removeChildren();
    const graphics = new Graphics();
    
    const offsetX = (APP_WIDTH - GRID_SIZE * CELL_SIZE) / 2;
    const offsetY = (APP_HEIGHT - GRID_SIZE * CELL_SIZE) / 2;
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellX = offsetX + x * CELL_SIZE;
        const cellY = offsetY + y * CELL_SIZE;
        
        graphics.rect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        graphics.fill({ color: 0x333333 });
        graphics.stroke({ width: 1, color: 0x888888 });
      }
    }
    
    this.gridContainer.addChild(graphics);
  }

  drawCellEvents(grid: any[][]): void {
    if (!this.gridContainer) return;
    
    this.gridContainer.removeChildren();
    const graphics = new Graphics();
    
    const offsetX = (APP_WIDTH - GRID_SIZE * CELL_SIZE) / 2;
    const offsetY = (APP_HEIGHT - GRID_SIZE * CELL_SIZE) / 2;
    
    // Подсчитываем статистику для отладки
    let visibleCount = 0;
    let exploredCount = 0;
    let eventsVisible = 0;
    let eventsExplored = 0;
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const cellX = offsetX + x * CELL_SIZE;
        const cellY = offsetY + y * CELL_SIZE;

        // Рисуем базовую ячейку
        graphics.rect(cellX, cellY, CELL_SIZE, CELL_SIZE);

        // Показываем ячейку если она видна сейчас ИЛИ была исследована ранее
        if (cell.visible || cell.explored) {
          // Статистика для отладки
          if (cell.visible) visibleCount++;
          if (cell.explored) exploredCount++;

          const color = cell.event.getColor();
          graphics.fill({ color });

          // Добавляем маркер для событий если они есть
          const eventType = cell.event.getType();
          if (eventType !== 'EMPTY') {
            // Для видимых ячеек - яркий маркер, для исследованных - затемнённый
            let markerColor, strokeColor;
            if (cell.visible) {
              markerColor = 0xFFFFFF;
              strokeColor = 0x000000;
            } else if (cell.explored) {
              markerColor = 0x555555;
              strokeColor = 0x222222;
            }
            graphics.circle(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 8);
            graphics.fill({ color: markerColor });
            graphics.circle(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 8);
            graphics.stroke({ width: 2, color: strokeColor });
          }
        } else {
          // Неисследованные области остаются в тумане
          graphics.fill({ color: 0x333333 });
        }

        graphics.rect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        graphics.stroke({ width: 1, color: 0x888888 });
      }
    }
    
    // Выводим статистику для отладки
    console.log(`Отладка рендера: видимые=${visibleCount}, исследованные=${exploredCount}, события видимые=${eventsVisible}, события исследованные=${eventsExplored}`);
    
    // Для отладки: выводим координаты центра, размеры сетки и fogOfWar
    if (grid.length && grid[0].length) {
      const minX = Math.min(...grid[0].map(cell => cell.x));
      const maxX = Math.max(...grid[0].map(cell => cell.x));
      const minY = Math.min(...grid.map(row => row[0].y));
      const maxY = Math.max(...grid.map(row => row[0].y));
      console.log('[DEBUG] Grid X:', minX, '-', maxX, 'Y:', minY, '-', maxY);
    }
    if (grid.length && grid[0].length && grid[0][0] && grid[0][0].explored !== undefined) {
      const exploredCells = grid.flat().filter(cell => cell.explored).map(cell => `${cell.x},${cell.y}`);
      const visibleCells = grid.flat().filter(cell => cell.visible).map(cell => `${cell.x},${cell.y}`);
      console.log('[DEBUG] Explored cells:', exploredCells);
      console.log('[DEBUG] Visible cells:', visibleCells);
    }
    
    this.gridContainer.addChild(graphics);
  }

  drawPlayer(x: number, y: number): void {
    if (!this.playerSprite) return;
    
    this.playerSprite.removeChildren();
    const graphics = new Graphics();
    
    const offsetX = (APP_WIDTH - GRID_SIZE * CELL_SIZE) / 2;
    const offsetY = (APP_HEIGHT - GRID_SIZE * CELL_SIZE) / 2;
    const halfSize = Math.floor(GRID_SIZE / 2);
    
    const screenX = offsetX + halfSize * CELL_SIZE;
    const screenY = offsetY + halfSize * CELL_SIZE;
    
    // Рисуем игрока как синий круг в центре ячейки
    graphics.circle(screenX + CELL_SIZE / 2, screenY + CELL_SIZE / 2, CELL_SIZE / 3);
    graphics.fill({ color: 0x0000FF });
    graphics.circle(screenX + CELL_SIZE / 2, screenY + CELL_SIZE / 2, CELL_SIZE / 3);
    graphics.stroke({ width: 2, color: 0xFFFFFF });
    
    this.playerSprite.addChild(graphics);
  }

  drawPath(path: { x: number, y: number }[]): void {
    if (!this.pathContainer || path.length === 0) return;
    
    this.pathContainer.removeChildren();
    const graphics = new Graphics();
    
    const offsetX = (APP_WIDTH - GRID_SIZE * CELL_SIZE) / 2;
    const offsetY = (APP_HEIGHT - GRID_SIZE * CELL_SIZE) / 2;
    const halfSize = Math.floor(GRID_SIZE / 2);
    
    // Получаем текущую позицию игрока (последняя точка в пути)
    const currentPos = path[path.length - 1];
    
    graphics.moveTo(0, 0); // Начинаем путь
    
    for (let i = 0; i < path.length - 1; i++) {
      const point = path[i];
      const nextPoint = path[i + 1];
      
      // Вычисляем относительные позиции от текущего положения игрока
      const relX = point.x - currentPos.x;
      const relY = point.y - currentPos.y;
      const nextRelX = nextPoint.x - currentPos.x;
      const nextRelY = nextPoint.y - currentPos.y;
      
      const screenX = offsetX + (halfSize + relX) * CELL_SIZE + CELL_SIZE / 2;
      const screenY = offsetY + (halfSize + relY) * CELL_SIZE + CELL_SIZE / 2;
      const nextScreenX = offsetX + (halfSize + nextRelX) * CELL_SIZE + CELL_SIZE / 2;
      const nextScreenY = offsetY + (halfSize + nextRelY) * CELL_SIZE + CELL_SIZE / 2;
      
      // Рисуем линию
      graphics.moveTo(screenX, screenY);
      graphics.lineTo(nextScreenX, nextScreenY);
      graphics.stroke({ width: 3, color: 0xFFFFFF });
      
      // Рисуем точки пути
      graphics.circle(screenX, screenY, 4);
      graphics.fill({ color: 0xFFFFFF });
    }
    
    this.pathContainer.addChild(graphics);
  }

  updateDiceDisplay(die1Value: number, die2Value: number): void {
    if (!this.die1Sprite || !this.die2Sprite) return;
    
    this.die1Sprite.removeChildren();
    this.die2Sprite.removeChildren();
    
    // Рисуем первый кубик
    const die1Graphics = new Graphics();
    die1Graphics.rect(0, 0, 40, 40);
    die1Graphics.fill({ color: 0xFFFFFF });
    die1Graphics.stroke({ width: 2, color: 0x000000 });
    this.die1Sprite.addChild(die1Graphics);
    this.die1Sprite.visible = true;
    
    // Рисуем второй кубик
    const die2Graphics = new Graphics();
    die2Graphics.rect(0, 0, 40, 40);
    die2Graphics.fill({ color: 0xFFFFFF });
    die2Graphics.stroke({ width: 2, color: 0x000000 });
    this.die2Sprite.addChild(die2Graphics);
    this.die2Sprite.visible = true;
  }

  cleanup(): void {
    try {
      if (this.app) {
        this.app.destroy();
        this.app = null;
      }
      
      this.gameContainer = null;
      this.playerSprite = null;
      this.pathContainer = null;
      this.gridContainer = null;
      this.diceContainer = null;
      this.die1Sprite = null;
      this.die2Sprite = null;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}