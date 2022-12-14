"use strict";

/*class Cell {
    constructor(x, y) {
        if (typeof x === "string") {
            [x, y] = x.split(',').map(num => {
                return parseInt(num);
            })
            return new Cell(x, y);
        }
        this.x = x;
        this.y = y;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    equals(Cell) {
        return this.x === Cell.x && this.y === Cell.y;
   }

    toString() {
        return this.x.toString() + "," + this.y.toString()
    }
}*/

// Handles the game's field and its cells
class ToroidalArray {
    #field;

    constructor(width, height) {
        this.#field = new Array(height);
        this.maxX = width;
        this.maxY = height;
        for (let i = 0; i < height; i++) {
            this.#field[i] = new Array(width).fill(false);
        }
    }

    get(x, y) {
        if (x < 0) {
            x = this.maxX - Math.abs(x);
        }
        if (y < 0) {
            y = this.maxY - Math.abs(y);
        }
        return this.#field[y % this.maxY][x % this.maxX];
    }

    set(x, y, value) {
        this.#field[y % this.maxY][x % this.maxX] = value;
    }

    flip(x, y) {
        let value = this.#field[y % this.maxY][x % this.maxX];
        this.#field[y % this.maxY][x % this.maxX] = !value;
    }
}

// Manages the game's logic
class Universe {
    constructor(width, height) {
        if (Array.isArray(width) && width.length >= 2) {
            return new Universe(width[0], width[1]);
        }
        this.cells = new ToroidalArray(width, height);
    };

    flipCell(x, y) {
        this.cells.flip(x, y);
    }

    getCell(x, y) {
        return this.cells.get(x, y);
    }

    countNeighbors(x, y) {
        let count = 0;
        let checks = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 0], [0, 1],
            [+1, -1], [1, 0], [1, 1]
        ]
        for (let [directionX, directionY] of checks) {
            let tileY = y + directionY;
            let tileX = x + directionX;
            if (this.cells.get(tileX, tileY) === true) count++;
        }
        return count;
    }

    nextGeneration() {
        let newGen = new ToroidalArray(this.cells.maxX, this.cells.maxY);
        for (let y = 0; y < this.cells.maxY; y++) {
            for (let x = 0; x < this.cells.maxX; x++) {
                let neighbors = this.countNeighbors(x, y);
                if (neighbors === 3) {
                    newGen.set(x, y, true);
                } else if (neighbors !== 4) {
                    newGen.set(x, y, false);
                } else {
                    newGen.set(x, y, this.cells.get(x, y))
                }
            }
        }
        this.cells = newGen;
    }

    tick() {
        this.nextGeneration();
    }
}

class Canvas {
    #actualHeight;
    #actualWidth;
    constructor(tileArea = 10, canvasId = "") {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas === null) {
            this.canvas = document.querySelector("canvas");
        }
        this.tileSide = tileArea;
        this.#actualHeight = this.canvas.parentElement.offsetHeight;
        this.#actualWidth = this.canvas.parentElement.offsetWidth;
    }

    clear() {
        const cx = this.canvas.getContext("2d");
        cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const cx = this.canvas.getContext("2d");
        cx.beginPath();
        cx.strokeStyle = "black"
        cx.lineWidth = 0.2;
        for (let x = 0; x <= this.canvas.width; x += this.tileSide) {
            cx.moveTo(x, 0);
            cx.lineTo(x, this.canvas.height);
        }
        cx.stroke()
        for (let y = 0; y <= this.canvas.height; y += this.tileSide) {
            cx.moveTo(0, y);
            cx.lineTo(this.canvas.width, y);
        }
        cx.stroke()
    }

    findTile(x, y) {
        return [Math.floor(x / this.tileSide) * this.tileSide, Math.floor(y / this.tileSide) * this.tileSide]
    }

    findTileNum(x, y) {
        // let [acx, acy] = this.findTile(x, y);
        // return [Math.floor(acx / this.tileSide), Math.floor(acy / this.tileSide)];
        return [Math.floor(x / this.tileSide), Math.floor(y / this.tileSide)]
    }


    fillTile(x, y) {
        let [tileX, tileY] = this.findTile(x, y);
        let cx = this.canvas.getContext("2d");
        cx.fillStyle = "white";
        cx.fillRect(tileX + 1, tileY + 1, this.tileSide - 2, this.tileSide - 2);
    }

    clearTile(x, y) {
        let [tileX, tileY] = this.findTile(x, y);
        let cx = this.canvas.getContext("2d");
        cx.clearRect(tileX + 1, tileY + 1, this.tileSide - 2, this.tileSide - 2);
    }

    // Returns the amount of vertical and horizontal tiles
    countCells() {
        let numX, numY;
        numX = Math.floor(this.canvas.width / this.tileSide);
        numY = Math.floor(this.canvas.height / this.tileSide);
        return [numX, numY];
    }

    updateCells(field) {
        const bounding = canvas.canvas.getBoundingClientRect();
        for (let y = 0; y < field.maxY; y++) {
            for (let x = 0; x < field.maxX; x++) {
                if (field.get(x, y) === true) {
                    this.fillTile(x * this.tileSide, y * this.tileSide);
                } else {
                    this.clearTile(x * this.tileSide, y * this.tileSide);
                }
            }
        }
    }

    changeParentSize(width, height) {
        this.#actualWidth = width;
        this.#actualHeight = height;
    }

    updateCanvas(field = null) {
        this.clear();
        this.resize();
        this.drawGrid();
        if (field !== null) {
            this.updateCells(field);
        }
    }

   resize() {
        this.canvas.width = Math.floor(this.#actualWidth / this.tileSide) * this.tileSide;
        this.canvas.height = Math.floor(this.#actualHeight / this.tileSide) * this.tileSide;
    }

}

const canvas = new Canvas(30);
canvas.resize();
canvas.drawGrid();
const field = new Universe(canvas.countCells());
field.flipCell(0, 0);
field.flipCell(0, 1);
field.flipCell(1, 1);
field.flipCell(1, 0);
field.flipCell(5, 10);
field.flipCell(6, 10);
field.flipCell(7, 10);
canvas.updateCells(field.cells);
window.requestAnimationFrame(gameLoop);

let doUpdate = false;
let tickPerSecond = 1;

async function gameLoop() {
    if (doUpdate) {
        field.tick();
        canvas.updateCells(field.cells)
        doUpdate = false;
    }
    window.requestAnimationFrame(gameLoop);
}