export default class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.neighbors = [];
        this.walls = { top: true, right: true, bottom: true, left: true };
    }
}