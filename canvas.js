"use strict";

class Cell {
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
}

class LivingCells {
    constructor() {
        this.cells = new Map();
    };

    addCell(x, y) {
        this.cells.set(new Cell(x, y).toString(), true);
    }

    removeCell(x, y) {
        this.cells.delete();
    }

    countNeighbors(x, y) {
        let count = 0;
        let checks = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [+1, -1], [1, 0], [1, 1]
        ]
        for (let [directionX, directionY] in checks) {
            let tileY = y + directionY;
            if (tileY < 0) tileY = 0;
            else if (tileY > this.buffer[0].length) tileY = this.buffer[0].length;
            let tileX = x + directionX;
            if (tileX < 0) tileX = 0;
            else if (tileX > this.buffer[0][0].length) tileX = this.buffer[0][0].length;
            if (this.buffer[0][tileY][tileX] === true) {
                count++;
            }
        }
        return count;
    }

    nextGeneration() {
        for (let i = 0; i < this.buffer[1].length; i++) {
            for (let j = 0; j < this.buffer[1][i].length; j++) {
                let neighbors = this.countNeighbors(j, i);
                let cell = this.buffer[0][j][i];
                if (cell === false && neighbors === 3) {
                    this.buffer[0][j][i] = true;
                } else if (!(cell === true && (neighbors === 3 || neighbors === 2))) {
                    this.buffer[0][j][i] = false;
                }
            }
        }
    }

    tick() {
        this.nextGeneration();
        [this.buffer[0], this.buffer[1]] = [this.buffer[1], this.buffer[0]]
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
        let numX = 0, numY = 0;
        numX = Math.floor(this.canvas.width / this.tileSide);
        numY = Math.floor(this.canvas.height / this.tileSide);
        return [numX, numY];
    }

    updateCanvas(field) {
        const bounding = canvas.canvas.getBoundingClientRect();
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[0].length; x++) {
                if (field[y][x] === true) {
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
let field = new LivingCells(canvas.countCells());
field.addCell(0, 0);
field.addCell(0, 1);
field.addCell(1, 1);
// canvas.updateCanvas(field.buffer[0]);
const bounding = canvas.canvas.getBoundingClientRect();
["click", "dblclick"].forEach(function (evt) {
    canvas.canvas.addEventListener(evt, event => {
        let [x, y] = [event.clientX - bounding.left, event.clientY - bounding.top];
        console.log(`Drawing dot at ${x} ${y}`)
        if (evt === "click") canvas.fillTile(x, y);
        else canvas.clearTile(x, y);
    })
})
window.requestAnimationFrame(gameLoop);

function gameLoop() {
    field.tick();
    canvas.updateCanvas(field.buffer[0])
    window.requestAnimationFrame(gameLoop);
}