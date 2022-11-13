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
            x = this.maxX - x;
        }
        if (y < 0) {
            y = this.maxY - y;
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
            [0, -1],  [0, 0], [0, 1],
            [+1, -1], [1, 0], [1, 1]
        ]
        for (let [directionX, directionY] of checks) {
            let tileY = y + directionY;
            let tileX = x + directionX;
            console.log(`${tileX}, ${tileY}`)
            console.log()
            if (this.cells.get(tileX, tileY) === true) count++;
        }
        return count;
    }

    nextGeneration() {
        for (let y = 0; y < this.cells.maxY; y++) {
            for (let x = 0; x < this.cells.maxX; x++) {
                let neighbors = this.countNeighbors(x, y);
                if (neighbors === 3) {
                    this.cells.set(x, y, true);
                } else if (neighbors !== 4) {
                    this.cells.set(x, y, false);
                }
            }
        }
    }

    tick() {
        this.nextGeneration();
    }
}

class Canvas {
    constructor(tileArea = 10, canvasId = "") {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas === null) {
            console.log("ciao");
            this.canvas = document.querySelector("canvas");
        }
        this.tileSide = tileArea;
    }

    drawGrid() {
        let cx = this.canvas.getContext("2d");
        cx.strokeStyle = "black"
        for (let x = 0; x <= this.canvas.width; x += this.tileSide) {
            cx.moveTo(x, 0);
            cx.lineTo(x, this.canvas.height);
        }
        for (let y = 0; y <= this.canvas.height; y += this.tileSide) {
            cx.moveTo(0, y);
            cx.lineTo(this.canvas.width, y);
        }
        cx.stroke()
    }

    findTile(x, y) {
        return [Math.floor(x / this.tileSide) * this.tileSide, Math.floor(y / this.tileSide) * this.tileSide]
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

    updateCanvas(field) {
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
}

let canvas = new Canvas(30);
canvas.drawGrid();
let field = new Universe(canvas.countCells());
field.flipCell(0, 0);
field.flipCell(0, 1);
field.flipCell(1, 1);
field.flipCell(1, 0);
canvas.updateCanvas(field.cells);
const bounding = canvas.canvas.getBoundingClientRect();
["click", "dblclick"].forEach(function (evt) {
    canvas.canvas.addEventListener(evt, event => {
        let [x, y] = [event.clientX - bounding.left, event.clientY - bounding.top];
        console.log(`Drawing dot at ${x} ${y}`)
        let [actualX, actualY] = canvas.findTile(x, y);
        console.log(field.countNeighbors(actualX, actualY));
        if (evt === "click") canvas.fillTile(x, y);
        else canvas.clearTile(x, y);
    })
})
// window.onresize = function () {
//     canvas.canvas.width = document.body.clientWidth;
//     canvas.drawGrid();
// }
// window.requestAnimationFrame(gameLoop);
//
// async function gameLoop() {
//     canvas.updateCanvas(field.cells)
//     field.tick();
//     await new Promise(resolve => setTimeout(resolve, 1000));
// }