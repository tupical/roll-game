// Модуль для управления пользовательским вводом
import { GameState } from './gameState';
import { GameBoard } from './gameBoard';

export class InputHandler {
    constructor(
        private gameState: GameState, 
        private gameBoard: GameBoard,
        private onMove: (action: 'roll' | 'move') => void
    ) {
        // Удаляем автоматическую установку обработчиков событий
        // Теперь они будут устанавливаться через React useEffect
    }

    // Публичный метод для обработки нажатий клавиш
    public handleKeyDown(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        
        // Бросок кубиков (R или К в русской раскладке)
        if (key === 'r' || key === 'к') {
            if (!this.gameState.canMove() || this.gameState.getTurnsToSkip() > 0) {
                // Вызываем обновление с действием 'roll'
                this.onMove('roll');
            }
        } 
        // Перемещение игрока
        else if (this.gameState.canMove()) {
            let dx = 0;
            let dy = 0;
            
            switch (key) {
                case 'arrowup': case 'w': case 'ц':
                    dy = -1;
                    break;
                case 'arrowdown': case 's': case 'ы':
                    dy = 1;
                    break;
                case 'arrowleft': case 'a': case 'ф':
                    dx = -1;
                    break;
                case 'arrowright': case 'd': case 'в':
                    dx = 1;
                    break;
                default:
                    return; // Игнорируем другие клавиши
            }
            
            if (dx !== 0 || dy !== 0) {
                // Передаем актуальное игровое поле вместо пустого массива
                const moveResult = this.gameState.movePlayer(dx, dy, this.gameBoard.getBoard());
                
                // Вызываем обновление только если движение было успешным
                if (moveResult.moved) {
                    this.onMove('move');
                }
            }
        }
    }
}
