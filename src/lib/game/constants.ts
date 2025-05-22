// Модуль с константами и интерфейсами
export enum CellEvent {
    EMPTY = 'EMPTY',
    BONUS_STEPS = 'BONUS_STEPS',
    DEBUFF_STEPS = 'DEBUFF_STEPS',
    ENEMY = 'ENEMY'
}

// Интерфейс для игрока, с которым будут взаимодействовать события
export interface IPlayer {
    addBonusSteps(steps: number): void;
    skipNextTurns(turns: number): void;
}

// Интерфейс для контракта события ячейки
export interface ICellEvent {
    interact(player: IPlayer): string;
    getType(): CellEvent;
    getColor(): number;
}

export interface Cell {
    x: number;
    y: number;
    event: ICellEvent;
    visible?: boolean; // Флаг видимости ячейки (для тумана войны)
}

// Константы для игрового поля
export const GRID_SIZE = 21; // Нечетное число для центрирования игрока
export const VISIBLE_RADIUS = 3; // Радиус видимости вокруг игрока
export const CELL_SIZE = 50;
export const PLAYER_COLOR = 0x00FF00;
export const GRID_COLOR = 0xFFFFFF;
export const PATH_COLOR = 0x0000FF;
export const FOG_COLOR = 0x333333; // Цвет тумана войны
export const FOG_ALPHA = 0.7; // Прозрачность тумана войны
export const STROKE_WIDTH = 1;
export const APP_WIDTH = GRID_SIZE * CELL_SIZE;
export const APP_HEIGHT = GRID_SIZE * CELL_SIZE + 150;

// Координаты для бесконечного поля
export interface WorldCoord {
    x: number;
    y: number;
}

// Базовый класс для событий ячеек
export abstract class BaseCellEvent implements ICellEvent {
    constructor(protected type: CellEvent, protected color: number) {}
    
    abstract interact(player: IPlayer): string;
    
    getType(): CellEvent {
        return this.type;
    }
    
    getColor(): number {
        return this.color;
    }
}

// Конкретные реализации событий
export class EmptyCellEvent extends BaseCellEvent {
    constructor() {
        super(CellEvent.EMPTY, 0xCCCCCC);
    }
    
    interact(_player: IPlayer): string {
        return "Пустая клетка.";
    }
}

export class BonusStepsCellEvent extends BaseCellEvent {
    constructor(private bonusSteps: number) {
        super(CellEvent.BONUS_STEPS, 0x00FF00);
    }
    
    interact(player: IPlayer): string {
        player.addBonusSteps(this.bonusSteps);
        return `Бонус! +${this.bonusSteps} шагов на след. ход.`;
    }
    
    getBonusSteps(): number {
        return this.bonusSteps;
    }
}

export class DebuffStepsCellEvent extends BaseCellEvent {
    constructor(private debuffSteps: number) {
        super(CellEvent.DEBUFF_STEPS, 0xFF0000);
    }
    
    interact(player: IPlayer): string {
        player.addBonusSteps(this.debuffSteps); // debuffSteps должен быть отрицательным
        return `Дебафф! ${this.debuffSteps} шагов на след. ход.`;
    }
    
    getDebuffSteps(): number {
        return this.debuffSteps;
    }
}

export class EnemyCellEvent extends BaseCellEvent {
    constructor(private turnsToSkip: number = 1) {
        super(CellEvent.ENEMY, 0xFF00FF);
    }
    
    interact(player: IPlayer): string {
        player.skipNextTurns(this.turnsToSkip);
        return `Враг! Вы пропускаете следующий ход.`;
    }
    
    getTurnsToSkip(): number {
        return this.turnsToSkip;
    }
}

// Интерфейс для создателя событий
export interface ICellEventCreator {
    createEvent(value?: number): ICellEvent;
}

// Конкретные реализации создателей событий
export class EmptyCellEventCreator implements ICellEventCreator {
    createEvent(): ICellEvent {
        return new EmptyCellEvent();
    }
}

export class BonusStepsCellEventCreator implements ICellEventCreator {
    createEvent(value: number = 1): ICellEvent {
        return new BonusStepsCellEvent(value);
    }
}

export class DebuffStepsCellEventCreator implements ICellEventCreator {
    createEvent(value: number = -1): ICellEvent {
        return new DebuffStepsCellEvent(value);
    }
}

export class EnemyCellEventCreator implements ICellEventCreator {
    createEvent(value: number = 1): ICellEvent {
        return new EnemyCellEvent(value);
    }
}

// Реестр создателей событий
export class CellEventRegistry {
    private static registry: Map<CellEvent, ICellEventCreator> = new Map([
        [CellEvent.EMPTY, new EmptyCellEventCreator()],
        [CellEvent.BONUS_STEPS, new BonusStepsCellEventCreator()],
        [CellEvent.DEBUFF_STEPS, new DebuffStepsCellEventCreator()],
        [CellEvent.ENEMY, new EnemyCellEventCreator()]
    ]);

    // Метод для регистрации новых типов событий
    public static registerEventCreator(type: CellEvent, creator: ICellEventCreator): void {
        this.registry.set(type, creator);
    }

    // Метод для получения создателя события по типу
    public static getEventCreator(type: CellEvent): ICellEventCreator {
        const creator = this.registry.get(type);
        if (!creator) {
            // Если создатель не найден, возвращаем создателя пустых ячеек по умолчанию
            return this.registry.get(CellEvent.EMPTY)!;
        }
        return creator;
    }
}

// Фабрика для создания событий (использует реестр)
export class CellEventFactory {
    static createEvent(type: CellEvent, value?: number): ICellEvent {
        const creator = CellEventRegistry.getEventCreator(type);
        return creator.createEvent(value);
    }
}
