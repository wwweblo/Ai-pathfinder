const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const padding = 100;
const rows = 50;
const cols = 50;

let cellSize;
let grid = [];
let animationFrameId;

function initializeCanvas() {
    const availableWidth = window.innerWidth - 2 * padding;
    const availableHeight = window.innerHeight - 2 * padding;
    cellSize = Math.min(availableWidth / cols, availableHeight / rows);
    canvas.width = cellSize * cols;
    canvas.height = cellSize * rows;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    grid = [];

    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            grid[i][j] = { x: j, y: i, wall: false };
        }
    }
    drawGrid();
}

function resizeCanvas() {
    initializeCanvas();
}

window.addEventListener('resize', resizeCanvas);
initializeCanvas();

let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', function (event) {
    if (drawing) {
        updateGridOnMouseMove(event);
    }
});

function updateGridOnMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    if (x < cols && y < rows && x >= 0 && y >= 0) {
        grid[y][x].wall = true;
        drawCell(x, y);
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            drawCell(j, i);
        }
    }
}

function drawCell(x, y) {
    ctx.beginPath();
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.fillStyle = grid[y][x].wall ? 'black' : 'white';
    ctx.fill();
    ctx.strokeStyle = 'lightgrey';
    ctx.stroke();
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

async function AStar(start, end) {
    const openSet = [start];
    const closedSet = [];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

        if (current === end) {
            const path = [];
            while (current) {
                path.push(current);
                current = cameFrom.get(current);
            }
            return path.reverse();
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.wall) continue;

            const tentativeGScore = gScore.get(current) + 1;
            if (!openSet.includes(neighbor)) openSet.push(neighbor);
            else if (tentativeGScore >= gScore.get(neighbor)) continue;

            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
        }
    }
    return [];
}

function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;
    const bishopMovement = document.getElementById('bishopMovementCheckbox').checked;

    // Прямые соседи
    if (x > 0) neighbors.push(grid[y][x - 1]);
    if (x < cols - 1) neighbors.push(grid[y][x + 1]);
    if (y > 0) neighbors.push(grid[y - 1][x]);
    if (y < rows - 1) neighbors.push(grid[y + 1][x]);

    // Диагональные соседи
    if (bishopMovement) {
        if (x > 0 && y > 0) neighbors.push(grid[y - 1][x - 1]);
        if (x < cols - 1 && y > 0) neighbors.push(grid[y - 1][x + 1]);
        if (x > 0 && y < rows - 1) neighbors.push(grid[y + 1][x - 1]);
        if (x < cols - 1 && y < rows - 1) neighbors.push(grid[y + 1][x + 1]);
    }

    return neighbors;
}

async function animatePath(path) {
    let i = 0;

    function drawStep() {
        if (i < path.length) {
            const node = path[i];
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(node.x * cellSize + cellSize / 2, node.y * cellSize + cellSize / 2, cellSize / 4, 0, 2 * Math.PI);
            ctx.fill();
            i++;
            animationFrameId = requestAnimationFrame(drawStep);
        } else {
            resetButton();
        }
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    drawStep();
}

async function updatePath() {
    const bishopSpawn = document.getElementById('bishopSpawn').checked;
    let start, end;

    if (bishopSpawn) {
        start = grid[0][0];
        end = grid[rows - 1][cols - 1];
    } else {
        start = grid[Math.floor(rows / 2)][0];
        end = grid[Math.floor(rows / 2)][cols - 1];
    }

    setButtonLoading(true);
    const path = await AStar(start, end);
    if (path.length > 0) {
        drawGrid();
        await animatePath(path);
    } else {
        resetButton();
    }
}

function setButtonLoading(isLoading) {
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    if (isLoading) {
        buttonText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
    } else {
        buttonText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
    }
}

function resetButton() {
    setButtonLoading(false);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('find-path').addEventListener('click', updatePath);

    document.getElementById('clear-obstacles').addEventListener('click', () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                grid[i][j].wall = false;
            }
        }
        drawGrid();
    });
});