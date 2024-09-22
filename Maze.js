import Cell from "./Cell.js";

export default class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.stack = [];
        this.visitedCells = [];
        this.initializeCells();
        this.drawDelay = 3;
        this.randomOpeningWallsPercentage = 0.3;
    }

    initializeCells() {
        for (let w = 0; w < this.width; w++) {
            let col = [];
            for (let h = 0; h < this.height; h++) {
                col.push(new Cell(w, h));
            }
            this.cells.push(col);
        }
    }

    async generateMaze(startX, startY) {
        let x = startX;
        let y = startY;

        let curCell = this.cells[x][y]
        curCell.visited = true;
        this.visitedCells.push(curCell);
        this.stack.push(curCell);

        let count = 6;

        while (this.visitedCells.length !== this.width * this.height) {
            const neighbor = this.getRandomNeighbor(curCell.x, curCell.y);
            // neighbor && console.log('neg: ', neighbor.cell.x, neighbor.cell.y)

            if (neighbor) {
                await new Promise((r) => setTimeout(r, this.drawDelay));
                this.visitedCells.push(neighbor.cell);
                this.stack.push(neighbor.cell);
                neighbor.cell.visited = true;

                switch (neighbor.dir) {
                    case 'up':
                        neighbor.cell.walls.bottom = false;
                        curCell.walls.top = false;
                        break;
                    case 'down':
                        neighbor.cell.walls.top = false;
                        curCell.walls.bottom = false;
                        break;
                    case 'right':
                        neighbor.cell.walls.left = false;
                        curCell.walls.right = false;
                        break;
                    case 'left':
                        neighbor.cell.walls.right = false;
                        curCell.walls.left = false;
                        break;
                }

                await this.drawCell(curCell);
                curCell = neighbor.cell;
            } else {
                if (this.stack.length > 0) {
                    curCell = this.stack.pop();
                }
            }
            await this.drawCell(curCell);
            // this.printMaze();
        }

        await this.openRandomWalls(parseInt(this.width * this.height) * this.randomOpeningWallsPercentage);
        // await this.drawMaze();
            // this.draw2DMap();
    }

    getRandomNeighbor(x, y) {
        let neighbors = [];
        // check upper cell
        if (y != 0 && !this.cells[x][y - 1].visited) {
            neighbors.push({ dir: 'up', cell: this.cells[x][y - 1] });
        }
        // check bottom cell
        if (y != this.height - 1 && !this.cells[x][y + 1].visited) {
            neighbors.push({ dir: 'down', cell: this.cells[x][y + 1] });
        }
        // check right cell
        if (x != this.width - 1 && !this.cells[x + 1][y].visited) {
            neighbors.push({ dir: 'right', cell: this.cells[x + 1][y] });
        }
        // check left cell
        if (x != 0 && !this.cells[x - 1][y].visited) {
            neighbors.push({ dir: 'left', cell: this.cells[x - 1][y] });
        }

        // neighbors.forEach(n => console.log(n.cell.x, n.cell.y));

        if (neighbors.length > 0) {
            return neighbors.length == 1
                ? neighbors[0]
                : neighbors[Math.floor((Math.random() * neighbors.length))];
        } else {
            return null;
        }
    }

    async drawCell(cell) {
        const { top, left, right, bottom } = cell.walls;
        const cellDiv = await $(`#cell-${cell.x}-${cell.y}`);
        cell.visited && await cellDiv.css('background-color', 'black');
        cell.y == 0 && await cellDiv.css('border-top', '1px solid white');
        !right && await cellDiv.css('border-right-color', 'black');
        !bottom && await cellDiv.css('border-bottom-color', 'black');
        cell.x == 0 && await cellDiv.css('border-left', '1px solid white');
    }

    async drawMaze() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                await new Promise((r) => setTimeout(r, this.drawDelay));
                await this.drawCell(this.cells[w][h]);
            }
        }
    }

    draw2DMap() {
        let map = [];
        let mapWidth = this.width*2+1;
        let mapHeight = this.height*2+1;
        let wall = 1;
        let open = 0;
        for(let h = 0; h < mapHeight; h++){
            map.push(Array(mapWidth).fill(wall))
        }

        for(let x = 1, cX = 0; x < mapWidth; x+=2, cX++) {
            for(let y = 1, cY = 0; y < mapHeight; y+=2, cY++) {
                let { right, bottom } = this.cells[cX][cY].walls;
                map[y][x] = open;
                // if can go right
                !right && (map[y][x+1] = open);
                // if can go down
                !bottom && (map[y+1][x] = open);
                // fill extra space
                // (false) && (map[y+1][x+1] = open);
            }
        }

        // print 2d map
        for(let row of map){
            console.log(row.join(' '));
            // console.log(Array(this.width*2+1).fill('-'))
        }
        return map;
    }

    async openRandomWalls(count) {
        let openedCells = [];
        let infinite = 0;
    
        while (count-- > 0) {
            // Get random cell index
            let randX = Math.floor(Math.random() * (this.width - 1));
            let randY = Math.floor(Math.random() * (this.height - 1));
    
            // Check if random cell has already been selected before
            const filter = openedCells.filter(c => c.x === randX && c.y === randY);
            // console.log("randX: ", randX, "   randY: ", randY);
    
            // Extract the walls of the selected cell
            let { top, left, right, bottom } = this.cells[randX][randY].walls;
            let dir = [];
    
            top && dir.push('top');
            left && dir.push('left');
            right && dir.push('right');
            bottom && dir.push('bottom');

            // if loop going infinitely
            if(infinite > (this.width*this.height)){
                console.log("Maze generation is taking too long, stoped process");
                break;
            }
    
            // Skip if the cell was previously selected or only one wall remains
            if (filter.length > 0 || dir.length === 3) {
                infinite++;
                count++;
                continue;
            }
            infinite = 0;
    
            // Randomly pick a wall to open
            let randWall = dir[Math.floor(Math.random() * dir.length)];
    
            // Update the wall to be 'false' (open) in the selected direction
            this.cells[randX][randY].walls = { ...this.cells[randX][randY].walls, [randWall]: false };
    
            // Mark this cell as selected and await drawing
            openedCells.push({ x: randX, y: randY });
            await new Promise((r) => setTimeout(r, this.drawDelay));
            await this.drawCell(this.cells[randX][randY]);
        }
    }
    

    printMaze() {

        // console.clear();
        let result = "\n";
        for (let h = 0; h < this.height; h++) {
            let ar = [];
            for (let w = 0; w < this.width; w++) {
                ar.push(this.cells[w][h]);
            }
            result += ar.map(c => c.walls.top ? '=====' : '=   =').join('') + '\n';
            result += ar.map(c => c.visited ? `${c.walls.left ? 'i ' : '  '} ${c.walls.right ? ' i' : '  '}` : '|@@@|').join('') + '\n';
            h == this.height - 1 && (result += ar.map(c => c.walls.bottom ? '=====' : '=   =').join('') + '\n')
        }
        console.log(result);
    }
}