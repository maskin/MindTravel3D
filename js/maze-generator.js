// 3D迷路ゲーム - 迷路生成システム
class MazeGenerator {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.initialize();
    }
    
    initialize() {
        // 迷路の初期化（全て壁で埋める）
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // 1 = 壁, 0 = 通路
            }
        }
    }
    
    generateMaze() {
        console.log('迷路生成開始...');
        this.initialize();
        
        // Recursive Backtrackingアルゴリズム
        const stack = [];
        const startX = 1;
        const startY = 1;
        
        // スタート地点を通路にする
        this.maze[startY][startX] = 0;
        stack.push([startX, startY]);
        
        const directions = [
            [0, -2], // 上
            [2, 0],  // 右
            [0, 2],  // 下
            [-2, 0]  // 左
        ];
        
        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            const neighbors = [];
            
            // 隣接する未探索セルを検索
            for (const [dx, dy] of directions) {
                const nextX = currentX + dx;
                const nextY = currentY + dy;
                
                if (this.isValidCell(nextX, nextY) && this.maze[nextY][nextX] === 1) {
                    neighbors.push([nextX, nextY, dx, dy]);
                }
            }
            
            if (neighbors.length > 0) {
                // ランダムに隣接セルを選択
                const [nextX, nextY, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 間の壁を除去
                const wallX = currentX + dx / 2;
                const wallY = currentY + dy / 2;
                
                this.maze[wallY][wallX] = 0;
                this.maze[nextY][nextX] = 0;
                
                stack.push([nextX, nextY]);
            } else {
                stack.pop();
            }
        }
        
        // ゴール地点を確保
        this.maze[this.height - 2][this.width - 2] = 0;
        
        // 確実に到達可能にするため、ゴール周辺を少し開ける
        const goalX = this.width - 2;
        const goalY = this.height - 2;
        
        if (goalX > 1) this.maze[goalY][goalX - 1] = 0;
        if (goalY > 1) this.maze[goalY - 1][goalX] = 0;
        
        console.log('迷路生成完了');
        return this.maze;
    }
    
    isValidCell(x, y) {
        return x >= 1 && x < this.width - 1 && y >= 1 && y < this.height - 1;
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true; // 境界は壁として扱う
        }
        return this.maze[y][x] === 1;
    }
    
    isPath(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.maze[y][x] === 0;
    }
    
    getStartPosition() {
        return { x: 1, y: 1 };
    }
    
    getGoalPosition() {
        return { x: this.width - 2, y: this.height - 2 };
    }
    
    getMaze() {
        return this.maze;
    }
    
    printMaze() {
        // デバッグ用
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                if (x === 1 && y === 1) {
                    row += 'S'; // スタート
                } else if (x === this.width - 2 && y === this.height - 2) {
                    row += 'G'; // ゴール
                } else {
                    row += this.maze[y][x] === 1 ? '█' : ' ';
                }
            }
            console.log(row);
        }
    }
}

// グローバルに公開
window.MazeGenerator = MazeGenerator;