// Game constants
const GRID_SIZE = 20;
const INITIAL_GAME_SPEED = 200; // milliseconds

// Game variables
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15, type: 'apple' };
let direction = 'right';
let score = 0;
let gameLoop;
let level = 1;
let gameSpeed = INITIAL_GAME_SPEED;

// DOM elements
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over');
const levelElement = document.getElementById('level');

// SVG strings
const snakeHeadSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 50 10 Q 90 25 90 50 Q 90 75 50 90 Q 10 75 10 50 Q 10 25 50 10" fill="#4CAF50" stroke="#45a049" stroke-width="2"/>
  <ellipse cx="30" cy="40" rx="5" ry="7" fill="black"/>
  <ellipse cx="70" cy="40" rx="5" ry="7" fill="black"/>
  <path d="M 40 70 Q 50 80 60 70" fill="none" stroke="#45a049" stroke-width="2"/>
  <path d="M 25 20 Q 50 0 75 20" fill="none" stroke="#45a049" stroke-width="2"/>
</svg>`;

const snakeBodySVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 40 Q 50 0 90 40 Q 50 80 10 40" fill="#4CAF50" stroke="#45a049" stroke-width="2"/>
  <path d="M 20 40 Q 50 10 80 40" fill="none" stroke="#45a049" stroke-width="2"/>
  <path d="M 20 40 Q 50 70 80 40" fill="none" stroke="#45a049" stroke-width="2"/>
</svg>`;

const foodSVGs = {
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="60" r="35" fill="#FF5722"/>
    <path d="M 50 25 Q 60 10 70 25" fill="none" stroke="#4CAF50" stroke-width="5"/>
    <path d="M 30 50 Q 50 70 70 50" fill="none" stroke="#D84315" stroke-width="2"/>
  </svg>`,
  banana: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M 20 80 Q 10 40 40 20 Q 60 10 80 20 Q 50 30 40 60 Q 35 75 20 80" fill="#FFEB3B" stroke="#FDD835" stroke-width="2"/>
    <path d="M 30 70 Q 25 50 45 30" fill="none" stroke="#FDD835" stroke-width="2"/>
  </svg>`,
  strawberry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M 50 10 Q 80 40 50 90 Q 20 40 50 10" fill="#E91E63" stroke="#C2185B" stroke-width="2"/>
    <path d="M 40 20 L 60 20" stroke="#4CAF50" stroke-width="5"/>
    <circle cx="30" cy="40" r="3" fill="#FFEB3B"/>
    <circle cx="45" cy="60" r="3" fill="#FFEB3B"/>
    <circle cx="60" cy="35" r="3" fill="#FFEB3B"/>
    <circle cx="55" cy="70" r="3" fill="#FFEB3B"/>
  </svg>`
};

// Initialize game
function initGame() {
    snake = [{ x: 10, y: 10 }];
    food = getRandomFood();
    direction = 'right';
    score = 0;
    level = 1;
    gameSpeed = INITIAL_GAME_SPEED;
    updateScore();
    updateLevel();
    drawGame();
}

// Game loop
function gameStep() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    if (eatFood()) {
        score += getFoodValue(food.type);
        updateScore();
        food = getRandomFood();
        if (score >= level * 50) {
            levelUp();
        }
    }
    drawGame();
}

// Move the snake
function moveSnake() {
    const head = { ...snake[0] };
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    snake.unshift(head);
    if (!eatFood()) {
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    return (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
}

// Check if snake eats food
function eatFood() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// Get random food
function getRandomFood() {
    const types = ['apple', 'banana', 'strawberry'];
    return {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: types[Math.floor(Math.random() * types.length)]
    };
}

// Get food value based on type
function getFoodValue(type) {
    switch (type) {
        case 'apple': return 10;
        case 'banana': return 15;
        case 'strawberry': return 20;
        default: return 10;
    }
}

// Draw game on the board
function drawGame() {
    gameBoard.innerHTML = '';
    snake.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y + 1;
        snakeElement.style.gridColumnStart = segment.x + 1;
        snakeElement.innerHTML = index === 0 ? snakeHeadSVG : snakeBodySVG;
        snakeElement.style.transform = `rotate(${getRotation(index)}deg)`;
        gameBoard.appendChild(snakeElement);
    });

    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.innerHTML = foodSVGs[food.type];
    gameBoard.appendChild(foodElement);
}

// Get rotation for snake segments
function getRotation(index) {
    if (index === 0) {
        switch (direction) {
            case 'up': return 0;
            case 'right': return 90;
            case 'down': return 180;
            case 'left': return 270;
        }
    }
    return 0;
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Update level display
function updateLevel() {
    levelElement.textContent = `Level: ${level}`;
}

// Level up
function levelUp() {
    level++;
    gameSpeed = Math.max(50, INITIAL_GAME_SPEED - level * 10);
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
    updateLevel();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameOverScreen.classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
}

// Start game
function startGame() {
    initGame();
    gameOverScreen.classList.add('hidden');
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
    }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;
gameBoard.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});
gameBoard.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'left') direction = 'right';
        else if (dx < 0 && direction !== 'right') direction = 'left';
    } else {
        if (dy > 0 && direction !== 'up') direction = 'down';
        else if (dy < 0 && direction !== 'down') direction = 'up';
    }
});

// Initialize game board
gameBoard.style.display = 'grid';
gameBoard.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
gameBoard.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

// Initial game setup
initGame();
