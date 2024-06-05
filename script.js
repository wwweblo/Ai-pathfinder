// Инициализация холста и сетки
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rows = 50;
const cols = 50;
const cellSize = canvas.width / cols;
const grid = [];

// Заполнение сетки
for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
        grid[i][j] = { x: j, y: i, wall: false };
    }
}

// Обработчики событий для рисования препятствий

let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', function (event) {
    if (drawing) {
        const x = Math.floor(event.clientX / cellSize);
        const y = Math.floor(event.clientY / cellSize);
        if (x < cols && y < rows && x >= 0 && y >= 0) {
            grid[y][x].wall = true;
            drawGrid();
        }
    }
});

//Функция для отрисовки сетки

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.beginPath();
            ctx.rect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[i][j].wall ? 'black' : 'white';
            ctx.fill();
            ctx.strokeStyle = 'lightgrey';
            ctx.stroke();
        }
    }
}
/*Эвристическая функция. Вычисляет манхэттенское расстояние между двумя точками a и b.
Это используется в алгоритме A* для оценки расстояния до конечной точки.
*/
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/*Алгоритм A*
Использует открытый и закрытый наборы для отслеживания посещенных и непосещенных узлов.
cameFrom хранит путь, gScore и fScore содержат стоимости пути для каждого узла.
*/
function AStar(start, end) {
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

// Получение соседей узла
function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;
    if (x > 0) neighbors.push(grid[y][x - 1]);
    if (x < cols - 1) neighbors.push(grid[y][x + 1]);
    if (y > 0) neighbors.push(grid[y - 1][x]);
    if (y < rows - 1) neighbors.push(grid[y + 1][x]);
    return neighbors;
}
// Анимация пути
function animatePath(path) {
    let i = 0;
    function drawStep() {
        if (i < path.length) {
            const node = path[i];
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(node.x * cellSize + cellSize / 2, node.y * cellSize + cellSize / 2, cellSize / 4, 0, 2 * Math.PI);
            ctx.fill();
            i++;
            requestAnimationFrame(drawStep);
        }
    }
    drawStep();
}

const start = grid[Math.floor(rows / 2)][0];
const end = grid[Math.floor(rows / 2)][cols - 1];

setInterval(() => {
    drawGrid();
    const path = AStar(start, end);
    if (path.length > 0) animatePath(path);
}, 2000);
