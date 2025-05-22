// Интеграция игры в React-компонент
import { Application, Container, Text, Sprite, Assets } from 'pixi.js';
import { GameBoard } from './gameBoard';
import { GameState } from './gameState';
import { Renderer } from './renderer';
import { InputHandler } from './inputHandler';
import { APP_WIDTH, APP_HEIGHT } from './constants';

export class Game {
    private app: Application;
    private gameContainer!: Container;
    private gameBoard: GameBoard;
    private gameState: GameState;
    private renderer!: Renderer;
    private inputHandler!: InputHandler;
    
    // UI элементы
    private instructionText!: Text;
    private eventText!: Text;
    private diceContainer!: Container;
    private die1Sprite!: Sprite;
    private die2Sprite!: Sprite;
    private stepsLeftText!: Text;
    private isInitialized: boolean = false;

    constructor() {
        this.app = new Application();
        this.gameState = new GameState();
        this.gameBoard = new GameBoard();
    }

    public async init(canvasContainer: HTMLElement): Promise<void> {
        if (this.isInitialized) return;
        
        // Инициализация Pixi.js приложения
        await this.app.init({
            width: APP_WIDTH,
            height: APP_HEIGHT,
            backgroundColor: 0x1099bb,
            antialias: true,
        });
        
        // Добавляем canvas в DOM
        canvasContainer.appendChild(this.app.canvas);

        // Создание игрового контейнера
        this.gameContainer = new Container();
        this.app.stage.addChild(this.gameContainer);

        // Инициализация рендерера
        this.renderer = new Renderer(this.gameContainer);

        // Загрузка текстур кубиков
        await this.loadDiceTextures();

        // Создание UI элементов
        this.createUI();

        // Инициализация обработчика ввода с передачей gameBoard
        this.inputHandler = new InputHandler(
            this.gameState, 
            this.gameBoard, 
            (action) => this.update(action)
        );

        // Первоначальная отрисовка
        this.renderer.drawCellEvents(this.gameBoard.getBoard());
        this.renderer.drawGrid();
        this.updatePlayerAndPath();

        this.isInitialized = true;
        console.log('Игра инициализирована. Нажмите R чтобы бросить кубики и используйте стрелки для перемещения.');
    }

    // Публичный метод для обработки нажатий клавиш из React-компонента
    public handleKeyDown(event: KeyboardEvent): void {
        if (!this.isInitialized || !this.inputHandler) return;
        
        this.inputHandler.handleKeyDown(event);
    }

    public cleanup(): void {
        if (!this.isInitialized) return;
        
        // Удаляем обработчики событий и очищаем ресурсы
        this.app.destroy();
        this.isInitialized = false;
    }

    private async loadDiceTextures(): Promise<void> {
        try {
            // Загружаем текстуры для кубиков
            for (let i = 1; i <= 6; i++) {
                await Assets.load(`/src/assets/dice/${i}.png`);
            }
            console.log('Текстуры кубиков загружены');
        } catch (error) {
            console.error('Ошибка загрузки текстур кубиков:', error);
        }
    }

    private createUI(): void {
        // Текст с инструкциями
        this.instructionText = new Text({ 
            text: "Нажмите 'R' чтобы бросить кубики", 
            style: { 
                fontFamily: 'Arial', 
                fontSize: 18, 
                fill: 0xffffff, 
                wordWrap: true, 
                wordWrapWidth: APP_WIDTH - 20 
            } 
        });
        this.instructionText.x = 10;
        this.instructionText.y = APP_HEIGHT - 130;
        this.gameContainer.addChild(this.instructionText);

        // Контейнер для кубиков
        this.diceContainer = new Container();
        this.diceContainer.x = 10;
        this.diceContainer.y = APP_HEIGHT - 100;
        this.gameContainer.addChild(this.diceContainer);

        // Создаем спрайты для кубиков
        this.die1Sprite = Sprite.from('/src/assets/dice/1.png');
        this.die1Sprite.width = 40;
        this.die1Sprite.height = 40;
        this.die1Sprite.visible = false;
        this.diceContainer.addChild(this.die1Sprite);

        this.die2Sprite = Sprite.from('/src/assets/dice/1.png');
        this.die2Sprite.width = 40;
        this.die2Sprite.height = 40;
        this.die2Sprite.x = 50;
        this.die2Sprite.visible = false;
        this.diceContainer.addChild(this.die2Sprite);

        // Текст для отображения оставшихся шагов
        this.stepsLeftText = new Text({ 
            text: "Шагов осталось: 0", 
            style: { 
                fontFamily: 'Arial', 
                fontSize: 18, 
                fill: 0xffffff 
            } 
        });
        this.stepsLeftText.x = 110;
        this.stepsLeftText.y = APP_HEIGHT - 85;
        this.gameContainer.addChild(this.stepsLeftText);

        // Текст для отображения событий
        this.eventText = new Text({ 
            text: "Событие: -", 
            style: { 
                fontFamily: 'Arial', 
                fontSize: 18, 
                fill: 0xffffff, 
                wordWrap: true, 
                wordWrapWidth: APP_WIDTH - 20 
            } 
        });
        this.eventText.x = 10;
        this.eventText.y = APP_HEIGHT - 50;
        this.gameContainer.addChild(this.eventText);
    }

    private update(action: 'roll' | 'move'): void {
        // Обработка броска кубиков
        if (action === 'roll') {
            const turnResult = this.gameState.startTurn();
            
            if (turnResult.skippingTurn) {
                this.instructionText.text = `Вы пропускаете ход! Осталось пропустить: ${this.gameState.getTurnsToSkip()}. Нажмите 'R'.`;
                this.eventText.text = "Событие: Пропуск хода";
                this.stepsLeftText.text = "Шагов осталось: 0";
                this.die1Sprite.visible = false;
                this.die2Sprite.visible = false;
            } else {
                // Обновляем инструкцию вместо отображения выпавшего числа
                this.instructionText.text = "Двигайтесь стрелками";
                this.eventText.text = "Событие: -";
                this.stepsLeftText.text = `Шагов осталось: ${this.gameState.getStepsLeft()}`;
                
                // Обновляем отображение кубиков
                const diceValues = this.gameState.getDiceValues();
                this.updateDiceDisplay(diceValues.die1, diceValues.die2);
            }
        } 
        // Обработка движения игрока
        else if (action === 'move') {
            const playerPos = this.gameState.getPlayerPosition();
            
            // Обновляем центр игрового поля при движении игрока
            this.gameBoard.updateCenter(playerPos.x, playerPos.y);
            
            // Обновляем UI после движения
            this.stepsLeftText.text = `Шагов осталось: ${this.gameState.getStepsLeft()}`;
            
            // Проверка события на клетке
            const cell = this.gameBoard.getCell(playerPos.x, playerPos.y);
            const eventResult = this.gameState.triggerCellEvent(cell);
            this.eventText.text = eventResult.message;
            
            // Перерисовываем поле с учетом новой видимости
            this.renderer.drawCellEvents(this.gameBoard.getBoard());
            
            // Проверка окончания хода
            if (this.gameState.getStepsTaken() >= this.gameState.getCurrentRoll()) {
                this.gameState.endTurn();
                this.instructionText.text = "Ход закончен. Нажмите 'R' для следующего броска.";
            }
        }
        
        // Обновление отображения игрока и пути
        this.updatePlayerAndPath();
    }

    private updateDiceDisplay(die1Value: number, die2Value: number): void {
        // Обновляем текстуры кубиков
        this.die1Sprite.texture = Assets.get(`/src/assets/dice/${die1Value}.png`);
        this.die2Sprite.texture = Assets.get(`/src/assets/dice/${die2Value}.png`);
        
        // Делаем кубики видимыми
        this.die1Sprite.visible = true;
        this.die2Sprite.visible = true;
    }

    private updatePlayerAndPath(): void {
        const playerPos = this.gameState.getPlayerPosition();
        this.renderer.drawPlayer(playerPos.x, playerPos.y);
        this.renderer.drawPath(this.gameState.getPath());
    }
}
