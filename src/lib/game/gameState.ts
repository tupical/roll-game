// Модуль для управления игровым состоянием
import { Cell, IPlayer } from './constants';

export class GameState implements IPlayer {
    private playerX: number = 0;
    private playerY: number = 0;
    private currentRoll: number = 0;
    private die1Value: number = 0;
    private die2Value: number = 0;
    private stepsTakenThisTurn: number = 0;
    private pathThisTurn: { x: number, y: number }[] = [];
    private nextTurnBonusSteps: number = 0;
    private turnsToSkip: number = 0;

    constructor() {}

    // Реализация интерфейса IPlayer
    public addBonusSteps(steps: number): void {
        this.nextTurnBonusSteps += steps;
    }

    public skipNextTurns(turns: number): void {
        this.turnsToSkip += turns;
    }

    // Геттеры
    public getPlayerPosition(): { x: number, y: number } {
        return { x: this.playerX, y: this.playerY };
    }

    public getCurrentRoll(): number {
        return this.currentRoll;
    }

    public getDiceValues(): { die1: number, die2: number } {
        return { die1: this.die1Value, die2: this.die2Value };
    }

    public getStepsTaken(): number {
        return this.stepsTakenThisTurn;
    }

    public getStepsLeft(): number {
        return this.currentRoll - this.stepsTakenThisTurn;
    }

    public getPath(): { x: number, y: number }[] {
        return this.pathThisTurn;
    }

    public getTurnsToSkip(): number {
        return this.turnsToSkip;
    }

    public canMove(): boolean {
        return this.currentRoll > 0 && this.stepsTakenThisTurn < this.currentRoll && this.turnsToSkip === 0;
    }

    // Методы для изменения состояния
    public rollDice(): { total: number, die1: number, die2: number } {
        this.die1Value = Math.floor(Math.random() * 6) + 1;
        this.die2Value = Math.floor(Math.random() * 6) + 1;
        return { 
            total: this.die1Value + this.die2Value,
            die1: this.die1Value,
            die2: this.die2Value
        };
    }

    public startTurn(): { skippingTurn: boolean } {
        if (this.turnsToSkip > 0) {
            this.turnsToSkip--;
            this.currentRoll = 0;
            this.die1Value = 0;
            this.die2Value = 0;
            this.stepsTakenThisTurn = 0;
            this.pathThisTurn = [];
            return { skippingTurn: true };
        }

        const diceRoll = this.rollDice();
        this.currentRoll = diceRoll.total + this.nextTurnBonusSteps;
        if (this.currentRoll < 1) this.currentRoll = 1; // Minimum 1 step
        this.nextTurnBonusSteps = 0; // Reset bonus
        this.stepsTakenThisTurn = 0;
        this.pathThisTurn = [{ x: this.playerX, y: this.playerY }];
        
        return { skippingTurn: false };
    }

    public movePlayer(dx: number, dy: number, gameBoard: Cell[][]): { 
        moved: boolean, 
        newPosition?: { x: number, y: number },
        message?: string
    } {
        if (!this.canMove()) {
            return { moved: false };
        }

        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        // Проверка границ
        if (newX < 0 || newX >= gameBoard[0].length || newY < 0 || newY >= gameBoard.length) {
            return { moved: false, message: "Нельзя выйти за пределы поля." };
        }

        // Проверка, не посещали ли уже эту клетку в текущем ходу
        if (this.pathThisTurn.some(pos => pos.x === newX && pos.y === newY)) {
            return { moved: false, message: "Нельзя вставать на уже пройденную ячейку в этом ходу." };
        }

        // Перемещение игрока
        this.playerX = newX;
        this.playerY = newY;
        this.stepsTakenThisTurn++;
        this.pathThisTurn.push({ x: this.playerX, y: this.playerY });
        
        return { 
            moved: true, 
            newPosition: { x: this.playerX, y: this.playerY }
        };
    }

    public triggerCellEvent(cell: Cell): { message: string } {
        // Используем контракт события для взаимодействия с игроком
        const message = cell.event.interact(this);
        return { message: `Событие: ${message}` };
    }

    public endTurn(): void {
        this.currentRoll = 0;
    }
}
