// Реализация сервиса аутентификации
import { IAuthService } from '../interfaces/api.interfaces';
import { STORAGE_KEYS } from '../../utils/types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService implements IAuthService {
  getSession(): { playerId: string; username: string } | null {
    const playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    
    if (!playerId || !username) {
      return null;
    }
    
    return { playerId, username };
  }

  createSession(): { playerId: string; username: string } {
    // Генерируем уникальный ID игрока
    const playerId = uuidv4();
    
    // Создаем имя пользователя на основе ID
    const username = `Player_${playerId.substring(0, 6)}`;
    
    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    
    // Обновляем время последнего входа
    this.updateLastLogin();
    
    return { playerId, username };
  }

  hasActiveSession(): boolean {
    const playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    
    if (!playerId || !username || !lastLogin) {
      return false;
    }
    
    // Проверяем, что последний вход был не более 7 дней назад
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysDiff = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff < 7;
  }

  updateLastLogin(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
  }
}
