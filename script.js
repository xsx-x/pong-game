// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const COMPUTER_SPEED = 5.5;
const BALL_SPEED = 5;

// Game objects
const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const computer = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: BALL_SIZE,
    height: BALL_SIZE,
    dx: BALL_SPEED,
    dy: BALL_SPEED
};

let playerScore = 0;
let computerScore = 0;

// Keyboard state
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking for player paddle
let mouseY = canvas.height / 2;
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update game state
function update() {
    // Player paddle control (mouse or arrow keys)
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.dy = -PADDLE_SPEED;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.dy = PADDLE_SPEED;
    } else {
        // Use mouse position
        const targetY = mouseY - PADDLE_HEIGHT / 2;
        const diff = targetY - player.y;
        if (Math.abs(diff) > 5) {
            player.dy = diff > 0 ? PADDLE_SPEED : -PADDLE_SPEED;
        } else {
            player.dy = 0;
        }
    }

    // Update player paddle position
    player.y += player.dy;
    
    // Boundary collision for player paddle
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    if (computerCenter < ball.y - 35) {
        computer.dy = COMPUTER_SPEED;
    } else if (computerCenter > ball.y + 35) {
        computer.dy = -COMPUTER_SPEED;
    } else {
        computer.dy = 0;
    }

    // Update computer paddle position
    computer.y += computer.dy;
    
    // Boundary collision for computer paddle
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y < 0 || ball.y + ball.height > canvas.height) {
        ball.dy = -ball.dy;
        // Clamp ball position to prevent getting stuck
        if (ball.y < 0) ball.y = 0;
        if (ball.y + ball.height > canvas.height) ball.y = canvas.height - ball.height;
    }

    // Ball collision with paddles
    if (
        ball.x < player.x + player.width &&
        ball.y + ball.height > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width; // Prevent ball from getting stuck
        
        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - player.y) / player.height;
        ball.dy += (hitPos - 0.5) * 4;
    }

    if (
        ball.x + ball.width > computer.x &&
        ball.y + ball.height > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.width; // Prevent ball from getting stuck
        
        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - computer.y) / computer.height;
        ball.dy += (hitPos - 0.5) * 4;
    }

    // Ball out of bounds (scoring)
    if (ball.x < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Update scoreboard
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line (dashed)
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Draw computer paddle
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    ctx.shadowBlur = 0;

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();