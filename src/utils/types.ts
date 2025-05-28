// Типы и константы для игры
export interface WorldCoord {
  x: number;
  y: number;
}

// Размеры игрового поля и ячеек
export const CELL_SIZE = 40;
export const GRID_SIZE = 21;
export const APP_WIDTH = 800;
export const APP_HEIGHT = 600;
export const GRID_COLOR = 0xFFFFFF;
export const PATH_COLOR = 0x0000FF;
export const FOG_COLOR = 0x333333; // Цвет тумана войны
export const FOG_ALPHA = 0.7; // Прозрачность тумана войны
export const STROKE_WIDTH = 1;

// Цвета для различных типов ячеек
export const COLORS = {
  EMPTY: 0xCCCCCC,
  BONUS_STEPS: 0x00FF00,
  DEBUFF_STEPS: 0xFF0000,
  ENEMY: 0xFF00FF,
  PLAYER: 0x0000FF,
  PATH: 0xFFFF00,
  FOG: 0x333333,
  GRID_LINE: 0x888888,
  BACKGROUND: 0x1099bb,
};

// Настройки API
export const API_CONFIG = {
  BASE_URL: 'http://[::1]:3001',
  SOCKET_URL: 'http://[::1]:3001',
  ENDPOINTS: {
    WORLDS: '/world',
    PLAYERS: '/game/player',
    ROLL: '/game/roll',
    MOVE: '/game/move',
    MAP: '/game/map',
    END_TURN: '/game/end-turn',
  },
  SOCKET_EVENTS: {
    PLAYER_JOIN: 'player:join',
    PLAYER_ROLL: 'player:roll',
    PLAYER_MOVE: 'player:move',
    PLAYER_END_TURN: 'player:end-turn',
    PLAYER_UPDATE: 'player:update',
    MAP_UPDATE: 'map:update',
    DICE_ROLLED: 'dice:rolled',
    EVENT_TRIGGERED: 'event:triggered',
    ERROR: 'error',
  },
};

// Настройки локального хранилища
export const STORAGE_KEYS = {
  PLAYER_ID: 'game_player_id',
  USERNAME: 'game_username',
  LAST_LOGIN: 'game_last_login',
};
