import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GameProvider } from './ui/contexts/GameContext';
import { GameService } from './core/services/GameService';
import { HttpClient } from './api/http/HttpClient';
import { SocketClient } from './api/socket/SocketClient';
import { AuthService } from './api/auth/AuthService';
import { API_CONFIG } from './utils/types';

// Создаем экземпляры сервисов
const httpClient = new HttpClient(API_CONFIG.BASE_URL);
const socketClient = new SocketClient(API_CONFIG.SOCKET_URL);
const authService = new AuthService();

// Создаем экземпляр игрового сервиса
const gameService = new GameService(httpClient, socketClient, authService);

// Проверяем наличие активной сессии
if (!authService.hasActiveSession()) {
  // Если нет активной сессии, создаем новую
  authService.createSession();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider gameService={gameService}>
      <App />
    </GameProvider>
  </React.StrictMode>,
);
