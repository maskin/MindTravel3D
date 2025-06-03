class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.visited = [];
        this.stack = [];
    }

    generate() {
        this.initializeMaze();
        this.generateMaze();
        return this.maze;
    }

    initializeMaze() {
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            this.visited[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // 1 = wall, 0 = path
                this.visited[y][x] = false;
            }
        }
    }

    generateMaze() {
        const startX = 1;
        const startY = 1;
        
        this.maze[startY][startX] = 0;
        this.visited[startY][startX] = true;
        this.stack.push([startX, startY]);

        while (this.stack.length > 0) {
            const [currentX, currentY] = this.stack[this.stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(currentX, currentY);

            if (neighbors.length > 0) {
                const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove wall between current and next cell
                const wallX = currentX + (nextX - currentX) / 2;
                const wallY = currentY + (nextY - currentY) / 2;
                this.maze[wallY][wallX] = 0;
                this.maze[nextY][nextX] = 0;
                
                this.visited[nextY][nextX] = true;
                this.stack.push([nextX, nextY]);
            } else {
                this.stack.pop();
            }
        }

        // Ensure goal is accessible
        this.maze[this.height - 2][this.width - 2] = 0;
        
        // Create some additional paths for better gameplay
        this.createAdditionalPaths();
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [0, -2], // North
            [2, 0],  // East
            [0, 2],  // South
            [-2, 0]  // West
        ];

        directions.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;

            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                !this.visited[newY][newX]) {
                neighbors.push([newX, newY]);
            }
        });

        return neighbors;
    }

    createAdditionalPaths() {
        // Add some random paths to make the maze more interesting
        const pathCount = Math.floor((this.width * this.height) * 0.02);
        
        for (let i = 0; i < pathCount; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            if (this.maze[y][x] === 1) {
                // Check if creating a path here would connect existing paths
                const adjacentPaths = this.countAdjacentPaths(x, y);
                if (adjacentPaths >= 2) {
                    this.maze[y][x] = 0;
                }
            }
        }
    }

    countAdjacentPaths(x, y) {
        let count = 0;
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        directions.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < this.width && 
                newY >= 0 && newY < this.height && 
                this.maze[newY][newX] === 0) {
                count++;
            }
        });
        
        return count;
    }

    isPath(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.maze[y][x] === 0;
    }

    isWall(x, y) {
        return !this.isPath(x, y);
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    // Get spawn and goal positions
    getSpawnPosition() {
        return { x: 1, y: 1 };
    }

    getGoalPosition() {
        return { x: this.width - 2, y: this.height - 2 };
    }
}