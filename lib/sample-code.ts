export const sampleSaaamCode = `// Enhanced SAAAM Game Demo
// An arcade-style collection game with obstacles, animations, and particle effects

// Register game lifecycle functions
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game variables
let gameState = "playing"; // "playing", "gameOver", "victory"
let score = 0;
let lives = 3;
let level = 1;
let gameTime = 0;

// Player object with enhanced properties
let player = {
  x: 400,
  y: 300,
  width: 40,
  height: 40,
  speed: 240,
  color: "#4488FF",
  trailParticles: [],
  maxTrailParticles: 50,
  invulnerable: false,
  invulnerableTime: 0,
  rotation: 0
};

// Collectibles array
let collectibles = [];
const MAX_COLLECTIBLES = 6;

// Obstacles array
let obstacles = [];
const MAX_OBSTACLES = 5 + level;

// Particles array for explosions, effects, etc.
let particles = [];

// Create function - called once at start
function create() {
  console.log("Enhanced game created!");
  // Initialize collectibles
  spawnCollectibles();
  
  // Initialize obstacles
  spawnObstacles();
  
  // Play background music if available
  if (SAAAM.playMusic) {
    SAAAM.playMusic("background", 0.4, true);
  }
}

// Step function - called every frame
function step(deltaTime) {
  // Update game time
  gameTime += deltaTime;
  
  if (gameState === "playing") {
    // Handle player input and movement
    handleInput(deltaTime);
    
    // Update player trail particles
    updatePlayerTrail(deltaTime);
    
    // Update obstacles
    updateObstacles(deltaTime);
    
    // Update collectibles (rotation, bobbing effect)
    updateCollectibles(deltaTime);
    
    // Check for collisions
    checkCollisions();
    
    // Handle invulnerability timer
    if (player.invulnerable) {
      player.invulnerableTime -= deltaTime;
      if (player.invulnerableTime <= 0) {
        player.invulnerable = false;
      }
    }
  } else if (gameState === "gameOver" || gameState === "victory") {
    // Handle input for restarting the game
    if (SAAAM.keyboardCheckPressed(SAAAM.vk.space)) {
      resetGame();
    }
  }
  
  // Update all particles
  updateParticles(deltaTime);
}

// Draw function - called every frame after step
function draw(ctx) {
  // Clear the screen with a gradient background
  drawBackground(ctx);
  
  // Draw grid for reference
  drawGrid(ctx);
  
  // Draw particles that should appear behind other elements
  drawBackgroundParticles(ctx);
  
  // Draw all collectibles
  drawCollectibles(ctx);
  
  // Draw all obstacles
  drawObstacles(ctx);
  
  // Draw player
  drawPlayer(ctx);
  
  // Draw UI elements
  drawUI(ctx);
  
  // Draw appropriate screen based on game state
  if (gameState === "gameOver") {
    drawGameOverScreen(ctx);
  } else if (gameState === "victory") {
    drawVictoryScreen(ctx);
  }
}

// Draw a nice gradient background
function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 600);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  SAAAM.drawRectangle(0, 0, 800, 600, gradient);
  
  // Add some "stars" in the background
  for (let i = 0; i < 50; i++) {
    const x = (Math.sin(i * 3.14159 + gameTime * 0.2) * 400) + 400;
    const y = (Math.cos(i * 3.14159 + gameTime * 0.3) * 300) + 300;
    
    // Star twinkle effect
    const brightness = Math.sin(gameTime * 2 + i) * 0.5 + 0.5;
    const alpha = 0.3 * brightness;
    const size = 2 + brightness * 2;
    
    SAAAM.drawCircle(x, y, size, \`rgba(255, 255, 255, \${alpha})\`);
  }
}

// Draw a subtle grid for visual reference
function drawGrid(ctx) {
  ctx.globalAlpha = 0.1;
  for (let x = 0; x < 800; x += 50) {
    SAAAM.drawLine(x, 0, x, 600, "#ffffff");
  }
  for (let y = 0; y < 600; y += 50) {
    SAAAM.drawLine(0, y, 800, y, "#ffffff");
  }
  ctx.globalAlpha = 1.0;
}

// Handle player input
function handleInput(deltaTime) {
  let movingX = false;
  let movingY = false;
  
  // Move left
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
    player.x -= player.speed * deltaTime;
    movingX = true;
    player.rotation = Math.PI;
  }
  
  // Move right
  if (SAAAM.keyboardCheck(SAAAM.vk.right) || SAAAM.keyboardCheck(SAAAM.vk.d)) {
    player.x += player.speed * deltaTime;
    movingX = true;
    player.rotation = 0;
  }
  
  // Move up
  if (SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w)) {
    player.y -= player.speed * deltaTime;
    movingY = true;
    if (!movingX) player.rotation = -Math.PI/2;
  }
  
  // Move down
  if (SAAAM.keyboardCheck(SAAAM.vk.down) || SAAAM.keyboardCheck(SAAAM.vk.s)) {
    player.y += player.speed * deltaTime;
    movingY = true;
    if (!movingX) player.rotation = Math.PI/2;
  }
  
  // Diagonal movement
  if (movingX && movingY) {
    if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
      if (SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w)) {
        player.rotation = -3*Math.PI/4;
      } else {
        player.rotation = 3*Math.PI/4;
      }
    } else {
      if (SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w)) {
        player.rotation = -Math.PI/4;
      } else {
        player.rotation = Math.PI/4;
      }
    }
  }
  
  // Create trail particles if moving
  if (movingX || movingY) {
    createTrailParticle();
  }
  
  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > 800) player.x = 800 - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > 600) player.y = 600 - player.height;
}

// Create player trail particles
function createTrailParticle() {
  // Only create particles at a certain rate
  if (Math.random() > 0.3) return;
  
  // Calculate position at the center-back of the player based on rotation
  const offsetX = -Math.cos(player.rotation) * player.width/2;
  const offsetY = -Math.sin(player.rotation) * player.height/2;
  
  const trailParticle = {
    x: player.x + player.width/2 + offsetX,
    y: player.y + player.height/2 + offsetY,
    size: 5 + Math.random() * 5,
    color: \`rgba(\${68 + Math.random()*30}, \${136 + Math.random()*30}, \${255}, 0.7)\`,
    life: 0.5 + Math.random() * 0.5,
    maxLife: 0.5 + Math.random() * 0.5,
    vx: -Math.cos(player.rotation) * (10 + Math.random() * 20),
    vy: -Math.sin(player.rotation) * (10 + Math.random() * 20)
  };
  
  player.trailParticles.push(trailParticle);
  
  // Limit the number of particles
  if (player.trailParticles.length > player.maxTrailParticles) {
    player.trailParticles.shift();
  }
}

// Update player trail particles
function updatePlayerTrail(deltaTime) {
  for (let i = player.trailParticles.length - 1; i >= 0; i--) {
    const particle = player.trailParticles[i];
    
    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    
    // Update life
    particle.life -= deltaTime;
    
    // Remove dead particles
    if (particle.life <= 0) {
      player.trailParticles.splice(i, 1);
    }
  }
}

// Draw player with rotation and effects
function drawPlayer(ctx) {
  ctx.save();
  
  // Translate to player center
  ctx.translate(player.x + player.width/2, player.y + player.height/2);
  
  // Draw player trail particles
  for (const particle of player.trailParticles) {
    const alpha = particle.life / particle.maxLife;
    const size = particle.size * alpha;
    
    SAAAM.drawCircle(
      particle.x - (player.x + player.width/2), 
      particle.y - (player.y + player.height/2), 
      size, 
      particle.color
    );
  }
  
  // Rotate player
  ctx.rotate(player.rotation);
  
  // Draw player - a space ship shape instead of a square
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.width/2, 0);
  ctx.lineTo(-player.width/2, player.height/3);
  ctx.lineTo(-player.width/3, 0);
  ctx.lineTo(-player.width/2, -player.height/3);
  ctx.closePath();
  ctx.fill();
  
  // Add a cockpit
  ctx.fillStyle = "#88CCFF";
  ctx.beginPath();
  ctx.arc(player.width/4, 0, player.width/6, 0, Math.PI * 2);
  ctx.fill();
  
  // Invulnerability effect - flashing outline
  if (player.invulnerable) {
    ctx.strokeStyle = \`rgba(255, 255, 255, \${Math.sin(gameTime * 15) * 0.5 + 0.5})\`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.width/2, 0);
    ctx.lineTo(-player.width/2, player.height/3);
    ctx.lineTo(-player.width/3, 0);
    ctx.lineTo(-player.width/2, -player.height/3);
    ctx.closePath();
    ctx.stroke();
  }
  
  // Engine flame effect
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.right) ||
      SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.down) ||
      SAAAM.keyboardCheck(SAAAM.vk.a) || SAAAM.keyboardCheck(SAAAM.vk.d) ||
      SAAAM.keyboardCheck(SAAAM.vk.w) || SAAAM.keyboardCheck(SAAAM.vk.s)) {
    
    // Flame animation
    const flameSize = Math.sin(gameTime * 15) * 0.3 + 0.7;
    
    // Main flame
    ctx.fillStyle = "#FF9900";
    ctx.beginPath();
    ctx.moveTo(-player.width/3, 0);
    ctx.lineTo(-player.width/2 - 20 * flameSize, player.height/5 * flameSize);
    ctx.lineTo(-player.width/2 - 15 * flameSize, 0);
    ctx.lineTo(-player.width/2 - 20 * flameSize, -player.height/5 * flameSize);
    ctx.closePath();
    ctx.fill();
    
    // Inner flame
    ctx.fillStyle = "#FFCC00";
    ctx.beginPath();
    ctx.moveTo(-player.width/3, 0);
    ctx.lineTo(-player.width/2 - 10 * flameSize, player.height/8 * flameSize);
    ctx.lineTo(-player.width/2 - 8 * flameSize, 0);
    ctx.lineTo(-player.width/2 - 10 * flameSize, -player.height/8 * flameSize);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
}

// Spawn collectibles
function spawnCollectibles() {
  collectibles = [];
  for (let i = 0; i < MAX_COLLECTIBLES; i++) {
    const collectible = {
      x: 50 + Math.random() * 700,
      y: 50 + Math.random() * 500,
      width: 30,
      height: 30,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 3,
      bobHeight: 10 + Math.random() * 10,
      bobSpeed: 1 + Math.random() * 2,
      baseY: 0,
      collected: false,
      type: Math.floor(Math.random() * 3) // 0: gem, 1: star, 2: coin
    };
    
    collectible.baseY = collectible.y;
    
    // Make sure it doesn't overlap with the player
    const dx = collectible.x - player.x;
    const dy = collectible.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100) {
      i--; // Try again
      continue;
    }
    
    // Make sure it doesn't overlap with other collectibles
    let overlaps = false;
    for (const other of collectibles) {
      const dx = collectible.x - other.x;
      const dy = collectible.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 80) {
        overlaps = true;
        break;
      }
    }
    
    if (overlaps) {
      i--; // Try again
      continue;
    }
    
    collectibles.push(collectible);
  }
}

// Update collectibles (animation effects)
function updateCollectibles(deltaTime) {
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const collectible = collectibles[i];
    
    // Skip if collected
    if (collectible.collected) continue;
    
    // Rotate the collectible
    collectible.rotation += collectible.rotationSpeed * deltaTime;
    
    // Bob up and down
    collectible.y = collectible.baseY + Math.sin(gameTime * collectible.bobSpeed) * collectible.bobHeight;
  }
}

// Draw collectibles with different types and effects
function drawCollectibles(ctx) {
  for (const collectible of collectibles) {
    // Skip if collected
    if (collectible.collected) continue;
    
    ctx.save();
    // Translate to collectible center
    ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2);
    // Rotate
    ctx.rotate(collectible.rotation);
    
    // Draw based on type
    if (collectible.type === 0) {
      // Gem
      ctx.fillStyle = "#55FFBB";
      ctx.beginPath();
      ctx.moveTo(0, -collectible.height/2);
      ctx.lineTo(collectible.width/2, 0);
      ctx.lineTo(0, collectible.height/2);
      ctx.lineTo(-collectible.width/2, 0);
      ctx.closePath();
      ctx.fill();
      
      // Gem shine
      ctx.fillStyle = "#AAFFEE";
      ctx.beginPath();
      ctx.moveTo(0, -collectible.height/4);
      ctx.lineTo(collectible.width/4, 0);
      ctx.lineTo(0, collectible.height/4);
      ctx.lineTo(-collectible.width/4, 0);
      ctx.closePath();
      ctx.fill();
      
    } else if (collectible.type === 1) {
      // Star
      const points = 5;
      const outerRadius = collectible.width / 2;
      const innerRadius = collectible.width / 4;
      
      ctx.fillStyle = "#FFDD44";
      ctx.beginPath();
      
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Star shine
      ctx.fillStyle = "#FFEE88";
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius / 2, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Coin
      ctx.fillStyle = "#FFCC00";
      ctx.beginPath();
      ctx.arc(0, 0, collectible.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin detail
      ctx.fillStyle = "#FFDD55";
      ctx.beginPath();
      ctx.arc(0, 0, collectible.width / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Glow effect
    const glow = Math.sin(gameTime * 3) * 0.5 + 0.5;
    ctx.strokeStyle = \`rgba(255, 255, 255, \${glow * 0.7})\`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, collectible.width / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
}

// Spawn obstacles
function spawnObstacles() {
  obstacles = [];
  for (let i = 0; i < MAX_OBSTACLES; i++) {
    const type = Math.floor(Math.random() * 3); // 0: static, 1: horizontal, 2: vertical
    const obstacle = {
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 400,
      width: 60 + Math.random() * 40,
      height: 60 + Math.random() * 40,
      type: type,
      speed: 50 + Math.random() * 100,
      direction: Math.random() > 0.5 ? 1 : -1,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.5
    };
    
    // Adjust size based on type
    if (type === 1) { // Horizontal
      obstacle.height = 30 + Math.random() * 20;
    } else if (type === 2) { // Vertical
      obstacle.width = 30 + Math.random() * 20;
    }
    
    // Make sure it doesn't overlap with the player
    const dx = obstacle.x - player.x;
    const dy = obstacle.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 150) {
      i--; // Try again
      continue;
    }
    
    // Make sure it doesn't overlap with collectibles
    let overlapsCollectible = false;
    for (const collectible of collectibles) {
      const dx = obstacle.x - collectible.x;
      const dy = obstacle.y - collectible.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        overlapsCollectible = true;
        break;
      }
    }
    
    if (overlapsCollectible) {
      i--; // Try again
      continue;
    }
    
    // Make sure it doesn't overlap with other obstacles
    let overlapsObstacle = false;
    for (const other of obstacles) {
      const dx = obstacle.x - other.x;
      const dy = obstacle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        overlapsObstacle = true;
        break;
      }
    }
    
    if (overlapsObstacle) {
      i--; // Try again
      continue;
    }
    
    obstacles.push(obstacle);
  }
}

// Update obstacles (movement patterns)
function updateObstacles(deltaTime) {
  for (const obstacle of obstacles) {
    // Update rotation
    obstacle.rotation += obstacle.rotationSpeed * deltaTime;
    
    // Update position based on type
    if (obstacle.type === 1) { // Horizontal
      obstacle.x += obstacle.speed * obstacle.direction * deltaTime;
      
      // Reverse direction at screen edges
      if (obstacle.x < 0 || obstacle.x + obstacle.width > 800) {
        obstacle.direction *= -1;
      }
    } else if (obstacle.type === 2) { // Vertical
      obstacle.y += obstacle.speed * obstacle.direction * deltaTime;
      
      // Reverse direction at screen edges
      if (obstacle.y < 0 || obstacle.y + obstacle.height > 600) {
        obstacle.direction *= -1;
      }
    }
  }
}

// Draw obstacles
function drawObstacles(ctx) {
  for (const obstacle of obstacles) {
    ctx.save();
    // Translate to obstacle center
    ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
    // Rotate
    ctx.rotate(obstacle.rotation);
    
    // Draw based on type
    if (obstacle.type === 0) { // Static
      // Asteroid-like shape
      ctx.fillStyle = "#AA7744";
      
      ctx.beginPath();
      const points = 6;
      const radius = Math.min(obstacle.width, obstacle.height) / 2;
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variation = 0.7 + Math.sin(i * 7 + gameTime) * 0.3;
        const x = Math.cos(angle) * radius * variation;
        const y = Math.sin(angle) * radius * variation;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Details
      ctx.fillStyle = "#775533";
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.6;
        const y = Math.sin(angle) * radius * 0.6;
        ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
      }
      ctx.fill();
      
    } else if (obstacle.type === 1) { // Horizontal
      // Space mine with spikes
      ctx.fillStyle = "#CC3333";
      
      // Main body
      ctx.beginPath();
      ctx.arc(0, 0, obstacle.height / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Spikes
      ctx.fillStyle = "#882222";
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(obstacle.height / 2, 0);
        ctx.lineTo(obstacle.height / 2 + 15, -8);
        ctx.lineTo(obstacle.height / 2 + 15, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      
    } else { // Vertical
      // Laser barrier effect
      const glowIntensity = Math.sin(gameTime * 5) * 0.3 + 0.7;
      
      // Core beam
      ctx.fillStyle = \`rgba(255, 50, 50, \${0.8 * glowIntensity})\`;
      ctx.fillRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
      
      // Glow effect
      const gradient = ctx.createLinearGradient(0, -obstacle.height/2, 0, obstacle.height/2);
      gradient.addColorStop(0, \`rgba(255, 100, 100, 0)\`);
      gradient.addColorStop(0.5, \`rgba(255, 200, 200, \${0.6 * glowIntensity})\`);
      gradient.addColorStop(1, \`rgba(255, 100, 100, 0)\`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-obstacle.width/2 - 10, -obstacle.height/2, obstacle.width + 20, obstacle.height);
      
      // End caps
      ctx.fillStyle = "#555555";
      ctx.beginPath();
      ctx.arc(-obstacle.width/2, 0, obstacle.width/2, -Math.PI/2, Math.PI/2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(obstacle.width/2, 0, obstacle.width/2, Math.PI/2, -Math.PI/2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Check for collisions
function checkCollisions() {
  // Player vs collectibles
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const collectible = collectibles[i];
    
    // Skip if already collected
    if (collectible.collected) continue;
    
    // Simple rectangular collision
    const playerCenterX = player.x + player.width/2;
    const playerCenterY = player.y + player.height/2;
    const collectibleCenterX = collectible.x + collectible.width/2;
    const collectibleCenterY = collectible.y + collectible.height/2;
    
    const dx = playerCenterX - collectibleCenterX;
    const dy = playerCenterY - collectibleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < (player.width + collectible.width) / 2) {
      collectCollectible(collectible);
    }
  }
  
  // Player vs obstacles (only if not invulnerable)
  if (!player.invulnerable) {
    for (const obstacle of obstacles) {
      if (checkObstacleCollision(player, obstacle)) {
        handleObstacleCollision();
        break;
      }
    }
  }
  
  // Check for victory condition
  let allCollected = true;
  for (const collectible of collectibles) {
    if (!collectible.collected) {
      allCollected = false;
      break;
    }
  }
  
  if (allCollected) {
    gameState = "victory";
    
    // Victory particles
    createVictoryParticles();
  }
}

// More precise obstacle collision check
function checkObstacleCollision(player, obstacle) {
  // Different collision detection based on obstacle type
  const playerCenterX = player.x + player.width/2;
  const playerCenterY = player.y + player.height/2;
  const obstacleCenterX = obstacle.x + obstacle.width/2;
  const obstacleCenterY = obstacle.y + obstacle.height/2;
  
  if (obstacle.type === 0) { // Static - circular collision
    const dx = playerCenterX - obstacleCenterX;
    const dy = playerCenterY - obstacleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (player.width + obstacle.width) / 2 * 0.8; // 0.8 for leniency
    
    return distance < minDistance;
    
  } else { // Rectangular collision with rotation consideration
    // Simplified rectangular collision for now
    const dx = Math.abs(playerCenterX - obstacleCenterX);
    const dy = Math.abs(playerCenterY - obstacleCenterY);
    
    return dx < (player.width + obstacle.width) / 2 * 0.7 && 
           dy < (player.height + obstacle.height) / 2 * 0.7;
  }
  
  return false;
}

// Handle collectible collection
function collectCollectible(collectible) {
  collectible.collected = true;
  score += 100 * (collectible.type + 1);
  
  // Add a score popup
  particles.push({
    type: "score",
    x: collectible.x + collectible.width/2,
    y: collectible.y - 20,
    text: "+" + (100 * (collectible.type + 1)),
    color: collectible.type === 0 ? "#55FFBB" : collectible.type === 1 ? "#FFDD44" : "#FFCC00",
    life: 1.0,
    maxLife: 1.0,
    vy: -40
  });
  
  // Play sound effect
  if (SAAAM.playSound) {
    if (collectible.type === 0) { // Gem
      SAAAM.playSound("gem");
    } else if (collectible.type === 1) { // Star
      SAAAM.playSound("star");
    } else { // Coin
      SAAAM.playSound("coin");
    }
  }
  
  // Create collection particles
  createCollectionParticles(collectible);
  
  // Check for remaining collectibles
  let remaining = 0;
  for (const c of collectibles) {
    if (!c.collected) remaining++;
  }
  
  // If only one left, make it pulse and glow to make it easier to find
  if (remaining === 1) {
    for (const c of collectibles) {
      if (!c.collected) {
        c.bobHeight *= 2;
        c.bobSpeed *= 1.5;
      }
    }
  }
}

// Handle obstacle collision
function handleObstacleCollision() {
  lives--;
  
  // Play hit sound
  if (SAAAM.playSound) {
    SAAAM.playSound("hit");
  }
  
  // Create explosion particles
  createExplosionParticles(player.x + player.width/2, player.y + player.height/2);
  
  // Make player temporarily invulnerable
  player.invulnerable = true;
  player.invulnerableTime = 2.0;
  
  // Check for game over
  if (lives <= 0) {
    gameState = "gameOver";
  }
}

// Create particles for collectible collection
function createCollectionParticles(collectible) {
  const cx = collectible.x + collectible.width/2;
  const cy = collectible.y + collectible.height/2;
  const color = collectible.type === 0 ? "#55FFBB" : 
                collectible.type === 1 ? "#FFDD44" : "#FFCC00";
  
  // Create sparkle effect
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    particles.push({
      type: "sparkle",
      x: cx,
      y: cy,
      size: 2 + Math.random() * 3,
      color: color,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 0.5 + Math.random() * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }
  
  // Create circular wave effect
  particles.push({
    type: "wave",
    x: cx,
    y: cy,
    radius: 5,
    maxRadius: 60,
    color: color,
    life: 0.5,
    maxLife: 0.5
  });
}

// Create explosion particles for player damage
function createExplosionParticles(x, y) {
  // Create small fragments
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 200;
    particles.push({
      type: "fragment",
      x: x,
      y: y,
      size: 2 + Math.random() * 4,
      color: i % 3 === 0 ? "#FFAA00" : i % 3 === 1 ? "#FF6600" : "#FF3300",
      life: 0.5 + Math.random() * 1.0,
      maxLife: 0.5 + Math.random() * 1.0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }
  
  // Create smoke
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 40;
    particles.push({
      type: "smoke",
      x: x,
      y: y,
      size: 20 + Math.random() * 30,
      color: "#BBBBBB",
      life: 0.8 + Math.random() * 1.0,
      maxLife: 0.8 + Math.random() * 1.0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }
  
  // Create shockwave
  particles.push({
    type: "shockwave",
    x: x,
    y: y,
    radius: 10,
    maxRadius: 100,
    life: 0.4,
    maxLife: 0.4
  });
}

// Create victory particles
function createVictoryParticles() {
  // Create fireworks at various locations
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 400;
    
    setTimeout(() => {
      createFirework(x, y);
    }, i * 300); // Stagger fireworks
  }
}

// Create a firework explosion
function createFirework(x, y) {
  const color = \`hsl(\${Math.random() * 360}, 100%, 70%)\`;
  
  // Create explosion particles
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 200;
    particles.push({
      type: "firework",
      x: x,
      y: y,
      size: 2 + Math.random() * 3,
      color: color,
      life: 0.5 + Math.random() * 1.0,
      maxLife: 0.5 + Math.random() * 1.0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 100
    });
  }
  
  // Play sound if available
  if (SAAAM.playSound) {
    SAAAM.playSound("firework");
  }
}

// Update all particles
function updateParticles(deltaTime) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Update life
    particle.life -= deltaTime;
    
    // Remove dead particles
    if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    // Update position for moving particles
    if (particle.type === "sparkle" || particle.type === "fragment" || 
        particle.type === "firework" || particle.type === "score") {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
    }
    
    // Apply gravity for some particles
    if (particle.gravity) {
      particle.vy += particle.gravity * deltaTime;
    }
    
    // Update radius for expanding particles
    if (particle.type === "wave" || particle.type === "shockwave") {
      const progress = 1 - (particle.life / particle.maxLife);
      particle.radius = particle.maxRadius * progress;
    }
    
    // Update smoke size
    if (particle.type === "smoke") {
      const progress = 1 - (particle.life / particle.maxLife);
      particle.size += 20 * deltaTime;
    }
  }
}

// Draw background particles (behind game elements)
function drawBackgroundParticles(ctx) {
  for (const particle of particles) {
    if (particle.type === "smoke") {
      const alpha = particle.life / particle.maxLife * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}

// Draw particles (foreground, after game elements)
function drawParticles(ctx) {
  for (const particle of particles) {
    // Skip smoke particles (drawn in background)
    if (particle.type === "smoke") continue;
    
    const alpha = particle.life / particle.maxLife;
    
    if (particle.type === "sparkle" || particle.type === "fragment" || particle.type === "firework") {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.type === "wave" || particle.type === "shockwave") {
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = particle.type === "wave" ? particle.color : "#FFFFFF";
      ctx.lineWidth = particle.type === "wave" ? 2 : 3;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (particle.type === "score") {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(particle.text, particle.x, particle.y);
    }
    
    ctx.globalAlpha = 1.0;
  }
}

// Draw UI elements
function drawUI(ctx) {
  // Score
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "left";
  ctx.fillText(\`Score: \${score}\`, 20, 40);
  
  // Lives
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.fillText(\`Lives: \${lives}\`, 780, 40);
  
  // Draw heart icons for lives
  for (let i = 0; i < lives; i++) {
    drawHeart(ctx, 680 + i * 30, 35, 12);
  }
  
  // Tutorial text
  if (gameTime < 5) {
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "18px Arial";
    ctx.fillText("Use arrow keys or WASD to move", 400, 550);
    ctx.fillText("Collect all items and avoid obstacles!", 400, 580);
  }
  
  // Draw all particles (foreground)
  drawParticles(ctx);
}

// Draw a heart icon
function drawHeart(ctx, x, y, size) {
  ctx.fillStyle = "#FF5555";
  
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(
    x, y, 
    x - size, y, 
    x - size, y + size
  );
  ctx.bezierCurveTo(
    x - size, y + size * 1.5,
    x, y + size * 1.5,
    x, y + size * 2
  );
  ctx.bezierCurveTo(
    x, y + size * 1.5,
    x + size, y + size * 1.5,
    x + size, y + size
  );
  ctx.bezierCurveTo(
    x + size, y,
    x, y,
    x, y + size * 0.3
  );
  ctx.fill();
}

// Draw game over screen
function drawGameOverScreen(ctx) {
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, 800, 600);
  
  // Game over text
  ctx.fillStyle = "#FF5555";
  ctx.textAlign = "center";
  ctx.font = "bold 48px Arial";
  ctx.fillText("GAME OVER", 400, 250);
  
  // Score
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "24px Arial";
  ctx.fillText(\`Final Score: \${score}\`, 400, 300);
  
  // Restart instructions
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "18px Arial";
  ctx.fillText("Press SPACE to play again", 400, 350);
}

// Draw victory screen
function drawVictoryScreen(ctx) {
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 20, 0.5)";
  ctx.fillRect(0, 0, 800, 600);
  
  // Victory text
  const pulse = Math.sin(gameTime * 5) * 0.1 + 0.9;
  ctx.fillStyle = "#FFCC00";
  ctx.textAlign = "center";
  ctx.font = \`bold \${Math.floor(48 * pulse)}px Arial\`;
  ctx.fillText("VICTORY!", 400, 250);
  
  // Score
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "24px Arial";
  ctx.fillText(\`Final Score: \${score}\`, 400, 300);
  ctx.fillText(\`Lives Remaining: \${lives}\`, 400, 330);
  
  // Restart instructions
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "18px Arial";
  ctx.fillText("Press SPACE to play again", 400, 380);
}

// Reset the game
function resetGame() {
  score = 0;
  lives = 3;
  gameTime = 0;
  gameState = "playing";
  player.x = 400;
  player.y = 300;
  player.invulnerable = false;
  player.invulnerableTime = 0;
  player.trailParticles = [];
  
  // Clear particles
  particles = [];
  
  // Respawn collectibles and obstacles
  spawnCollectibles();
  spawnObstacles();
}
`
