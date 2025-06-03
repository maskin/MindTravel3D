class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.visited = [];
        
        this.initializeMaze();
    }
    
    initializeMaze() {
        for (let x = 0; x < this.width; x++) {
            this.maze[x] = [];
            this.visited[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.maze[x][y] = {
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    }
                };
                this.visited[x][y] = false;
            }
        }
    }
    
    generateMaze() {
        const stack = [];
        let currentCell = { x: 0, y: 0 };
        this.visited[0][0] = true;
        
        while (true) {
            const neighbors = this.getUnvisitedNeighbors(currentCell);
            
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(currentCell);
                
                this.removeWall(currentCell, randomNeighbor);
                this.visited[randomNeighbor.x][randomNeighbor.y] = true;
                currentCell = randomNeighbor;
            } else if (stack.length > 0) {
                currentCell = stack.pop();
            } else {
                break;
            }
        }
        
        return this.maze;
    }
    
    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;
        
        // Top
        if (y > 0 && !this.visited[x][y - 1]) {
            neighbors.push({ x, y: y - 1 });
        }
        // Right
        if (x < this.width - 1 && !this.visited[x + 1][y]) {
            neighbors.push({ x: x + 1, y });
        }
        // Bottom
        if (y < this.height - 1 && !this.visited[x][y + 1]) {
            neighbors.push({ x, y: y + 1 });
        }
        // Left
        if (x > 0 && !this.visited[x - 1][y]) {
            neighbors.push({ x: x - 1, y });
        }
        
        return neighbors;
    }
    
    removeWall(current, neighbor) {
        const dx = current.x - neighbor.x;
        const dy = current.y - neighbor.y;
        
        if (dx === 1) {
            // Current is to the right of neighbor
            this.maze[current.x][current.y].walls.left = false;
            this.maze[neighbor.x][neighbor.y].walls.right = false;
        } else if (dx === -1) {
            // Current is to the left of neighbor
            this.maze[current.x][current.y].walls.right = false;
            this.maze[neighbor.x][neighbor.y].walls.left = false;
        }
        
        if (dy === 1) {
            // Current is below neighbor
            this.maze[current.x][current.y].walls.top = false;
            this.maze[neighbor.x][neighbor.y].walls.bottom = false;
        } else if (dy === -1) {
            // Current is above neighbor
            this.maze[current.x][current.y].walls.bottom = false;
            this.maze[neighbor.x][neighbor.y].walls.top = false;
        }
    }
    
    canMoveTo(fromX, fromY, direction) {
        if (fromX < 0 || fromX >= this.width || fromY < 0 || fromY >= this.height) {
            return false;
        }
        
        const cell = this.maze[fromX][fromY];
        
        switch (direction) {
            case 'up':
                return !cell.walls.top;
            case 'right':
                return !cell.walls.right;
            case 'down':
                return !cell.walls.bottom;
            case 'left':
                return !cell.walls.left;
            default:
                return false;
        }
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}