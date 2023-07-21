// Constants
const WIDTH = 800; // Width of the canvas
const HEIGHT = 600; // Height of the canvas
const PLAYER_WIDTH = 40; // Width of the player ship
const PLAYER_HEIGHT = 20; // Height of the player ship
const ALIEN_ROWS = 3; // Number of rows of aliens
const ALIENS_PER_ROW = 10; // Number of aliens per row
const ALIEN_SIZE = 30; // Size of each alien
const ALIEN_SPACING = 40; // Spacing between aliens
const ALIEN_SPEED = 1; // Initial speed of the aliens
const ALIEN_SPEED_INCREMENT = 0.1; // Speed increment for each wave
const PLAYER_BULLET_SPEED = -5; // Speed of player shots
const ALIEN_BULLET_SPEED = 5; // Speed of aliens' shots
const BULLET_SPEED = 5; // Speed of bullets
const BULLET_COOLDOWN = 500; // Time between player shots in milliseconds
const ALIEN_SHOT_PROBABILITY = 0.005; // Probability of an alien shooting per frame

// Variables
let player;
let aliens = []; // Array of aliens objects to be drawn
let bullets = []; // Array of bullets objects to be drawn
let alienBullets = []; // Array of alien bullets objects to be drawn
let alienSpeed = ALIEN_SPEED; // Speed of aliens in pixels per frame
let gameOver = false; // Whether the game is over
let score = 0; // Score of the player
let scoreElement; // Score element in HTML

// Setup
function setup() {
  createCanvas(WIDTH, HEIGHT);

  player = new Player(); // Player object
  scoreElement = document.getElementById("score");
  createAliens(); // Create aliens objects to be drawn on the canvas
}

function draw() {
  background(0);
  if (!gameOver) {
    // Update the player's position and show it
    player.update();
    player.show();
    document.getElementById("score").innerHTML = score; // Update the score element
    if (frameCount % (60 / alienSpeed) === 0) {
      moveAliens(); // Move aliens every second (60 frames) based on their speed in pixels per frame (alienSpeed)
    }
    // Show aliens and their bullets on the canvas and shoot with a probability of ALIEN_SHOT_PROBABILITY per frame
    aliens.forEach((alien) => {
      alien.show();
      if (random() < ALIEN_SHOT_PROBABILITY) {
        alien.shoot();
      }
    });
    // Show alien bullets on the canvas and shoot with a probability of ALIEN_BULLET_SPEED per frame
    bullets.forEach((bullet) => {
      bullet.update();
      bullet.show();
    });

    // Check for bullet collisions and remove bullets that go offscreen
    checkBulletCollisions();
    checkBulletAlienCollision();

    // Check if there are any aliens left to shoot and respawn them if not
    if (aliens.length === 0) {
      respawnAliens();
    }
  } else {
    // If the game is over, show the game over screen
    background(0);
    showGameOver();
  }
}

function keyPressed() {
  // Shoot with spacebar
  if (key === " " && !gameOver) {
    player.shoot();
  }
}

class Player {
  // Player object to be drawn on the canvas and updated every frame based on the user's input and movement
  constructor() {
    this.x = WIDTH / 2;
    this.y = HEIGHT - 40;
  }

  show() {
    fill(255);
    rect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  // Move the player on the canvas based on the user's input and constrain it to the canvas
  update() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 5;
    } else if (keyIsDown(RIGHT_ARROW)) {
      this.x += 5;
    }

    this.x = constrain(this.x, 0, WIDTH - PLAYER_WIDTH);
  }

  shoot() {
    // Shoot with the spacebar key and add the bullet to the bullets array
    bullets.push(
      new Bullet(this.x + PLAYER_WIDTH / 2, this.y, PLAYER_BULLET_SPEED)
    );
  }
}

class Alien {
  // Alien object to be drawn on the canvas and updated every frame based on the user's input and movement
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isAlive = true;
  }

  show() {
    // Show the alien on the canvas if it is alive
    if (this.isAlive) {
      fill(0, 255, 0);
      rect(this.x, this.y, ALIEN_SIZE, ALIEN_SIZE);
    }
  }

  move() {
    // Move the alien on the canvas based on its speed
    this.x += alienSpeed;
  }

  shiftDown() {
    // Move the aliens down if they reach the bottom of the canvas
    this.y += ALIEN_SIZE + ALIEN_SPACING;
  }

  destroy() {
    // Destroy the alien if it reaches the bottom of the canvas or is hit by a bullet
    this.isAlive = false;
  }

  shoot() {
    // Shoot with a probability of ALIEN_SHOT_PROBABILITY per frame and add the bullet to the alienBullets array
    alienBullets.push(
      new Bullet(
        this.x + ALIEN_SIZE / 2,
        this.y + ALIEN_SIZE,
        ALIEN_BULLET_SPEED
      )
    );
  }
}

class Bullet {
  // Bullet object to be drawn on the canvas and updated every frame based on the user's input and movement
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = 2;
    this.height = 10;
  }
  show() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }
  // Move the bullet on the canvas based on its speed
  update() {
    this.y += this.speed;
  }

  offscreen() {
    return this.y < 0 || this.y > HEIGHT;
  }

  // Check for bullet collisions
  hits(target) {
    if (this.speed > 0) {
      // Alien bullet
      return (
        this.x + 2 > target.x && // Adjusting the width of the alien hitbox
        this.x < target.x + ALIEN_SIZE + 2 && // Adjusting the width of the alien hitbox
        this.y + 10 > target.y && // Adjusting the height of the alien hitbox
        this.y < target.y + ALIEN_SIZE
      );
    } else {
      //   Player bullet
      return (
        this.x > target.x &&
        this.x < target.x + PLAYER_WIDTH &&
        this.y > target.y &&
        this.y < target.y + PLAYER_HEIGHT
      );
    }
  }
}

function checkBulletCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (bullet.offscreen()) {
      bullets.splice(i, 1);
      continue;
    }
    if (bullet.hits(player)) {
      gameOver = true;
      break; // Stop checking for other collisions, as the game is over
    }
  }
}

function checkBulletAlienCollision() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    let collided = false;

    for (let j = aliens.length - 1; j >= 0; j--) {
      const alien = aliens[j];
      if (bullet.hits(alien)) {
        alien.destroy();
        bullets.splice(i, 1);
        score++;
        collided = true;
        break;
      }
    }

    if (!collided && bullet.speed > 0) {
      bullet.y += bullet.speed;
    }
  }

  // Remove alien bullets that go offscreen or hit the bottom of the canvas
  for (let i = alienBullets.length - 1; i >= 0; i--) {
    const alienBullet = alienBullets[i];
    if (alienBullet.offscreen() || alienBullet.y >= HEIGHT) {
      alienBullets.splice(i, 1);
      if (alienBullet.y >= HEIGHT) {
        // Game over if an alien bullet reaches the bottom of the canvas
        gameOver = true;
      }
    }
  }
}

// Create aliens objects to be drawn on the canvas based on the number of rows and aliens per row constants and their spacing
function createAliens() {
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIENS_PER_ROW; col++) {
      aliens.push(
        new Alien(
          col * (ALIEN_SIZE + ALIEN_SPACING) + 50,
          row * (ALIEN_SIZE + ALIEN_SPACING) + 50
        )
      );
    }
  }
}

// Move aliens every second (60 frames) based on their speed in pixels per frame (alienSpeed)
function moveAliens() {
  let hitEdge = false;

  aliens.forEach((alien) => {
    alien.move();
    if (alien.x <= 0 || alien.x >= WIDTH - ALIEN_SIZE) {
      hitEdge = true;
    }
  });

  if (hitEdge) {
    aliens.forEach((alien) => {
      alien.shiftDown();
    });
  }

  alienSpeed += ALIEN_SPEED_INCREMENT;
}

function respawnAliens() {
  alienSpeed = ALIEN_SPEED;
  createAliens();
}
