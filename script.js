/**
 * 미로 경로 찾기 시각화
 * BFS(Breadth-First Search) 알고리즘을 사용한 미로 탐색 과정 시각화
 */

// 전역 변수 선언
const GRID_SIZE = 25; // 격자 크기 (25x25)
let grid = []; // 그리드 데이터 배열
let currentTool = 'wall'; // 현재 선택된 도구
let startCell = null; // 시작점 좌표
let endCell = null; // 도착점 좌표
let isAnimating = false; // 애니메이션 진행중 여부
let animationSpeed = 50; // 애니메이션 속도 (ms)
let animationTimeouts = []; // 애니메이션 timeout ID 배열

// DOM 요소 가져오기
const mazeGridElement = document.getElementById('maze-grid');
const toolButtons = document.querySelectorAll('.tool');
const startPathfindingButton = document.getElementById('start-pathfinding');
const clearMazeButton = document.getElementById('clear-maze');
const generateMazeButton = document.getElementById('generate-maze');
const animationSpeedInput = document.getElementById('animation-speed');

/**
 * 초기화 함수 - 페이지 로드 시 실행
 */
function initialize() {
    setupGrid();
    setupEventListeners();
}

/**
 * 그리드 설정 함수 - 그리드 생성 및 초기화
 */
function setupGrid() {
    mazeGridElement.innerHTML = ''; // 그리드 초기화
    grid = []; // 데이터 초기화

    // 그리드 생성
    for (let row = 0; row < GRID_SIZE; row++) {
        const gridRow = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            // 셀 객체 생성
            const cell = {
                row,
                col,
                isWall: false,
                isStart: false,
                isEnd: false,
                isVisited: false,
                isPath: false,
                element: null
            };

            // DOM 요소 생성
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            
            // 그리드에 셀 추가
            mazeGridElement.appendChild(cellElement);
            
            // 셀 객체에 DOM 요소 참조 저장
            cell.element = cellElement;
            gridRow.push(cell);
        }
        grid.push(gridRow);
    }
}

/**
 * 이벤트 리스너 설정 함수
 */
function setupEventListeners() {
    // 그리드 셀 클릭 및 드래그 이벤트
    let isMouseDown = false;
    mazeGridElement.addEventListener('mousedown', () => { isMouseDown = true; });
    document.addEventListener('mouseup', () => { isMouseDown = false; });
    
    // 셀 클릭/드래그 이벤트
    mazeGridElement.addEventListener('mousemove', (e) => {
        if (isMouseDown && !isAnimating && e.target.classList.contains('cell')) {
            handleCellInteraction(e.target);
        }
    });
    
    mazeGridElement.addEventListener('mousedown', (e) => {
        if (!isAnimating && e.target.classList.contains('cell')) {
            handleCellInteraction(e.target);
        }
    });

    // 도구 선택 버튼 이벤트
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isAnimating) {
                currentTool = button.dataset.tool;
                toolButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            }
        });
    });

    // 경로 찾기 시작 버튼
    startPathfindingButton.addEventListener('click', () => {
        if (!isAnimating && startCell && endCell) {
            startPathfinding();
        } else if (!startCell || !endCell) {
            alert('시작점과 도착점을 모두 설정해주세요.');
        }
    });

    // 미로 초기화 버튼
    clearMazeButton.addEventListener('click', () => {
        if (!isAnimating) {
            clearMaze();
        }
    });

    // 랜덤 미로 생성 버튼
    generateMazeButton.addEventListener('click', () => {
        if (!isAnimating) {
            generateRandomMaze();
        }
    });

    // 애니메이션 속도 조절
    animationSpeedInput.addEventListener('input', () => {
        animationSpeed = 101 - animationSpeedInput.value; // 반전: 높을수록 빠름
    });
}

/**
 * 셀 상호작용 처리 함수
 * @param {HTMLElement} cellElement - 상호작용한 셀 요소
 */
function handleCellInteraction(cellElement) {
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cell = grid[row][col];

    // 현재 도구에 따라 셀 상태 변경
    switch (currentTool) {
        case 'wall':
            // 시작점이나 도착점이 아닌 경우에만 벽 설정
            if (!cell.isStart && !cell.isEnd) {
                toggleWall(cell);
            }
            break;
        
        case 'start':
            // 도착점이 아닌 경우에만 시작점 설정
            if (!cell.isEnd) {
                setStartPoint(cell);
            }
            break;
        
        case 'end':
            // 시작점이 아닌 경우에만 도착점 설정
            if (!cell.isStart) {
                setEndPoint(cell);
            }
            break;
        
        case 'erase':
            // 모든 상태 제거
            clearCell(cell);
            break;
    }
}

/**
 * 벽 토글 함수
 * @param {Object} cell - 셀 객체
 */
function toggleWall(cell) {
    cell.isWall = !cell.isWall;
    cell.element.classList.toggle('wall');
}

/**
 * 시작점 설정 함수
 * @param {Object} cell - 셀 객체
 */
function setStartPoint(cell) {
    // 기존 시작점 제거
    if (startCell) {
        startCell.isStart = false;
        startCell.element.classList.remove('start');
    }
    
    // 새 시작점 설정
    clearCell(cell);
    cell.isStart = true;
    cell.element.classList.add('start');
    startCell = cell;
}

/**
 * 도착점 설정 함수
 * @param {Object} cell - 셀 객체
 */
function setEndPoint(cell) {
    // 기존 도착점 제거
    if (endCell) {
        endCell.isEnd = false;
        endCell.element.classList.remove('end');
    }
    
    // 새 도착점 설정
    clearCell(cell);
    cell.isEnd = true;
    cell.element.classList.add('end');
    endCell = cell;
}

/**
 * 셀 초기화 함수
 * @param {Object} cell - 셀 객체
 */
function clearCell(cell) {
    // 시작점, 도착점 참조 업데이트
    if (cell.isStart) startCell = null;
    if (cell.isEnd) endCell = null;
    
    // 셀 상태 초기화
    cell.isWall = false;
    cell.isStart = false;
    cell.isEnd = false;
    cell.isVisited = false;
    cell.isPath = false;
    
    // 셀 클래스 초기화
    cell.element.className = 'cell';
}

/**
 * 미로 전체 초기화 함수
 */
function clearMaze() {
    // 애니메이션 정리
    clearAnimations();
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            clearCell(grid[row][col]);
        }
    }
    
    startCell = null;
    endCell = null;
}

/**
 * 미로 방문, 경로 상태만 초기화 함수
 */
function clearPathAndVisited() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = grid[row][col];
            cell.isVisited = false;
            cell.isPath = false;
            cell.element.classList.remove('visited', 'path');
        }
    }
}

/**
 * 랜덤 미로 생성 함수
 */
function generateRandomMaze() {
    clearMaze();
    
    // 벽 밀도 (0-1 사이, 높을수록 벽이 많아짐)
    const wallDensity = 0.3;
    
    // 랜덤 벽 생성
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = grid[row][col];
            if (Math.random() < wallDensity) {
                cell.isWall = true;
                cell.element.classList.add('wall');
            }
        }
    }
    
    // 시작점과 도착점 설정을 위한 빈 공간 찾기
    const emptyCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (!grid[row][col].isWall) {
                emptyCells.push(grid[row][col]);
            }
        }
    }
    
    if (emptyCells.length >= 2) {
        // 시작점 설정
        const startIndex = Math.floor(Math.random() * emptyCells.length);
        setStartPoint(emptyCells[startIndex]);
        
        // 시작점을 빈 셀 목록에서 제거
        emptyCells.splice(startIndex, 1);
        
        // 도착점 설정
        const endIndex = Math.floor(Math.random() * emptyCells.length);
        setEndPoint(emptyCells[endIndex]);
    }
}

/**
 * 경로찾기 시작 함수
 */
function startPathfinding() {
    if (!startCell || !endCell) return;
    
    // 이전 경로찾기 결과 초기화
    clearPathAndVisited();
    clearAnimations();
    
    isAnimating = true;
    
    // BFS 알고리즘으로 경로 찾기
    const result = findPathBFS();
    
    // 경로찾기 결과에 따라 시각화
    if (result.path.length > 0) {
        animateVisited(result.visited, () => {
            animatePath(result.path, () => {
                isAnimating = false;
            });
        });
    } else {
        animateVisited(result.visited, () => {
            alert('경로를 찾을 수 없습니다.');
            isAnimating = false;
        });
    }
}

/**
 * BFS 알고리즘을 사용한 경로찾기 함수
 * @returns {Object} - { visited: 방문한 셀 배열, path: 찾은 경로 배열 }
 */
function findPathBFS() {
    const visited = []; // 방문한 셀 목록
    const queue = []; // BFS 큐
    const pathMap = new Map(); // 경로 추적 맵 (key: 'row,col', value: 이전 셀)
    
    // 시작점 큐에 추가
    queue.push(startCell);
    pathMap.set(`${startCell.row},${startCell.col}`, null);
    
    // BFS 시작
    while (queue.length > 0) {
        const current = queue.shift(); // 큐에서 셀 꺼내기
        
        // 방문 처리
        if (!current.isStart && !current.isEnd) {
            current.isVisited = true;
            visited.push(current);
        }
        
        // 도착점 찾음
        if (current === endCell) {
            break;
        }
        
        // 인접 셀 탐색 (상하좌우)
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;
            
            // 방문하지 않은 셀만 큐에 추가
            if (!pathMap.has(key)) {
                queue.push(neighbor);
                pathMap.set(key, current); // 경로 추적을 위해 이전 셀 저장
            }
        }
    }
    
    // 경로 생성 - 도착점부터 시작점까지 역추적
    const path = [];
    let current = endCell;
    const endKey = `${endCell.row},${endCell.col}`;
    
    // 경로가 존재하는 경우
    if (pathMap.has(endKey)) {
        while (current !== null && current !== startCell) {
            if (!current.isEnd) {
                path.unshift(current); // 경로의 앞쪽에 추가
            }
            current = pathMap.get(`${current.row},${current.col}`);
        }
    }
    
    return { visited, path };
}

/**
 * 인접한 셀 가져오기 함수
 * @param {Object} cell - 기준 셀
 * @returns {Array} - 인접한 셀 배열 (벽이 아닌 셀만)
 */
function getNeighbors(cell) {
    const { row, col } = cell;
    const neighbors = [];
    
    // 상하좌우 방향 정의
    const directions = [
        { row: -1, col: 0 }, // 위
        { row: 1, col: 0 },  // 아래
        { row: 0, col: -1 }, // 왼쪽
        { row: 0, col: 1 }   // 오른쪽
    ];
    
    // 각 방향 확인
    for (const dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;
        
        // 그리드 범위 내에 있는지 확인
        if (newRow >= 0 && newRow < GRID_SIZE && 
            newCol >= 0 && newCol < GRID_SIZE) {
            
            const neighbor = grid[newRow][newCol];
            
            // 벽이 아니고 방문하지 않은 셀만 추가
            if (!neighbor.isWall && !neighbor.isVisited) {
                neighbors.push(neighbor);
            }
        }
    }
    
    return neighbors;
}

/**
 * 방문한 셀 애니메이션 함수
 * @param {Array} visitedCells - 방문한 셀 배열
 * @param {Function} callback - 애니메이션 완료 후 콜백
 */
function animateVisited(visitedCells, callback) {
    visitedCells.forEach((cell, index) => {
        const timeout = setTimeout(() => {
            cell.element.classList.add('visited');
            
            // 모든 방문 셀 처리 완료 후 콜백 실행
            if (index === visitedCells.length - 1 && callback) {
                setTimeout(callback, animationSpeed);
            }
        }, index * animationSpeed);
        
        animationTimeouts.push(timeout);
    });
    
    // 방문 셀이 없는 경우 바로 콜백 실행
    if (visitedCells.length === 0 && callback) {
        callback();
    }
}

/**
 * 경로 애니메이션 함수
 * @param {Array} pathCells - 경로 셀 배열
 * @param {Function} callback - 애니메이션 완료 후 콜백
 */
function animatePath(pathCells, callback) {
    pathCells.forEach((cell, index) => {
        const timeout = setTimeout(() => {
            cell.isPath = true;
            cell.element.classList.add('path');
            
            // 모든 경로 셀 처리 완료 후 콜백 실행
            if (index === pathCells.length - 1 && callback) {
                callback();
            }
        }, index * (animationSpeed * 2)); // 경로 애니메이션은 좀 더 느리게
        
        animationTimeouts.push(timeout);
    });
    
    // 경로 셀이 없는 경우 바로 콜백 실행
    if (pathCells.length === 0 && callback) {
        callback();
    }
}

/**
 * 애니메이션 정리 함수 - 모든 timeout 제거
 */
function clearAnimations() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);
