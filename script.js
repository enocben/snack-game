// Snake Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;
const canvasSize = 400;
let snake = [{ x: 8 * box, y: 10 * box }];
let direction = 'RIGHT';
let food = randomFood();
let score = 0;
let gameInterval = null;
let isRunning = false;
let isPaused = false;

// Confetti effect amélioré
function confettiBurst(x, y) {
    const confettiCount = 32;
    const confetti = [];
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: x + box / 2,
            y: y + box / 2,
            r: Math.random() * 2.5 + 2.5,
            color: `hsl(${Math.random() * 360}, 90%, 60%)`,
            dx: (Math.random() - 0.5) * 2.6,
            dy: (Math.random() - 1.1) * 2.7,
            alpha: 1,
            dr: (Math.random() - 0.5) * 0.08,
            da: -0.015 - Math.random() * 0.01
        });
    }
    let frames = 0;
    const maxFrames = 38;
    function animateConfetti() {
        frames++;
        for (let c of confetti) {
            c.x += c.dx;
            c.y += c.dy;
            c.dy += 0.09; // gravity plus douce
            c.alpha += c.da;
            c.r += c.dr;
            if (c.r < 1.2) c.r = 1.2;
        }
        ctx.save();
        ctx.globalAlpha = 0.7;
        for (let c of confetti) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
            ctx.fillStyle = c.color;
            ctx.globalAlpha = Math.max(0, c.alpha);
            ctx.fill();
        }
        ctx.restore();
        if (frames < maxFrames) {
            requestAnimationFrame(animateConfetti);
        }
    }
    animateConfetti();
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Affichage des messages d'état
    if (!isRunning) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Appuie sur Entrée pour jouer', canvas.width/2, canvas.height/2);
        ctx.restore();
        return;
    }
    if (isPaused) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pause', canvas.width/2, canvas.height/2);
        ctx.restore();
        return;
    }

    // Draw snake avec dégradé
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            ctx.fillStyle = '#4caf50'; // Tête
        } else {
            // Dégradé du vert : plus on va vers la queue, plus c'est foncé et transparent
            const percent = i / (snake.length - 1 || 1);
            // du vert vif à vert foncé
            const light = 60 - percent * 35; // 60% (tête) à 25% (queue)
            const alpha = 0.9 - percent * 0.6; // 0.9 (près de la tête) à 0.3 (queue)
            ctx.fillStyle = `hsla(135, 60%, ${light}%, ${alpha})`;
        }
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(food.x, food.y, box, box);

    // Move snake
    let head = { ...snake[0] };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // Wall collision
    if (
        head.x < 0 || head.x >= canvasSize ||
        head.y < 0 || head.y >= canvasSize ||
        collision(head, snake)
    ) {
        clearInterval(gameInterval);
        document.getElementById('restartBtn').style.display = 'inline-block';
        isRunning = false;
        return;
    }

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').innerText = 'Score : ' + score;
        confettiBurst(head.x, head.y); // Effet confetti
        food = randomFood();
    } else {
        snake.pop();
    }
    snake.unshift(head);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function keyDownHandler(e) {
    if (e.key === 'Enter') {
        if (!isRunning) {
            // Si le bouton Rejouer est visible, on relance aussi
            if (document.getElementById('restartBtn').style.display !== 'none') {
                resetGame();
            }
            startGame();
        }
    } else if (e.key === ' ') {
        if (isRunning) {
            isPaused = !isPaused;
        }
    } else if (!isRunning || isPaused) {
        // Bloque les directions si le jeu n'est pas en cours
        return;
    } else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
}

document.addEventListener('keydown', keyDownHandler);

document.getElementById('restartBtn').addEventListener('click', () => {
    resetGame();
    startGame();
});

document.getElementById('restartBtn').style.display = 'none';

function startGame() {
    isRunning = true;
    isPaused = false;
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        draw();
    }, 100);
}

function resetGame() {
    snake = [{ x: 8 * box, y: 10 * box }];
    direction = 'RIGHT';
    food = randomFood();
    score = 0;
    document.getElementById('score').innerText = 'Score : 0';
    document.getElementById('restartBtn').style.display = 'none';
}

draw(); // Affiche le message d'accueil au chargement

