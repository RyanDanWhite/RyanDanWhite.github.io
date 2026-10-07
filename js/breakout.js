/**
 * Breakout Game - HTML5 Canvas
 * ============================
 * 
 * A simple Breakout game triggered by the easter egg.
 * Controls: Mouse movement for paddle, Arrow keys, Spacebar to restart, Escape to exit.
 */

class BreakoutGame {
	constructor() {
		this.canvas = document.getElementById('breakout-canvas');
		this.overlay = document.getElementById('game-overlay');
		this.trigger = document.getElementById('easter-egg-trigger');
		
		// Create elements if they don't exist
		if (!this.trigger) {
			this.trigger = document.createElement('div');
			this.trigger.id = 'easter-egg-trigger';
			this.trigger.setAttribute('aria-hidden', 'true');
			document.body.appendChild(this.trigger);
		}
		
		if (!this.overlay) {
			this.overlay = document.createElement('div');
			this.overlay.id = 'game-overlay';
			document.body.appendChild(this.overlay);
		}
		
		if (!this.canvas) {
			this.canvas = document.createElement('canvas');
			this.canvas.id = 'breakout-canvas';
			this.canvas.width = 480;
			this.canvas.height = 320;
			this.overlay.appendChild(this.canvas);
		}
		
		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		this.isRunning = false;
		this.animationId = null;
		
		this.initGame();
		this.setupEventListeners();
	}
	
	initGame() {
		// Paddle
		this.paddle = {
			x: this.width / 2 - 40,
			y: this.height - 20,
			width: 80,
			height: 10,
			speed: 7
		};
		this.paddle.dx = 0;
		
		// Ball
		this.ball = {
			x: this.width / 2,
			y: this.height - 50,
			radius: 5,
			dx: 3,
			dy: -3,
			speed: 3
		};
		
		// Bricks: 4 rows x 6 columns
		this.bricks = [];
		const brickWidth = 60;
		const brickHeight = 12;
		const padding = 10;
		const offsetX = (this.width - (6 * (brickWidth + padding))) / 2;
		const offsetY = 30;
		
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 6; col++) {
				this.bricks.push({
					x: offsetX + col * (brickWidth + padding),
					y: offsetY + row * (brickHeight + padding),
					width: brickWidth,
					height: brickHeight,
					active: true
				});
			}
		}
		
		this.gameOver = false;
	}
	
	setupEventListeners() {
		this.trigger.addEventListener('click', () => this.start());
		
		document.addEventListener('mousemove', (e) => {
			if (!this.isRunning) return;
			
			const rect = this.canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			
			const speed = 6;
			if (mouseX < this.paddle.x) {
				this.paddle.dx = -speed;
			} else if (mouseX > this.paddle.x + this.paddle.width) {
				this.paddle.dx = speed;
			} else {
				this.paddle.dx = 0;
			}
		});
		
		document.addEventListener('keydown', (e) => {
			if (!this.isRunning) return;
			
			if (e.key === 'ArrowLeft') {
				this.paddle.dx = -6;
			} else if (e.key === 'ArrowRight') {
				this.paddle.dx = 6;
			} else if (e.key === ' ') {
				e.preventDefault();
				if (this.gameOver) {
					this.initGame();
					this.draw();
				}
			} else if (e.key === 'Escape') {
				this.stop();
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (!this.isRunning) return;
			
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				this.paddle.dx = 0;
			}
		});
		
		// Close on overlay click (outside canvas)
		this.overlay.addEventListener('click', (e) => {
			if (e.target === this.overlay) {
				this.stop();
			}
		});
	}
	
	start() {
		if (this.isRunning) return;
		
		this.isRunning = true;
		this.overlay.classList.add('active');
		this.gameOver = false;
		this.initGame();
		this.gameLoop();
	}
	
	stop() {
		this.isRunning = false;
		this.overlay.classList.remove('active');
		
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}
	
	gameLoop() {
		if (!this.isRunning) return;
		
		this.update();
		this.draw();
		
		if (!this.gameOver) {
			this.animationId = requestAnimationFrame(() => this.gameLoop());
		}
	}
	
	update() {
		// Update paddle position
		this.paddle.x += this.paddle.dx;
		
		// Paddle boundaries
		if (this.paddle.x < 0) this.paddle.x = 0;
		if (this.paddle.x + this.paddle.width > this.width) {
			this.paddle.x = this.width - this.paddle.width;
		}
		
		// Update ball position
		this.ball.x += this.ball.dx;
		this.ball.y += this.ball.dy;
		
		// Ball collision with walls
		if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.width) {
			this.ball.dx = -this.ball.dx;
			this.ball.x = Math.max(this.ball.radius, Math.min(this.width - this.ball.radius, this.ball.x));
		}
		
		if (this.ball.y - this.ball.radius < 0) {
			this.ball.dy = -this.ball.dy;
			this.ball.y = this.ball.radius;
		}
		
		// Ball collision with paddle
		if (this.ball.y + this.ball.radius > this.paddle.y &&
		    this.ball.x > this.paddle.x &&
		    this.ball.x < this.paddle.x + this.paddle.width) {
			this.ball.dy = -this.ball.dy;
			this.ball.y = this.paddle.y - this.ball.radius;
		}
		
		// Game over if ball falls
		if (this.ball.y - this.ball.radius > this.height) {
			this.gameOver = true;
		}
		
		// Brick collisions
		for (const brick of this.bricks) {
			if (!brick.active) continue;
			
			if (this.ball.x > brick.x &&
			    this.ball.x < brick.x + brick.width &&
			    this.ball.y > brick.y &&
			    this.ball.y < brick.y + brick.height) {
				
				this.ball.dy = -this.ball.dy;
				brick.active = false;
			}
		}
		
		// Check if all bricks cleared
		if (this.bricks.every(b => !b.active)) {
			this.gameOver = true;
		}
	}
	
	draw() {
		// Clear canvas
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		// Draw paddle
		this.ctx.fillStyle = '#ddd';
		this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
		
		// Draw ball
		this.ctx.fillStyle = '#ddd';
		this.ctx.beginPath();
		this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
		this.ctx.fill();
		
		// Draw bricks
		this.ctx.fillStyle = '#4caf50';
		for (const brick of this.bricks) {
			if (brick.active) {
				this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
			}
		}
		
		// Draw game over message
		if (this.gameOver) {
			this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
			this.ctx.fillRect(0, 0, this.width, this.height);
			
			this.ctx.fillStyle = '#ddd';
			this.ctx.font = 'bold 16px Arial';
			this.ctx.textAlign = 'center';
			
			const bricksLeft = this.bricks.filter(b => b.active).length;
			const message = bricksLeft === 0 ? 'You Won!' : 'Game Over!';
			this.ctx.fillText(message, this.width / 2, this.height / 2 - 10);
			
			this.ctx.font = '12px Arial';
			this.ctx.fillText('Press Space to Restart', this.width / 2, this.height / 2 + 15);
			this.ctx.fillText('Press Escape to Exit', this.width / 2, this.height / 2 + 30);
		}
	}
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
	// Delay initialization to ensure existing scripts have run
	setTimeout(() => {
		new BreakoutGame();
	}, 100);
});
