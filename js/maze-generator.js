/**
 * 迷路生成アルゴリズム
 * Recursive Backtracking アルゴリズムを使用して50x50の迷路を生成
 */
class MazeGenerator {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.visited = [];
        this.stack = [];
        
        // 迷路の初期化（全て壁）
        this.initializeMaze();
    }
    
    /**
     * 迷路を初期化（全て壁で埋める）
     */
    initializeMaze() {
        this.maze = [];
        this.visited = [];
        
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            this.visited[y] = [];
            for (let x = 0; x < this.width; x++) {
                // 0: 壁, 1: 通路, 2: スタート, 3: ゴール
                this.maze[y][x] = 0;
                this.visited[y][x] = false;
            }
        }
    }
    
    /**
     * 迷路を生成
     */
    generate() {
        // スタート地点を設定（必ず奇数座標）
        const startX = 1;
        const startY = 1;
        
        this.visited[startY][startX] = true;
        this.maze[startY][startX] = 1; // 通路
        this.stack.push({x: startX, y: startY});
        
        while (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
            
            if (neighbors.length > 0) {
                // ランダムに隣接セルを選択
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 現在のセルと選択されたセルの間の壁を削除
                const wallX = current.x + (next.x - current.x) / 2;
                const wallY = current.y + (next.y - current.y) / 2;
                
                this.visited[next.y][next.x] = true;
                this.maze[next.y][next.x] = 1; // 通路
                this.maze[wallY][wallX] = 1; // 間の壁を通路に
                
                this.stack.push(next);
            } else {
                this.stack.pop();
            }
        }
        
        // スタートとゴールを設定
        this.setStartAndGoal();
        
        return this.maze;
    }
    
    /**
     * 未訪問の隣接セルを取得（2マス先のセル）
     */
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
            
            if (this.isValidCell(newX, newY) && !this.visited[newY][newX]) {
                neighbors.push({x: newX, y: newY});
            }
        }
        
        return neighbors;
    }
    
    /**
     * 有効なセル座標かチェック
     */
    isValidCell(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * スタートとゴールを設定
     */
    setStartAndGoal() {
        // スタート（左上角の近く）
        this.maze[1][1] = 2;
        
        // ゴール（右下角の近く）
        // 通路になっている場所を探す
        for (let y = this.height - 2; y >= 0; y--) {
            for (let x = this.width - 2; x >= 0; x--) {
                if (this.maze[y][x] === 1) {
                    this.maze[y][x] = 3;
                    return;
                }
            }
        }
    }
    
    /**
     * 指定座標が壁かどうかチェック
     */
    isWall(x, y) {
        if (!this.isValidCell(x, y)) return true;
        return this.maze[y][x] === 0;
    }
    
    /**
     * 指定座標が通路かどうかチェック
     */
    isPath(x, y) {
        if (!this.isValidCell(x, y)) return false;
        return this.maze[y][x] >= 1;
    }
    
    /**
     * 指定座標がゴールかどうかチェック
     */
    isGoal(x, y) {
        if (!this.isValidCell(x, y)) return false;
        return this.maze[y][x] === 3;
    }
    
    /**
     * スタート位置を取得
     */
    getStartPosition() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === 2) {
                    return {x, y};
                }
            }
        }
        return {x: 1, y: 1}; // デフォルト
    }
    
    /**
     * ゴール位置を取得
     */
    getGoalPosition() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === 3) {
                    return {x, y};
                }
            }
        }
        return {x: this.width - 2, y: this.height - 2}; // デフォルト
    }
    
    /**
     * デバッグ用：コンソールに迷路を出力
     */
    printMaze() {
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                switch (this.maze[y][x]) {
                    case 0: row += '█'; break; // 壁
                    case 1: row += ' '; break; // 通路
                    case 2: row += 'S'; break; // スタート
                    case 3: row += 'G'; break; // ゴール
                }
            }
            console.log(row);
        }
    }
}