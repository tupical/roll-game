// API интерфейсы
export interface IHttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export interface ISocketClient {
  connect(): void;
  disconnect(): void;
  emit(event: string, data: any): void;
  on<T>(event: string, callback: (data: T) => void): void;
  off(event: string): void;
}

export interface IAuthService {
  getSession(): { playerId: string; username: string } | null;
  createSession(): { playerId: string; username: string };
  hasActiveSession(): boolean;
  updateLastLogin(): void;
  clearSession(): void;
}
