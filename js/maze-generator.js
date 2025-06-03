/**
 * 迷路生成器 - Recursive Backtracking アルゴリズム
 */
class MazeGenerator {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.reset();
    }

    reset() {
        // 迷路を全て壁で初期化 (1 = 壁, 0 = 通路)
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // 全て壁
            }
        }
    }

    generate() {
        this.reset();
        
        // スタート地点を設定（必ず奇数座標）
        const startX = 1;
        const startY = 1;
        
        // Recursive Backtracking アルゴリズム
        const stack = [];
        const visited = new Set();
        
        // スタート地点をマーク
        this.maze[startY][startX] = 0;
        visited.add(`${startX},${startY}`);
        stack.push([startX, startY]);
        
        const directions = [
            [0, -2], // 上
            [2, 0],  // 右
            [0, 2],  // 下
            [-2, 0]  // 左
        ];
        
        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            
            // 訪問可能な隣接セルを探す
            const neighbors = [];
            
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                
                if (this.isValidCell(newX, newY) && !visited.has(`${newX},${newY}`)) {
                    neighbors.push([newX, newY, dx / 2, dy / 2]);
                }
            }
            
            if (neighbors.length > 0) {
                // ランダムに隣接セルを選択
                const [nextX, nextY, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 壁を取り除く
                this.maze[currentY + wallY][currentX + wallX] = 0;
                this.maze[nextY][nextX] = 0;
                
                // 新しいセルを訪問済みにマーク
                visited.add(`${nextX},${nextY}`);
                stack.push([nextX, nextY]);
            } else {
                // バックトラック
                stack.pop();
            }
        }
        
        // ゴール地点を設定（右下隅近く）
        const goalX = this.width - 2;
        const goalY = this.height - 2;
        this.maze[goalY][goalX] = 0;
        
        // ゴールへの道を確保
        this.ensurePathToGoal(goalX, goalY);
        
        return this.maze;
    }
    
    isValidCell(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }
    
    ensurePathToGoal(goalX, goalY) {
        // ゴールから最も近い通路を探す
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            const checkX = goalX + dx;
            const checkY = goalY + dy;
            
            if (this.isValidPosition(checkX, checkY) && this.maze[checkY][checkX] === 0) {
                return; // 既に道がある
            }
        }
        
        // 道がない場合、強制的に作る
        if (this.isValidPosition(goalX - 1, goalY)) {
            this.maze[goalY][goalX - 1] = 0;
        }
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    isPath(x, y) {
        if (!this.isValidPosition(x, y)) return false;
        return this.maze[y][x] === 0;
    }
    
    isWall(x, y) {
        if (!this.isValidPosition(x, y)) return true;
        return this.maze[y][x] === 1;
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
    
    getWidth() {
        return this.width;
    }
    
    getHeight() {
        return this.height;
    }
}

// グローバルエクスポート
window.MazeGenerator = MazeGenerator;