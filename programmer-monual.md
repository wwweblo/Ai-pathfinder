### Методичка по коду JavaScript: Нажатие на кнопку "Find Path"

Когда пользователь нажимает на кнопку "Find Path", происходит несколько ключевых действий, которые включают обновление состояния кнопки, выполнение алгоритма A*, а также анимацию найденного пути. Ниже приводится пошаговое описание этого процесса.

#### Основные компоненты:
1. **Инициализация сетки**: Создание и отрисовка сетки из ячеек.
2. **Обработчики событий**: Добавление препятствий с помощью мыши.
3. **Алгоритм A***: Поиск пути.
4. **Анимация пути**: Отображение найденного пути.

### Пошаговый процесс при нажатии кнопки "Find Path":

1. **Инициализация кнопки и обработчика событий**:
    - В `DOMContentLoaded` добавляется обработчик события для кнопки "Find Path":
    ```javascript
    document.getElementById('find-path').addEventListener('click', updatePath);
    ```

2. **Функция `updatePath`**:
    - Начинается с вызова `setButtonLoading(true)`, чтобы изменить текст кнопки на индикатор загрузки:
    ```javascript
    async function updatePath() {
        setButtonLoading(true);
        const path = await AStar(start, end);
        if (path.length > 0) {
            drawGrid();
            await animatePath(path);
        } else {
            resetButton();
        }
    }
    ```

3. **Изменение состояния кнопки `setButtonLoading(true)`**:
    - Прячет текст кнопки и показывает индикатор загрузки:
    ```javascript
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
    ```

4. **Выполнение алгоритма A***:
    - `AStar` выполняет поиск пути от начальной до конечной точки. Алгоритм использует открытый и закрытый списки для отслеживания посещенных и непосещенных узлов:
    ```javascript
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
    ```

5. **Отрисовка сетки и анимация пути**:
    - Если путь найден, сетка перерисовывается, а затем вызывается функция `animatePath` для отображения пути:
    ```javascript
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
    ```

6. **Сброс состояния кнопки `resetButton`**:
    - После завершения анимации пути, состояние кнопки возвращается к исходному:
    ```javascript
    function resetButton() {
        setButtonLoading(false);
    }
    ```

### Взаимодействие с пользователем:
1. **Нажатие на кнопку "Find Path"** запускает `updatePath`.
2. **Кнопка меняет состояние на загрузку** с помощью `setButtonLoading(true)`.
3. **Выполняется алгоритм A*** для поиска пути.
4. **Если путь найден, он анимируется с помощью `animatePath`**.
5. **После завершения анимации состояние кнопки восстанавливается** с помощью `resetButton`.

### Дополнительно:
- **Обработчик для кнопки "Clear Obstacles"**:
    ```javascript
    document.getElementById('clear-obstacles').addEventListener('click', () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                grid[i][j].wall = false;
            }
        }
        drawGrid();
    });
    ```

Этот обработчик очищает все препятствия и перерисовывает сетку.

#Astar
Алгоритм A* (A-star) — это популярный алгоритм поиска пути, который находит оптимальный маршрут от начальной точки к конечной. Он комбинирует достоинства алгоритмов поиска по графу (например, Dijkstra) и эвристического поиска, что позволяет ему быть как оптимальным, так и эффективным. 

### Основные компоненты алгоритма A*:
1. **Открытый список (openSet)**: Узлы, которые нужно исследовать.
2. **Закрытый список (closedSet)**: Узлы, которые уже исследованы.
3. **gScore**: Стоимость пути от начальной точки до текущего узла.
4. **fScore**: Оценочная стоимость пути от начальной точки до конечной, проходящего через текущий узел.
5. **cameFrom**: Карта, хранящая информацию о том, откуда пришёл узел.

### Шаги выполнения алгоритма A*:

1. **Инициализация**:
    - Начальная точка добавляется в `openSet`.
    - `gScore` для начальной точки устанавливается в 0.
    - `fScore` для начальной точки вычисляется как эвристическая оценка расстояния до конечной точки.

2. **Основной цикл**:
    - Пока в `openSet` есть узлы:
        - **Выбор текущего узла**:
            - Текущий узел выбирается как узел с наименьшим значением `fScore`.
        - **Проверка, достигнута ли цель**:
            - Если текущий узел является конечным, путь найден.
        - **Перемещение текущего узла в `closedSet`**:
            - Удаление текущего узла из `openSet` и добавление его в `closedSet`.
        - **Обработка соседей текущего узла**:
            - Для каждого соседа:
                - Если сосед в `closedSet` или является стеной, он игнорируется.
                - Вычисление временного `gScore` для соседа.
                - Если сосед не в `openSet` или временное `gScore` меньше ранее записанного значения:
                    - Обновление `cameFrom`, `gScore`, `fScore` для соседа.
                    - Если сосед не в `openSet`, добавление его туда.

3. **Возврат пути**:
    - Если конечный узел достигнут, восстанавливается путь, используя `cameFrom`.

### Код алгоритма A*:

```javascript
async function AStar(start, end) {
    const openSet = [start];
    const closedSet = [];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));

    while (openSet.length > 0) {
        // Найти узел в openSet с наименьшим значением fScore
        let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

        // Если текущий узел является конечным, восстановить путь и вернуть его
        if (current === end) {
            const path = [];
            while (current) {
                path.push(current);
                current = cameFrom.get(current);
            }
            return path.reverse();
        }

        // Переместить текущий узел из openSet в closedSet
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        // Обработать каждого соседа текущего узла
        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.wall) continue;

            // Вычислить временное значение gScore для соседа
            const tentativeGScore = gScore.get(current) + 1;

            // Если сосед не в openSet, добавить его
            if (!openSet.includes(neighbor)) openSet.push(neighbor);
            // Если временное значение gScore больше или равно текущему, пропустить этот узел
            else if (tentativeGScore >= gScore.get(neighbor)) continue;

            // Обновить пути и стоимости
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
        }
    }
    // Вернуть пустой массив, если путь не найден
    return [];
}
```

### Подробное объяснение расчётов:

1. **Инициализация**:
    ```javascript
    const openSet = [start];
    const closedSet = [];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));
    ```
    - Начальная точка добавляется в `openSet`.
    - `gScore` начальной точки (стоимость пути от начальной точки до самой себя) устанавливается в 0.
    - `fScore` начальной точки устанавливается как эвристическая оценка расстояния до конечной точки (в данном случае, Манхэттенское расстояние).

2. **Основной цикл**:
    ```javascript
    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);
    ```
    - Выбирается узел с наименьшим значением `fScore` из `openSet`.

3. **Проверка текущего узла**:
    ```javascript
    if (current === end) {
        const path = [];
        while (current) {
            path.push(current);
            current = cameFrom.get(current);
        }
        return path.reverse();
    }
    ```
    - Если текущий узел является конечным, восстановите путь, используя `cameFrom`.

4. **Обработка текущего узла**:
    ```javascript
    openSet.splice(openSet.indexOf(current), 1);
    closedSet.push(current);
    ```
    - Текущий узел удаляется из `openSet` и добавляется в `closedSet`.

5. **Обработка соседей**:
    ```javascript
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
    ```
    - Для каждого соседа текущего узла:
        - Если сосед в `closedSet` или является стеной, пропустить его.
        - Вычислить временное `gScore` как сумму `gScore` текущего узла и стоимости перехода к соседу (в данном случае, всегда 1).
        - Если сосед не в `openSet`, добавить его.
        - Если временное `gScore` меньше ранее записанного значения `gScore` соседа, обновить значения `cameFrom`, `gScore`, `fScore`.

6. **Возврат пустого пути, если маршрут не найден**:
    ```javascript
    return [];
    ```
    - Если `openSet` пуст, и путь не найден, вернуть пустой массив.

### Эвристическая функция:
```javascript
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
```
- Манхэттенское расстояние используется как эвристика, что позволяет оценивать расстояние до конечной точки. Эта функция определяет, насколько далеко находится узел от конечной точки, не учитывая препятствия.

Таким образом, алгоритм A* эффективно ищет путь с минимальной стоимостью от начальной точки к конечной, используя комбинацию фактической стоимости пути (`gScore`) и эвристической оценки оставшейся стоимости пути (`fScore`).