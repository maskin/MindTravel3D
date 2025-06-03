// 迷路生成システム - Recursive Backtrackingアルゴリズム
class MazeGenerator {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.stack = [];
    }

    generate() {
        // 迷路の初期化 (全て壁)
        this.maze = Array(this.height).fill().map(() => Array(this.width).fill(1));
        
        // スタート地点を通路に
        const startX = 1;
        const startY = 1;
        this.maze[startY][startX] = 0;
        
        // Recursive Backtrackingアルゴリズム
        this.stack = [{x: startX, y: startY}];
        
        while (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
            
            if (neighbors.length > 0) {
                // ランダムな隣接セルを選択
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 現在のセルと選択されたセルの間の壁を除去
                const wallX = current.x + (next.x - current.x) / 2;
                const wallY = current.y + (next.y - current.y) / 2;
                this.maze[wallY][wallX] = 0;
                this.maze[next.y][next.x] = 0;
                
                this.stack.push(next);
            } else {
                this.stack.pop();
            }
        }
        
        // ゴール地点を確実に通路に
        const goalX = this.width - 2;
        const goalY = this.height - 2;
        this.maze[goalY][goalX] = 0;
        
        // ゴールへのパスを確保
        this.ensurePathToGoal();
        
        return this.maze;
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            {dx: 0, dy: -2}, // 上
            {dx: 2, dy: 0},  // 右
            {dx: 0, dy: 2},  // 下
            {dx: -2, dy: 0}  // 左
        ];

        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                this.maze[newY][newX] === 1) {
                neighbors.push({x: newX, y: newY});
            }
        }

        return neighbors;
    }

    ensurePathToGoal() {
        // A*アルゴリズムでスタートからゴールへのパスを確認
        const start = {x: 1, y: 1};
        const goal = {x: this.width - 2, y: this.height - 2};
        
        if (!this.hasPath(start, goal)) {
            // パスがない場合は強制的に作成
            this.createPath(start, goal);
        }
    }

    hasPath(start, goal) {
        const visited = Array(this.height).fill().map(() => Array(this.width).fill(false));
        const queue = [start];
        visited[start.y][start.x] = true;

        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.x === goal.x && current.y === goal.y) {
                return true;
            }

            const directions = [{dx: 0, dy: -1}, {dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: -1, dy: 0}];
            
            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                if (newX >= 0 && newX < this.width && 
                    newY >= 0 && newY < this.height && 
                    !visited[newY][newX] && this.maze[newY][newX] === 0) {
                    visited[newY][newX] = true;
                    queue.push({x: newX, y: newY});
                }
            }
        }

        return false;
    }

    createPath(start, goal) {
        // 簡単な直線パスを作成
        let currentX = start.x;
        let currentY = start.y;
        
        while (currentX !== goal.x || currentY !== goal.y) {
            this.maze[currentY][currentX] = 0;
            
            if (currentX < goal.x) currentX++;
            else if (currentX > goal.x) currentX--;
            else if (currentY < goal.y) currentY++;
            else if (currentY > goal.y) currentY--;
        }
        
        this.maze[goal.y][goal.x] = 0;
    }

    // 迷路データを取得
    getMaze() {
        return this.maze;
    }

    // 迷路のサイズを取得
    getSize() {
        return {width: this.width, height: this.height};
    }

    // 指定位置が壁かどうかチェック
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }
        return this.maze[y][x] === 1;
    }

    // 指定位置が通路かどうかチェック
    isPath(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.maze[y][x] === 0;
    }
}