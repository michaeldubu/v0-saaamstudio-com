"use client"

import { useState } from "react"
import { Play, Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-mobile"

// Example game data structure
interface GameExample {
  id: string
  title: string
  description: string
  thumbnail: string
  code: string
  author: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
}

// Example games collection
const EXAMPLE_GAMES: GameExample[] = [
  {
    id: "simple-platformer",
    title: "Simple Platformer",
    description: "A basic platformer game with jumping mechanics and collectibles.",
    thumbnail: "/placeholder.svg?height=200&width=320",
    code: `// Simple Platformer Example
// A basic platformer with jumping and collectibles

SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game variables
let player = {
  x: 100,
  y: 300,
  width: 40,
  height: 60,
  velocityX: 0,
  velocityY: 0,
  speed: 200,
  jumpForce: 500,
  isGrounded: false,
  color: "#4488FF"
};

let platforms = [
  { x: 0, y: 500, width: 800, height: 100 },
  { x: 200, y: 400, width: 200, height: 20 },
  { x: 500, y: 300, width: 200, height: 20 },
  { x: 100, y: 200, width: 200, height: 20 }
];

let coins = [
  { x: 250, y: 370, width: 20, height: 20, collected: false },
  { x: 550, y: 270, width: 20, height: 20, collected: false },
  { x: 150, y: 170, width: 20, height: 20, collected: false }
];

let score = 0;
const gravity = 1200;

function create() {
  console.log("Game created!");
}

function step(deltaTime) {
  // Handle player input
  player.velocityX = 0;
  
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
    player.velocityX = -player.speed;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.right) || SAAAM.keyboardCheck(SAAAM.vk.d)) {
    player.velocityX = player.speed;
  }
  
  // Jumping
  if ((SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w) || 
       SAAAM.keyboardCheck(SAAAM.vk.space)) && player.isGrounded) {
    player.velocityY = -player.jumpForce;
    player.isGrounded = false;
  }
  
  // Apply gravity
  player.velocityY += gravity * deltaTime;
  
  // Update player position
  player.x += player.velocityX * deltaTime;
  player.y += player.velocityY * deltaTime;
  
  // Check platform collisions
  player.isGrounded = false;
  for (const platform of platforms) {
    if (checkCollision(player, platform)) {
      // Only resolve collision if player is falling down
      if (player.velocityY > 0) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
      }
    }
  }
  
  // Check coin collisions
  for (const coin of coins) {
    if (!coin.collected && checkCollision(player, coin)) {
      coin.collected = true;
      score += 100;
    }
  }
  
  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > 800) player.x = 800 - player.width;
  if (player.y < 0) {
    player.y = 0;
    player.velocityY = 0;
  }
  if (player.y > 600) {
    // Reset player if they fall off the screen
    player.x = 100;
    player.y = 300;
    player.velocityY = 0;
  }
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222233");
  
  // Draw platforms
  for (const platform of platforms) {
    SAAAM.drawRectangle(platform.x, platform.y, platform.width, platform.height, "#8B4513");
  }
  
  // Draw coins
  for (const coin of coins) {
    if (!coin.collected) {
      SAAAM.drawCircle(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, "#FFD700");
    }
  }
  
  // Draw player
  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);
  
  // Draw score
  SAAAM.drawText("Score: " + score, 20, 30, "#FFFFFF");
  
  // Draw instructions
  SAAAM.drawText("Use arrow keys or WASD to move and jump", 400, 30, "#FFFFFF");
}

// Helper function to check collision between two rectangles
function checkCollision(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}`,
    author: "SAAAM Team",
    difficulty: "beginner",
    tags: ["platformer", "physics", "collision"],
  },
  {
    id: "space-shooter",
    title: "Space Shooter",
    description: "A classic space shooter with enemies and power-ups.",
    thumbnail: "/placeholder.svg?height=200&width=320",
    code: `// Space Shooter Example
// Defend against waves of enemies!

SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game variables
let player = {
  x: 400,
  y: 500,
  width: 50,
  height: 40,
  speed: 300,
  color: "#4488FF",
  fireRate: 0.2,
  fireTimer: 0
};

let bullets = [];
let enemies = [];
let particles = [];
let powerUps = [];

let score = 0;
let lives = 3;
let gameTime = 0;
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;

function create() {
  console.log("Space Shooter created!");
  // Spawn initial enemies
  spawnEnemyWave(5);
}

function step(deltaTime) {
  gameTime += deltaTime;
  
  // Handle player input
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
    player.x -= player.speed * deltaTime;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.right) || SAAAM.keyboardCheck(SAAAM.vk.d)) {
    player.x += player.speed * deltaTime;
  }
  
  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > 800) player.x = 800 - player.width;
  
  // Player shooting
  player.fireTimer -= deltaTime;
  if ((SAAAM.keyboardCheck(SAAAM.vk.space) || SAAAM.keyboardCheck(SAAAM.vk.up)) && player.fireTimer <= 0) {
    bullets.push({
      x: player.x + player.width/2 - 5,
      y: player.y,
      width: 10,
      height: 20,
      speed: 500,
      color: "#FF8800"
    });
    player.fireTimer = player.fireRate;
  }
  
  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed * deltaTime;
    
    // Remove bullets that go off screen
    if (bullets[i].y + bullets[i].height < 0) {
      bullets.splice(i, 1);
    }
  }
  
  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    // Move enemy
    enemy.y += enemy.speed * deltaTime;
    
    // Horizontal movement
    if (enemy.movementPattern === "zigzag") {
      enemy.x += Math.sin(gameTime * 3 + enemy.offset) * 3;
    }
    
    // Check if enemy is off screen
    if (enemy.y > 600) {
      enemies.splice(i, 1);
      lives--;
      createExplosion(enemy.x + enemy.width/2, 600, "#FF0000");
    }
  }
  
  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    
    // Move power-up
    powerUp.y += 100 * deltaTime;
    
    // Check if power-up is off screen
    if (powerUp.y > 600) {
      powerUps.splice(i, 1);
    }
  }
  
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    
    // Update life
    particle.life -= deltaTime;
    
    // Remove dead particles
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Check collisions
  checkCollisions();
  
  // Spawn enemies
  enemySpawnTimer -= deltaTime;
  if (enemySpawnTimer <= 0) {
    spawnEnemyWave(Math.floor(3 + gameTime/10));
    enemySpawnTimer = 3;
  }
  
  // Spawn power-ups
  powerUpSpawnTimer -= deltaTime;
  if (powerUpSpawnTimer <= 0) {
    spawnPowerUp();
    powerUpSpawnTimer = 10 + Math.random() * 5;
  }
}

function draw(ctx) {
  // Clear the screen with a starfield background
  SAAAM.drawRectangle(0, 0, 800, 600, "#111122");
  
  // Draw stars
  for (let i = 0; i < 100; i++) {
    const x = (i * 17) % 800;
    const y = ((i * 23) % 600) + (gameTime * (i % 5 + 10)) % 600;
    const size = i % 3 + 1;
    SAAAM.drawRectangle(x, y, size, size, "#FFFFFF");
  }
  
  // Draw particles
  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife;
    SAAAM.drawCircle(particle.x, particle.y, particle.size * alpha, particle.color);
  }
  
  // Draw bullets
  for (const bullet of bullets) {
    SAAAM.drawRectangle(bullet.x, bullet.y, bullet.width, bullet.height, bullet.color);
  }
  
  // Draw enemies
  for (const enemy of enemies) {
    SAAAM.drawRectangle(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
  }
  
  // Draw power-ups
  for (const powerUp of powerUps) {
    SAAAM.drawCircle(powerUp.x, powerUp.y, powerUp.radius, powerUp.color);
  }
  
  // Draw player
  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);
  
  // Draw UI
  SAAAM.drawText("Score: " + score, 20, 30, "#FFFFFF");
  SAAAM.drawText("Lives: " + lives, 700, 30, "#FFFFFF");
  
  // Draw game over if no lives left
  if (lives <= 0) {
    SAAAM.drawRectangle(200, 200, 400, 200, "#000000");
    SAAAM.drawText("GAME OVER", 400, 250, "#FF0000");
    SAAAM.drawText("Final Score: " + score, 400, 300, "#FFFFFF");
    SAAAM.drawText("Press R to restart", 400, 350, "#FFFFFF");
  }
}

// Helper function to check collisions
function checkCollisions() {
  // Bullet vs Enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      
      if (checkRectCollision(bullet, enemy)) {
        // Create explosion
        createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color);
        
        // Remove bullet and enemy
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        
        // Increase score
        score += 100;
        
        // Break out of inner loop since bullet is gone
        break;
      }
    }
  }
  
  // Player vs Enemy collisions
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    if (checkRectCollision(player, enemy)) {
      // Create explosion
      createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, "#FF0000");
      
      // Remove enemy
      enemies.splice(i, 1);
      
      // Decrease lives
      lives--;
    }
  }
  
  // Player vs PowerUp collisions
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    
    if (checkCircleRectCollision(powerUp, player)) {
      // Apply power-up effect
      if (powerUp.type === "fireRate") {
        player.fireRate *= 0.7;
      } else if (powerUp.type === "extraLife") {
        lives++;
      }
      
      // Create sparkle effect
      createSparkle(powerUp.x, powerUp.y, powerUp.color);
      
      // Remove power-up
      powerUps.splice(i, 1);
    }
  }
}

// Helper function to check collision between two rectangles
function checkRectCollision(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}

// Helper function to check collision between circle and rectangle
function checkCircleRectCollision(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.width/2);
  const distY = Math.abs(circle.y - rect.y - rect.height/2);
  
  if (distX > (rect.width/2 + circle.radius)) return false;
  if (distY > (rect.height/2 + circle.radius)) return false;
  
  if (distX <= (rect.width/2)) return true;
  if (distY <= (rect.height/2)) return true;
  
  const dx = distX - rect.width/2;
  const dy = distY - rect.height/2;
  return (dx*dx + dy*dy <= (circle.radius*circle.radius));
}

// Function to spawn a wave of enemies
function spawnEnemyWave(count) {
  for (let i = 0; i < count; i++) {
    const enemyTypes = [
      {
        width: 40,
        height: 40,
        speed: 100,
        color: "#FF0000",
        movementPattern: "straight"
      },
      {
        width: 30,
        height: 30,
        speed: 150,
        color: "#FF00FF",
        movementPattern: "zigzag"
      }
    ];
    
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    enemies.push({
      x: Math.random() * (800 - enemyType.width),
      y: -enemyType.height - Math.random() * 300,
      width: enemyType.width,
      height: enemyType.height,
      speed: enemyType.speed,
      color: enemyType.color,
      movementPattern: enemyType.movementPattern,
      offset: Math.random() * Math.PI * 2
    });
  }
}

// Function to spawn a power-up
function spawnPowerUp() {
  const powerUpTypes = [
    {
      type: "fireRate",
      radius: 15,
      color: "#00FFFF"
    },
    {
      type: "extraLife",
      radius: 15,
      color: "#00FF00"
    }
  ];
  
  const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  
  powerUps.push({
    x: Math.random() * (800 - powerUpType.radius * 2) + powerUpType.radius,
    y: -powerUpType.radius,
    radius: powerUpType.radius,
    color: powerUpType.color,
    type: powerUpType.type
  });
}

// Function to create an explosion effect
function createExplosion(x, y, color) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      color: color,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 0.5 + Math.random() * 0.5
    });
  }
}

// Function to create a sparkle effect
function createSparkle(x, y, color) {
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 70;
    
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      color: color,
      life: 0.3 + Math.random() * 0.3,
      maxLife: 0.3 + Math.random() * 0.3
    });
  }
}`,
    author: "SAAAM Team",
    difficulty: "intermediate",
    tags: ["shooter", "arcade", "particles"],
  },
  {
    id: "puzzle-game",
    title: "Color Matching Puzzle",
    description: "A puzzle game where you match colors to clear the board.",
    thumbnail: "/placeholder.svg?height=200&width=320",
    code: `// Color Matching Puzzle Game
// Match colors to clear the board!

SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game constants
const GRID_SIZE = 8;
const TILE_SIZE = 60;
const BOARD_OFFSET_X = 140;
const BOARD_OFFSET_Y = 80;
const ANIMATION_SPEED = 10;

// Color palette
const COLORS = [
  "#FF5252", // Red
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FFEB3B", // Yellow
  "#9C27B0", // Purple
  "#FF9800"  // Orange
];

// Game variables
let grid = [];
let selectedTile = null;
let swappingTiles = null;
let fallingTiles = [];
let score = 0;
let moves = 20;
let gameState = "playing"; // playing, gameOver, victory
let animations = [];

function create() {
  console.log("Puzzle game created!");
  initializeGrid();
}

function step(deltaTime) {
  if (gameState === "playing") {
    // Process animations
    updateAnimations(deltaTime);
    
    // Check if we need to fill empty spaces
    if (animations.length === 0) {
      fillEmptySpaces();
      
      // Check for matches after filling
      if (fallingTiles.length === 0) {
        const matches = findMatches();
        if (matches.length > 0) {
          removeMatches(matches);
        }
      }
    }
    
    // Check for game over
    if (moves <= 0 && animations.length === 0 && fallingTiles.length === 0) {
      gameState = "gameOver";
    }
    
    // Check for victory (arbitrary score threshold)
    if (score >= 5000) {
      gameState = "victory";
    }
  } else {
    // Handle restart
    if (SAAAM.keyboardCheckPressed(SAAAM.vk.space)) {
      resetGame();
    }
  }
}

function draw(ctx) {
  // Draw background
  SAAAM.drawRectangle(0, 0, 800, 600, "#1A237E");
  
  // Draw grid background
  const gridWidth = GRID_SIZE * TILE_SIZE;
  const gridHeight = GRID_SIZE * TILE_SIZE;
  SAAAM.drawRectangle(BOARD_OFFSET_X - 10, BOARD_OFFSET_Y - 10, 
                     gridWidth + 20, gridHeight + 20, "#303F9F");
  
  // Draw tiles
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const tile = grid[y][x];
      if (tile) {
        // Calculate position (with animation offset if applicable)
        let drawX = BOARD_OFFSET_X + x * TILE_SIZE;
        let drawY = BOARD_OFFSET_Y + y * TILE_SIZE;
        
        // Apply animation offsets
        if (tile.animOffsetX !== undefined) drawX += tile.animOffsetX;
        if (tile.animOffsetY !== undefined) drawY += tile.animOffsetY;
        
        // Draw tile background
        SAAAM.drawRectangle(drawX + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4, "#7986CB");
        
        // Draw colored gem
        const gemSize = TILE_SIZE - 14;
        SAAAM.drawRectangle(drawX + 7, drawY + 7, gemSize, gemSize, tile.color);
        
        // Draw highlight for selected tile
        if (selectedTile && selectedTile.x === x && selectedTile.y === y) {
          SAAAM.drawRectangle(drawX, drawY, TILE_SIZE, TILE_SIZE, "#FFFFFF");
        }
      }
    }
  }
  
  // Draw UI
  SAAAM.drawText("Score: " + score, 20, 30, "#FFFFFF");
  SAAAM.drawText("Moves: " + moves, 20, 60, "#FFFFFF");
  
  // Draw game over or victory screen
  if (gameState === "gameOver") {
    SAAAM.drawRectangle(200, 200, 400, 200, "#303F9F");
    SAAAM.drawText("GAME OVER", 400, 250, "#FFFFFF");
    SAAAM.drawText("Final Score: " + score, 400, 300, "#FFFFFF");
    SAAAM.drawText("Press SPACE to restart", 400, 350, "#FFFFFF");
  } else if (gameState === "victory") {
    SAAAM.drawRectangle(200, 200, 400, 200, "#303F9F");
    SAAAM.drawText("VICTORY!", 400, 250, "#FFEB3B");
    SAAAM.drawText("Final Score: " + score, 400, 300, "#FFFFFF");
    SAAAM.drawText("Press SPACE to restart", 400, 350, "#FFFFFF");
  }
}

// Initialize the game grid
function initializeGrid() {
  grid = [];
  
  // Create grid
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = createTile(x, y);
    }
  }
  
  // Remove initial matches
  let matches;
  do {
    matches = findMatches();
    for (const match of matches) {
      for (const {x, y} of match) {
        grid[y][x] = createTile(x, y);
      }
    }
  } while (matches.length > 0);
}

// Create a new tile
function createTile(x, y) {
  return {
    x: x,
    y: y,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
}

// Handle mouse click
function handleMouseClick(x, y) {
  if (gameState !== "playing" || animations.length > 0 || fallingTiles.length > 0) return;
  
  // Convert mouse coordinates to grid coordinates
  const gridX = Math.floor((x - BOARD_OFFSET_X) / TILE_SIZE);
  const gridY = Math.floor((y - BOARD_OFFSET_Y) / TILE_SIZE);
  
  // Check if click is within grid
  if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
    if (!selectedTile) {
      // Select tile
      selectedTile = { x: gridX, y: gridY };
    } else {
      // Check if adjacent to selected tile
      const dx = Math.abs(gridX - selectedTile.x);
      const dy = Math.abs(gridY - selectedTile.y);
      
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Swap tiles
        swapTiles(selectedTile.x, selectedTile.y, gridX, gridY);
        moves--;
      }
      
      // Deselect
      selectedTile = null;
    }
  } else {
    // Clicked outside grid, deselect
    selectedTile = null;
  }
}

// Swap two tiles
function swapTiles(x1, y1, x2, y2) {
  // Create animation for the swap
  const tile1 = grid[y1][x1];
  const tile2 = grid[y2][x2];
  
  // Calculate direction
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // Add swap animation
  animations.push({
    type: "swap",
    tile1: tile1,
    tile2: tile2,
    progress: 0,
    dx: dx,
    dy: dy,
    onComplete: () => {
      // Actually swap the tiles in the grid
      const temp = grid[y1][x1];
      grid[y1][x1] = grid[y2][x2];
      grid[y2][x2] = temp;
      
      // Update tile coordinates
      if (grid[y1][x1]) grid[y1][x1].x = x1;
      if (grid[y1][x1]) grid[y1][x1].y = y1;
      if (grid[y2][x2]) grid[y2][x2].x = x2;
      if (grid[y2][x2]) grid[y2][x2].y = y2;
      
      // Check for matches
      const matches = findMatches();
      if (matches.length > 0) {
        removeMatches(matches);
      } else {
        // No matches, swap back
        animations.push({
          type: "swap",
          tile1: grid[y1][x1],
          tile2: grid[y2][x2],
          progress: 0,
          dx: -dx,
          dy: -dy,
          onComplete: () => {
            // Swap back in the grid
            const temp = grid[y1][x1];
            grid[y1][x1] = grid[y2][x2];
            grid[y2][x2] = temp;
            
            // Update tile coordinates
            if (grid[y1][x1]) grid[y1][x1].x = x1;
            if (grid[y1][x1]) grid[y1][x1].y = y1;
            if (grid[y2][x2]) grid[y2][x2].x = x2;
            if (grid[y2][x2]) grid[y2][x2].y = y2;
            
            // Refund the move
            moves++;
          }
        });
      }
    }
  });
}

// Find all matches in the grid
function findMatches() {
  const matches = [];
  
  // Check horizontal matches
  for (let y = 0; y < GRID_SIZE; y++) {
    let matchStart = 0;
    let currentColor = null;
    let matchLength = 1;
    
    for (let x = 0; x < GRID_SIZE; x++) {
      const tile = grid[y][x];
      
      if (tile && currentColor === tile.color) {
        matchLength++;
      } else {
        // Check if we have a match (3 or more)
        if (matchLength >= 3) {
          const match = [];
          for (let i = 0; i < matchLength; i++) {
            match.push({x: matchStart + i, y: y});
          }
          matches.push(match);
        }
        
        // Reset
        currentColor = tile ? tile.color : null;
        matchStart = x;
        matchLength = 1;
      }
    }
    
    // Check for match at the end of row
    if (matchLength >= 3) {
      const match = [];
      for (let i = 0; i < matchLength; i++) {
        match.push({x: matchStart + i, y: y});
      }
      matches.push(match);
    }
  }
  
  // Check vertical matches
  for (let x = 0; x < GRID_SIZE; x++) {
    let matchStart = 0;
    let currentColor = null;
    let matchLength = 1;
    
    for (let y = 0; y < GRID_SIZE; y++) {
      const tile = grid[y][x];
      
      if (tile && currentColor === tile.color) {
        matchLength++;
      } else {
        // Check if we have a match (3 or more)
        if (matchLength >= 3) {
          const match = [];
          for (let i = 0; i < matchLength; i++) {
            match.push({x: x, y: matchStart + i});
          }
          matches.push(match);
        }
        
        // Reset
        currentColor = tile ? tile.color : null;
        matchStart = y;
        matchLength = 1;
      }
    }
    
    // Check for match at the end of column
    if (matchLength >= 3) {
      const match = [];
      for (let i = 0; i < matchLength; i++) {
        match.push({x: x, y: matchStart + i});
      }
      matches.push(match);
    }
  }
  
  return matches;
}

// Remove matches from the grid
function removeMatches(matches) {
  // Flatten all matches
  const allTiles = [];
  for (const match of matches) {
    for (const tile of match) {
      allTiles.push(tile);
    }
  }
  
  // Remove duplicates
  const uniqueTiles = [];
  for (const tile of allTiles) {
    let isDuplicate = false;
    for (const unique of uniqueTiles) {
      if (unique.x === tile.x && unique.y === tile.y) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      uniqueTiles.push(tile);
    }
  }
  
  // Add score based on number of tiles
  const matchScore = uniqueTiles.length * 100;
  score += matchScore;
  
  // Create animations for removing tiles
  for (const tile of uniqueTiles) {
    animations.push({
      type: "remove",
      x: tile.x,
      y: tile.y,
      progress: 0,
      onComplete: () => {
        // Remove tile from grid
        grid[tile.y][tile.x] = null;
      }
    });
  }
}

// Fill empty spaces in the grid
function fillEmptySpaces() {
  // Check for empty spaces and create falling animations
  for (let x = 0; x < GRID_SIZE; x++) {
    // Start from the bottom and work up
    for (let y = GRID_SIZE - 1; y >= 0; y--) {
      if (!grid[y][x]) {
        // Find the nearest tile above
        let sourceY = y - 1;
        while (sourceY >= 0 && !grid[sourceY][x]) {
          sourceY--;
        }
        
        if (sourceY >= 0) {
          // Found a tile to fall down
          const tile = grid[sourceY][x];
          grid[sourceY][x] = null;
          grid[y][x] = tile;
          tile.y = y;
          
          // Add falling animation
          fallingTiles.push({
            tile: tile,
            startY: sourceY,
            targetY: y,
            progress: 0
          });
        } else {
          // No tiles above, create a new one at the top
          const newTile = createTile(x, 0);
          grid[y][x] = newTile;
          newTile.y = y;
          
          // Add falling animation from off-screen
          fallingTiles.push({
            tile: newTile,
            startY: -1,
            targetY: y,
            progress: 0
          });
        }
      }
    }
  }
}

// Update animations
function updateAnimations(deltaTime) {
  // Update swap animations
  for (let i = animations.length - 1; i >= 0; i--) {
    const anim = animations[i];
    anim.progress += deltaTime * ANIMATION_SPEED;
    
    if (anim.type === "swap") {
      // Update tile positions
      const progress = Math.min(1, anim.progress);
      
      if (anim.tile1) {
        anim.tile1.animOffsetX = anim.dx * TILE_SIZE * progress;
        anim.tile1.animOffsetY = anim.dy * TILE_SIZE * progress;
      }
      
      if (anim.tile2) {
        anim.tile2.animOffsetX = -anim.dx * TILE_SIZE * progress;
        anim.tile2.animOffsetY = -anim.dy * TILE_SIZE * progress;
      }
      
      // Animation complete
      if (progress >= 1) {
        // Reset animation offsets
        if (anim.tile1) {
          anim.tile1.animOffsetX = 0;
          anim.tile1.animOffsetY = 0;
        }
        
        if (anim.tile2) {
          anim.tile2.animOffsetX = 0;
          anim.tile2.animOffsetY = 0;
        }
        
        // Call completion callback
        if (anim.onComplete) {
          anim.onComplete();
        }
        
        // Remove animation
        animations.splice(i, 1);
      }
    } else if (anim.type === "remove") {
      // Animation complete
      if (anim.progress >= 1) {
        // Call completion callback
        if (anim.onComplete) {
          anim.onComplete();
        }
        
        // Remove animation
        animations.splice(i, 1);
      }
    }
  }
  
  // Update falling animations
  for (let i = fallingTiles.length - 1; i >= 0; i--) {
    const fall = fallingTiles[i];
    fall.progress += deltaTime * ANIMATION_SPEED;
    
    // Update tile position
    const progress = Math.min(1, fall.progress);
    const startY = fall.startY * TILE_SIZE;
    const targetY = fall.targetY * TILE_SIZE;
    const currentY = startY + (targetY - startY) * progress;
    
    fall.tile.animOffsetY = currentY - (fall.tile.y * TILE_SIZE);
    
    // Animation complete
    if (progress >= 1) {
      // Reset animation offset
      fall.tile.animOffsetY = 0;
      
      // Remove falling animation
      fallingTiles.splice(i, 1);
    }
  }
}

// Reset the game
function resetGame() {
  score = 0;
  moves = 20;
  gameState = "playing";
  selectedTile = null;
  swappingTiles = null;
  fallingTiles = [];
  animations = [];
  initializeGrid();
}`,
    author: "SAAAM Team",
    difficulty: "intermediate",
    tags: ["puzzle", "match-3", "animation"],
  },
  {
    id: "user-sample-game",
    title: "User's Sample Game",
    description: "A custom game created by a SAAAM user.",
    thumbnail: "/placeholder.svg?height=200&width=320",
    code: `// This is a placeholder for the user's sample game
// Replace this with the actual code when provided

SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game variables
let gameState = "playing";
let player = {
  x: 400,
  y: 300,
  radius: 20,
  color: "#4488FF",
  speed: 200
};

function create() {
  console.log("User's sample game created!");
}

function step(deltaTime) {
  // Handle player input
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
    player.x -= player.speed * deltaTime;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.right) || SAAAM.keyboardCheck(SAAAM.vk.d)) {
    player.x += player.speed * deltaTime;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w)) {
    player.y -= player.speed * deltaTime;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.down) || SAAAM.keyboardCheck(SAAAM.vk.s)) {
    player.y += player.speed * deltaTime;
  }
  
  // Keep player within screen bounds
  if (player.x < player.radius) player.x = player.radius;
  if (player.x > 800 - player.radius) player.x = 800 - player.radius;
  if (player.y < player.radius) player.y = player.radius;
  if (player.y > 600 - player.radius) player.y = 600 - player.radius;
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");
  
  // Draw player
  SAAAM.drawCircle(player.x, player.y, player.radius, player.color);
  
  // Draw instructions
  SAAAM.drawText("User's Sample Game - Use arrow keys to move", 400, 30, "#FFFFFF");
  SAAAM.drawText("Replace this with your own game code!", 400, 570, "#FFFFFF");
}`,
    author: "SAAAM User",
    difficulty: "beginner",
    tags: ["custom", "sample"],
  },
]

const SaaamExamples = () => {
  const [selectedExample, setSelectedExample] = useState<GameExample | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter examples based on difficulty and search query
  const filteredExamples = EXAMPLE_GAMES.filter((example) => {
    const matchesDifficulty = filter === "all" || example.difficulty === filter
    const matchesSearch =
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesDifficulty && matchesSearch
  })

  const handleExampleClick = (example: GameExample) => {
    setSelectedExample(example)
  }

  const handleCopyCode = () => {
    if (selectedExample) {
      navigator.clipboard.writeText(selectedExample.code)
      // You could add a toast notification here
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">SAAAM Game Examples</h1>
        <p className="text-gray-300">
          Browse and learn from these example games. Click on any example to view its code and details.
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Examples list */}
        <div
          className={`${selectedExample && isMobile ? "hidden" : "flex flex-col"} w-full md:w-1/3 border-r border-gray-700 overflow-hidden`}
        >
          {/* Filters */}
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex flex-col md:flex-row gap-2 justify-between">
              <div className="flex gap-2">
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                  All
                </Button>
                <Button
                  variant={filter === "beginner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("beginner")}
                >
                  Beginner
                </Button>
                <Button
                  variant={filter === "intermediate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("intermediate")}
                >
                  Intermediate
                </Button>
                <Button
                  variant={filter === "advanced" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("advanced")}
                >
                  Advanced
                </Button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search examples..."
                  className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Examples grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className={`bg-gray-800 rounded-lg overflow-hidden border ${selectedExample?.id === example.id ? "border-yellow-400" : "border-gray-700"} hover:border-gray-500 cursor-pointer transition-colors`}
                onClick={() => handleExampleClick(example)}
              >
                <div className="h-32 bg-gray-700 flex items-center justify-center">
                  <img
                    src={example.thumbnail || "/placeholder.svg"}
                    alt={example.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-lg">{example.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{example.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        example.difficulty === "beginner"
                          ? "bg-green-900 text-green-300"
                          : example.difficulty === "intermediate"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                      }`}
                    >
                      {example.difficulty}
                    </span>
                    {example.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example details */}
        {selectedExample ? (
          <div className={`${isMobile && "w-full"} flex-1 flex flex-col overflow-hidden`}>
            {isMobile && (
              <div className="p-2 bg-gray-800 border-b border-gray-700">
                <Button variant="outline" size="sm" onClick={() => setSelectedExample(null)}>
                  ← Back to Examples
                </Button>
              </div>
            )}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedExample.title}</h2>
                <p className="text-gray-300">By {selectedExample.author}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy size={16} className="mr-1" /> Copy Code
                </Button>
                <Button variant="default" size="sm">
                  <Play size={16} className="mr-1" /> Run in IDE
                </Button>
              </div>
            </div>

            <Tabs defaultValue="code" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="flex-1 overflow-hidden m-0 p-0">
                <div className="h-full overflow-auto p-4 bg-gray-900">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{selectedExample.code}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="info" className="flex-1 overflow-auto m-0 p-4">
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-bold mb-2">Description</h3>
                  <p>{selectedExample.description}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-bold mb-2">Difficulty</h3>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      selectedExample.difficulty === "beginner"
                        ? "bg-green-900 text-green-300"
                        : selectedExample.difficulty === "intermediate"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-red-900 text-red-300"
                    }`}
                  >
                    {selectedExample.difficulty}
                  </span>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-bold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">Learning Points</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedExample.id === "simple-platformer" && (
                      <>
                        <li>Basic physics with gravity and jumping</li>
                        <li>Collision detection between rectangles</li>
                        <li>Simple game state management</li>
                        <li>Keyboard input handling</li>
                      </>
                    )}
                    {selectedExample.id === "space-shooter" && (
                      <>
                        <li>Projectile mechanics and enemy spawning</li>
                        <li>Particle effects for explosions</li>
                        <li>Power-up system</li>
                        <li>Different enemy movement patterns</li>
                      </>
                    )}
                    {selectedExample.id === "puzzle-game" && (
                      <>
                        <li>Grid-based game mechanics</li>
                        <li>Match detection algorithms</li>
                        <li>Animation system for smooth transitions</li>
                        <li>Game state management with multiple states</li>
                      </>
                    )}
                    {selectedExample.id === "user-sample-game" && (
                      <>
                        <li>Custom game mechanics</li>
                        <li>User-created content</li>
                        <li>Basic movement and controls</li>
                      </>
                    )}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center max-w-md">
              <Info size={48} className="mx-auto text-gray-600 mb-4" />
              <h2 className="text-xl font-bold mb-2">Select an Example</h2>
              <p className="text-gray-400">
                Choose a game example from the list to view its code and details. You can filter by difficulty or search
                for specific features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SaaamExamples
