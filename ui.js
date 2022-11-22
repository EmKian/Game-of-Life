// File where to keep all the site's event handlers
const canvasHTML = canvas.canvas;
let drawMode = false;
let isDrawing = false;
canvasHTML.addEventListener("mousedown", event => {
    if (drawMode) {
        isDrawing = true;
    }
})
canvasHTML.addEventListener("click", async event => {
    let [x, y] = [event.offsetX, event.offsetY];
    let [actualX, actualY] = canvas.findTileNum(x, y);
    if (!drawMode) {
        field.flipCell(actualX, actualY);
        if (field.getCell(actualX, actualY)) canvas.fillTile(x, y);
        else canvas.clearTile(x, y);
    } else if (field.getCell(actualX, actualY) === false && !event.shiftKey) {
        field.flipCell(actualX, actualY);
        canvas.fillTile(x, y)
    } else if (field.getCell(actualX, actualY) === true && event.shiftKey) {
        field.flipCell(actualX, actualY);
        canvas.clearTile(x, y)
    }
})

canvasHTML.addEventListener("mousemove", event => {
    if (isDrawing) {
        let [x, y] = [event.offsetX, event.offsetY];
        let [actualX, actualY] = canvas.findTileNum(x, y);
        if (!field.getCell(actualX, actualY) && !event.shiftKey) {
            field.flipCell(actualX, actualY);
            canvas.fillTile(x, y);
        } else if (field.getCell(actualX, actualY) && event.shiftKey) {
            field.flipCell(actualX, actualY);
            canvas.clearTile(x, y);
        }
    }
})
canvasHTML.addEventListener("mouseup", event => {
    isDrawing = false;
})

let intervalID = setInterval((() => doUpdate = true), 1000 / tickPerSecond);
const stopButton = document.getElementById("stop-button");
stopButton.addEventListener("click", event => {
    let button = event.target;
    if (intervalID !== null) {
        clearInterval(intervalID);
        intervalID = null;
        button.innerText = "Resume"
    } else {
        intervalID = setInterval((() => doUpdate = true), 1000 / tickPerSecond);
        button.innerText = "STOP";
    }
})
document.getElementById("step-button").addEventListener("click", function () {
    doUpdate = true;
})

document.getElementById("draw-button").addEventListener("click", () => {
    drawMode = !drawMode;
})

document.getElementById("tile-density").addEventListener("input", event => {
    canvas.tileSide = event.target.valueAsNumber;
    console.log(event.target.value)
    canvas.updateCanvas();
})

document.getElementById("tick-rate").addEventListener("input", event => {
    tickPerSecond = event.target.valueAsNumber;
    console.log(event.target.value)
    if (intervalID !== null) {
        clearInterval(intervalID)
        intervalID = setInterval((() => doUpdate = true), 1000 / tickPerSecond);
    }
})

function changeInterval(value = null) {
    clearInterval(intervalID)
    intervalID = setInterval((() => doUpdate = true), (value == null) ? value : 1000 / value );
}