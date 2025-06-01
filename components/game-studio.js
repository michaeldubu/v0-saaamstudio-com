"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, X, Upload, Download, Settings, Code, Play, Square, Trash2, Copy } from "lucide-react"

// Game Studio Component
const GameStudio = ({ onCodeGenerated }) => {
  // State for game entities and properties
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [gameProperties, setGameProperties] = useState({
    title: "My SAAAM Game",
    width: 800,
    height: 600,
    backgroundColor: "#222222",
    gravity: 0.5,
    friction: 0.1,
  })
  const [showEntityEditor, setShowEntityEditor] = useState(false)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [entityTypes, setEntityTypes] = useState([
    { id: "player", name: "Player", color: "#4488FF", isUnique: true },
    { id: "enemy", name: "Enemy", color: "#FF4444" },
    { id: "collectible", name: "Collectible", color: "#FFCC00" },
    { id: "platform", name: "Platform", color: "#44CC44" },
    { id: "trigger", name: "Trigger Zone", color: "#CC44CC" },
  ])
  const [newEntityType, setNewEntityType] = useState({ name: "", color: "#FFFFFF" })
  const [entityIdCounter, setEntityIdCounter] = useState(1)
  const [draggedEntity, setDraggedEntity] = useState(null)
  const [copiedEntity, setCopiedEntity] = useState(null)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(32)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [layers, setLayers] = useState([
    { id: "background", name: "Background", visible: true, locked: false },
    { id: "main", name: "Main", visible: true, locked: false, active: true },
    { id: "foreground", name: "Foreground", visible: true, locked: false },
  ])
  const [activeLayer, setActiveLayer] = useState("main")
  const [showAssetLibrary, setShowAssetLibrary] = useState(false)
  const [assets, setAssets] = useState([
    { id: "asset1", name: "Player Sprite", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset2", name: "Enemy Sprite", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset3", name: "Coin Sprite", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset4", name: "Jump Sound", type: "sound", url: "#" },
    { id: "asset5", name: "Background Music", type: "sound", url: "#" },
  ])

  const canvasRef = useRef(null)
  const studioContainerRef = useRef(null)

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      // Set canvas size
      canvas.width = gameProperties.width
      canvas.height = gameProperties.height

      // Draw the game world
      drawGameWorld(ctx)
    }
  }, [entities, gameProperties, showGrid, gridSize, zoom, pan, layers])

  // Handle mouse events for entity manipulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left) / zoom - pan.x
      const mouseY = (e.clientY - rect.top) / zoom - pan.y

      // Check if middle mouse button (for panning)
      if (e.button === 1 || e.buttons === 4) {
        setIsPanning(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
        return
      }

      // Check if clicking on an entity
      const clickedEntity = entities.find((entity) => {
        return (
          mouseX >= entity.x &&
          mouseX <= entity.x + entity.width &&
          mouseY >= entity.y &&
          mouseY <= entity.y + entity.height &&
          layers.find((l) => l.id === entity.layer)?.visible
        )
      })

      if (clickedEntity) {
        setSelectedEntity(clickedEntity)
        setDraggedEntity(clickedEntity)
      } else {
        setSelectedEntity(null)
      }
    }

    const handleMouseMove = (e) => {
      if (isPanning) {
        const dx = e.clientX - lastMousePos.x
        const dy = e.clientY - lastMousePos.y
        setPan((prevPan) => ({
          x: prevPan.x + dx / zoom,
          y: prevPan.y + dy / zoom,
        }))
        setLastMousePos({ x: e.clientX, y: e.clientY })
        return
      }

      if (draggedEntity) {
        const rect = canvas.getBoundingClientRect()
        let newX = (e.clientX - rect.left) / zoom - pan.x - draggedEntity.width / 2
        let newY = (e.clientY - rect.top) / zoom - pan.y - draggedEntity.height / 2

        // Snap to grid if enabled
        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize
          newY = Math.round(newY / gridSize) * gridSize
        }

        // Update entity position
        setEntities((prevEntities) =>
          prevEntities.map((entity) => (entity.id === draggedEntity.id ? { ...entity, x: newX, y: newY } : entity)),
        )
      }
    }

    const handleMouseUp = () => {
      setDraggedEntity(null)
      setIsPanning(false)
    }

    const handleWheel = (e) => {
      e.preventDefault()

      // Zoom in/out
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((prevZoom) => Math.max(0.1, Math.min(3, prevZoom * zoomFactor)))
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("wheel", handleWheel)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [entities, draggedEntity, zoom, pan, isPanning, lastMousePos, snapToGrid, gridSize, layers])

  // Draw the game world
  const drawGameWorld = (ctx) => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = gameProperties.backgroundColor
    ctx.fillRect(0, 0, gameProperties.width, gameProperties.height)

    // Apply zoom and pan
    ctx.save()
    ctx.translate(pan.x * zoom, pan.y * zoom)
    ctx.scale(zoom, zoom)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1 / zoom

      // Vertical lines
      for (let x = 0; x <= gameProperties.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, gameProperties.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= gameProperties.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(gameProperties.width, y)
        ctx.stroke()
      }
    }

    // Draw entities by layer
    layers.forEach((layer) => {
      if (!layer.visible) return

      entities
        .filter((entity) => entity.layer === layer.id)
        .forEach((entity) => {
          // Draw entity
          ctx.fillStyle = entity.color || "#FFFFFF"
          ctx.fillRect(entity.x, entity.y, entity.width, entity.height)

          // Draw selection outline
          if (selectedEntity && entity.id === selectedEntity.id) {
            ctx.strokeStyle = "#FFFF00"
            ctx.lineWidth = 2 / zoom
            ctx.strokeRect(entity.x - 2 / zoom, entity.y - 2 / zoom, entity.width + 4 / zoom, entity.height + 4 / zoom)
          }

          // Draw entity name
          ctx.fillStyle = "#FFFFFF"
          ctx.font = `${12 / zoom}px Arial`
          ctx.fillText(entity.name, entity.x, entity.y - 5 / zoom)
        })
    })

    ctx.restore()
  }

  // Add a new entity
  const addEntity = (type) => {
    // Find the entity type
    const entityType = entityTypes.find((et) => et.id === type)
    if (!entityType) return

    // Check if this type is unique and already exists
    if (entityType.isUnique && entities.some((e) => e.type === type)) {
      addLog("error", `Only one ${entityType.name} entity is allowed`)
      return
    }

    // Create new entity
    const newEntity = {
      id: `entity_${entityIdCounter}`,
      name: `${entityType.name}_${entityIdCounter}`,
      type: type,
      x: gameProperties.width / 2 - 25,
      y: gameProperties.height / 2 - 25,
      width: 50,
      height: 50,
      color: entityType.color,
      layer: activeLayer,
      properties: {
        speed: type === "player" ? 5 : 3,
        health: type === "player" ? 100 : 50,
        damage: type === "enemy" ? 10 : 0,
        value: type === "collectible" ? 10 : 0,
        solid: type === "platform",
        trigger: type === "trigger",
      },
    }

    // Add to entities array
    setEntities([...entities, newEntity])
    setEntityIdCounter(entityIdCounter + 1)
    setSelectedEntity(newEntity)
    addLog("info", `Added new ${entityType.name} entity`)

    // Save state for undo
    saveStateForUndo()
  }

  // Delete selected entity
  const deleteSelectedEntity = () => {
    if (!selectedEntity) return

    // Save state for undo
    saveStateForUndo()

    // Remove entity
    setEntities(entities.filter((entity) => entity.id !== selectedEntity.id))
    setSelectedEntity(null)
    addLog("info", `Deleted entity: ${selectedEntity.name}`)
  }

  // Update entity properties
  const updateEntityProperty = (property, value) => {
    if (!selectedEntity) return

    // Save state for undo
    saveStateForUndo()

    // Update entity
    setEntities(entities.map((entity) => (entity.id === selectedEntity.id ? { ...entity, [property]: value } : entity)))

    // Update selected entity
    setSelectedEntity({ ...selectedEntity, [property]: value })
  }

  // Update nested entity property
  const updateNestedEntityProperty = (category, property, value) => {
    if (!selectedEntity) return

    // Save state for undo
    saveStateForUndo()

    // Update entity
    setEntities(
      entities.map((entity) =>
        entity.id === selectedEntity.id
          ? {
              ...entity,
              [category]: {
                ...entity[category],
                [property]: value,
              },
            }
          : entity,
      ),
    )

    // Update selected entity
    setSelectedEntity({
      ...selectedEntity,
      [category]: {
        ...selectedEntity[category],
        [property]: value,
      },
    })
  }

  // Generate SAAAM code
  const generateCode = () => {
    let code = `// Generated SAAAM Game Code
// Game: ${gameProperties.title}
// Created with SAAAM Game Studio

// Register game lifecycle functions
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game properties
const GAME_WIDTH = ${gameProperties.width};
const GAME_HEIGHT = ${gameProperties.height};
const GRAVITY = ${gameProperties.gravity};
const FRICTION = ${gameProperties.friction};

// Game entities
`

    // Add entity declarations
    entities.forEach((entity) => {
      code += `const ${entity.name.toLowerCase().replace(/\s+/g, "_")} = {
  x: ${entity.x},
  y: ${entity.y},
  width: ${entity.width},
  height: ${entity.height},
  color: "${entity.color}",
`

      // Add type-specific properties
      if (entity.type === "player") {
        code += `  speed: ${entity.properties?.speed || 5},
  health: ${entity.properties?.health || 100},
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  direction: 1, // 1 = right, -1 = left
`
      } else if (entity.type === "enemy") {
        code += `  speed: ${entity.properties?.speed || 3},
  health: ${entity.properties?.health || 50},
  damage: ${entity.properties?.damage || 10},
  velocityX: 0,
  velocityY: 0,
  direction: 1, // 1 = right, -1 = left
  patrolDistance: 100,
  startX: ${entity.x},
`
      } else if (entity.type === "collectible") {
        code += `  value: ${entity.properties?.value || 10},
  collected: false,
  bobHeight: 10,
  bobSpeed: 2,
  baseY: ${entity.y},
`
      } else if (entity.type === "platform") {
        code += `  solid: ${entity.properties?.solid !== undefined ? entity.properties.solid : true},
`
      } else if (entity.type === "trigger") {
        code += `  triggered: false,
  onlyOnce: true,
  active: true,
`
      }

      code += `};\n\n`
    })

    // Add game variables
    code += `// Game variables
let score = 0;
let gameOver = false;
let camera = { x: 0, y: 0 };

// Create function - called once at start
function create() {
  console.log("Game created!");
  // Initialize game
`

    // Add initialization code
    const playerEntity = entities.find((e) => e.type === "player")
    if (playerEntity) {
      code += `  // Center camera on player
  centerCameraOnPlayer();
`
    }

    code += `}

// Step function - called every frame
function step(deltaTime) {
  if (gameOver) return;

  // Update game logic
`

    // Add player controls if player exists
    if (playerEntity) {
      code += `  // Player controls
  handlePlayerInput(deltaTime);
  
  // Apply physics to player
  applyPhysics(${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}, deltaTime);
`
    }

    // Add enemy logic if enemies exist
    if (entities.some((e) => e.type === "enemy")) {
      code += `  // Update enemies
  updateEnemies(deltaTime);
`
    }

    // Add collectible logic if collectibles exist
    if (entities.some((e) => e.type === "collectible")) {
      code += `  // Update collectibles
  updateCollectibles(deltaTime);
`
    }

    // Add collision detection
    code += `  // Check collisions
  checkCollisions();
  
  // Update camera
  updateCamera();
}

// Draw function - called every frame after step
function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, "${gameProperties.backgroundColor}");
  
  // Apply camera transform
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  
  // Draw game world
`

    // Add drawing code for each entity type
    // Background layer
    const backgroundEntities = entities.filter((e) => e.layer === "background")
    if (backgroundEntities.length > 0) {
      code += `  // Draw background layer\n`
      backgroundEntities.forEach((entity) => {
        code += `  SAAAM.drawRectangle(${entity.name.toLowerCase().replace(/\s+/g, "_")}.x, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.y, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.width, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.height, "${entity.color}");\n`
      })
    }

    // Main layer
    const mainEntities = entities.filter((e) => e.layer === "main")
    if (mainEntities.length > 0) {
      code += `  // Draw main layer\n`
      mainEntities.forEach((entity) => {
        if (entity.type === "collectible") {
          code += `  if (!${entity.name.toLowerCase().replace(/\s+/g, "_")}.collected) {\n`
          code += `    SAAAM.drawRectangle(${entity.name.toLowerCase().replace(/\s+/g, "_")}.x, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.y, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.width, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.height, "${entity.color}");\n`
          code += `  }\n`
        } else {
          code += `  SAAAM.drawRectangle(${entity.name.toLowerCase().replace(/\s+/g, "_")}.x, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.y, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.width, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.height, "${entity.color}");\n`
        }
      })
    }

    // Foreground layer
    const foregroundEntities = entities.filter((e) => e.layer === "foreground")
    if (foregroundEntities.length > 0) {
      code += `  // Draw foreground layer\n`
      foregroundEntities.forEach((entity) => {
        code += `  SAAAM.drawRectangle(${entity.name.toLowerCase().replace(/\s+/g, "_")}.x, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.y, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.width, ${entity.name.toLowerCase().replace(/\s+/g, "_")}.height, "${entity.color}");\n`
      })
    }

    code += `  
  // Restore camera transform
  ctx.restore();
  
  // Draw UI (not affected by camera)
  SAAAM.drawText("Score: " + score, 20, 30, "#FFFFFF");
  
  if (gameOver) {
    SAAAM.drawText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2, "#FF0000");
    SAAAM.drawText("Press R to restart", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, "#FFFFFF");
  }
}
`

    // Add helper functions
    if (playerEntity) {
      code += `
// Handle player input
function handlePlayerInput(deltaTime) {
  // Reset velocity
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityX = 0;
  
  // Move left/right
  if (SAAAM.keyboardCheck(SAAAM.vk.left) || SAAAM.keyboardCheck(SAAAM.vk.a)) {
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityX = -${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.speed;
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.direction = -1;
  }
  
  if (SAAAM.keyboardCheck(SAAAM.vk.right) || SAAAM.keyboardCheck(SAAAM.vk.d)) {
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityX = ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.speed;
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.direction = 1;
  }
  
  // Jump
  if ((SAAAM.keyboardCheck(SAAAM.vk.up) || SAAAM.keyboardCheck(SAAAM.vk.w) || SAAAM.keyboardCheck(SAAAM.vk.space)) && !${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.isJumping) {
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityY = -10;
    ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.isJumping = true;
  }
  
  // Restart game
  if (gameOver && SAAAM.keyboardCheckPressed(SAAAM.vk.r)) {
    resetGame();
  }
}

// Apply physics to an entity
function applyPhysics(entity, deltaTime) {
  // Apply gravity
  entity.velocityY += GRAVITY;
  
  // Apply friction
  entity.velocityX *= (1 - FRICTION);
  
  // Update position
  entity.x += entity.velocityX;
  entity.y += entity.velocityY;
  
  // Keep player within game bounds
  if (entity.x < 0) entity.x = 0;
  if (entity.x + entity.width > GAME_WIDTH) entity.x = GAME_WIDTH - entity.width;
  
  // Check if fallen off the bottom
  if (entity.y > GAME_HEIGHT) {
    if (entity === ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}) {
      gameOver = true;
    }
  }
}

// Center camera on player
function centerCameraOnPlayer() {
  camera.x = ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.x + ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.width / 2 - GAME_WIDTH / 2;
  camera.y = ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.y + ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.height / 2 - GAME_HEIGHT / 2;
  
  // Clamp camera to game bounds
  camera.x = Math.max(0, Math.min(camera.x, GAME_WIDTH - GAME_WIDTH));
  camera.y = Math.max(0, Math.min(camera.y, GAME_HEIGHT - GAME_HEIGHT));
}

// Update camera position
function updateCamera() {
  // Smoothly follow player
  const targetX = ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.x + ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.width / 2 - GAME_WIDTH / 2;
  const targetY = ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.y + ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.height / 2 - GAME_HEIGHT / 2;
  
  camera.x += (targetX - camera.x) * 0.1;
  camera.y += (targetY - camera.y) * 0.1;
  
  // Clamp camera to game bounds
  camera.x = Math.max(0, Math.min(camera.x, GAME_WIDTH - GAME_WIDTH));
  camera.y = Math.max(0, Math.min(camera.y, GAME_HEIGHT - GAME_HEIGHT));
}
`
    }

    // Add enemy update function if enemies exist
    if (entities.some((e) => e.type === "enemy")) {
      code += `
// Update enemies
function updateEnemies(deltaTime) {
`
      entities
        .filter((e) => e.type === "enemy")
        .forEach((enemy) => {
          code += `  // Update ${enemy.name}
  if (${enemy.name.toLowerCase().replace(/\s+/g, "_")}.x < ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.startX - ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.patrolDistance) {
    ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.direction = 1;
  } else if (${enemy.name.toLowerCase().replace(/\s+/g, "_")}.x > ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.startX + ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.patrolDistance) {
    ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.direction = -1;
  }
  
  ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.velocityX = ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.speed * ${enemy.name.toLowerCase().replace(/\s+/g, "_")}.direction;
  
  // Apply physics
  applyPhysics(${enemy.name.toLowerCase().replace(/\s+/g, "_")}, deltaTime);
`
        })
      code += `}
`
    }

    // Add collectible update function if collectibles exist
    if (entities.some((e) => e.type === "collectible")) {
      code += `
// Update collectibles
function updateCollectibles(deltaTime) {
`
      entities
        .filter((e) => e.type === "collectible")
        .forEach((collectible) => {
          code += `  // Update ${collectible.name}
  if (!${collectible.name.toLowerCase().replace(/\s+/g, "_")}.collected) {
    // Bob up and down
    ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.y = ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.baseY + Math.sin(Date.now() / 1000 * ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.bobSpeed) * ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.bobHeight;
  }
`
        })
      code += `}
`
    }

    // Add collision detection
    code += `
// Check collisions between entities
function checkCollisions() {
`

    // Player vs platforms
    const platforms = entities.filter((e) => e.type === "platform")
    if (playerEntity && platforms.length > 0) {
      code += `  // Player vs platforms
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.isJumping = true;
  
`
      platforms.forEach((platform) => {
        code += `  if (checkCollision(${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}, ${platform.name.toLowerCase().replace(/\s+/g, "_")})) {
    // Only resolve collision if player is falling down
    if (${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityY > 0) {
      ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.y = ${platform.name.toLowerCase().replace(/\s+/g, "_")}.y - ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.height;
      ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityY = 0;
      ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.isJumping = false;
    }
  }
`
      })
    }

    // Player vs enemies
    const enemies = entities.filter((e) => e.type === "enemy")
    if (playerEntity && enemies.length > 0) {
      code += `  // Player vs enemies
`
      enemies.forEach((enemy) => {
        code += `  if (checkCollision(${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}, ${enemy.name.toLowerCase().replace(/\s+/g, "_")})) {
    // Player takes damage
    gameOver = true;
  }
`
      })
    }

    // Player vs collectibles
    const collectibles = entities.filter((e) => e.type === "collectible")
    if (playerEntity && collectibles.length > 0) {
      code += `  // Player vs collectibles
`
      collectibles.forEach((collectible) => {
        code += `  if (!${collectible.name.toLowerCase().replace(/\s+/g, "_")}.collected && checkCollision(${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}, ${collectible.name.toLowerCase().replace(/\s+/g, "_")})) {
    // Collect item
    ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.collected = true;
    score += ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.value;
  }
`
      })
    }

    // Player vs triggers
    const triggers = entities.filter((e) => e.type === "trigger")
    if (playerEntity && triggers.length > 0) {
      code += `  // Player vs triggers
`
      triggers.forEach((trigger) => {
        code += `  if (${trigger.name.toLowerCase().replace(/\s+/g, "_")}.active && checkCollision(${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}, ${trigger.name.toLowerCase().replace(/\s+/g, "_")})) {
    // Trigger event
    ${trigger.name.toLowerCase().replace(/\s+/g, "_")}.triggered = true;
    console.log("Trigger activated: ${trigger.name}");
    
    // Deactivate if it should only trigger once
    if (${trigger.name.toLowerCase().replace(/\s+/g, "_")}.onlyOnce) {
      ${trigger.name.toLowerCase().replace(/\s+/g, "_")}.active = false;
    }
  }
`
      })
    }

    code += `}

// Helper function to check collision between two rectangles
function checkCollision(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}

// Reset the game
function resetGame() {
  // Reset game state
  score = 0;
  gameOver = false;
  
  // Reset player
`

    if (playerEntity) {
      code += `  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.x = ${playerEntity.x};
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.y = ${playerEntity.y};
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityX = 0;
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.velocityY = 0;
  ${playerEntity.name.toLowerCase().replace(/\s+/g, "_")}.isJumping = false;
`
    }

    // Reset collectibles
    if (collectibles.length > 0) {
      code += `  // Reset collectibles
`
      collectibles.forEach((collectible) => {
        code += `  ${collectible.name.toLowerCase().replace(/\s+/g, "_")}.collected = false;
`
      })
    }

    // Reset triggers
    if (triggers.length > 0) {
      code += `  // Reset triggers
`
      triggers.forEach((trigger) => {
        code += `  ${trigger.name.toLowerCase().replace(/\s+/g, "_")}.triggered = false;
  ${trigger.name.toLowerCase().replace(/\s+/g, "_")}.active = true;
`
      })
    }

    code += `}
`

    setGeneratedCode(code)
    setShowCodePreview(true)
    addLog("success", "Generated SAAAM code")
    return code
  }

  // Add a log message
  const addLog = (type, message) => {
    setLogs((prevLogs) => [...prevLogs, { type, message, timestamp: new Date() }])
  }

  // Save state for undo
  const saveStateForUndo = () => {
    setUndoStack([...undoStack, { entities: [...entities], selectedEntity }])
    setRedoStack([])
  }

  // Undo last action
  const undo = () => {
    if (undoStack.length === 0) return

    // Get last state
    const lastState = undoStack[undoStack.length - 1]

    // Save current state for redo
    setRedoStack([...redoStack, { entities: [...entities], selectedEntity }])

    // Restore last state
    setEntities(lastState.entities)
    setSelectedEntity(lastState.selectedEntity)

    // Remove last state from undo stack
    setUndoStack(undoStack.slice(0, -1))

    addLog("info", "Undo")
  }

  // Redo last undone action
  const redo = () => {
    if (redoStack.length === 0) return

    // Get last state
    const lastState = redoStack[redoStack.length - 1]

    // Save current state for undo
    setUndoStack([...undoStack, { entities: [...entities], selectedEntity }])

    // Restore last state
    setEntities(lastState.entities)
    setSelectedEntity(lastState.selectedEntity)

    // Remove last state from redo stack
    setRedoStack(redoStack.slice(0, -1))

    addLog("info", "Redo")
  }

  // Copy selected entity
  const copyEntity = () => {
    if (!selectedEntity) return

    setCopiedEntity({ ...selectedEntity })
    addLog("info", `Copied entity: ${selectedEntity.name}`)
  }

  // Paste copied entity
  const pasteEntity = () => {
    if (!copiedEntity) return

    // Save state for undo
    saveStateForUndo()

    // Create new entity with unique ID and name
    const newEntity = {
      ...copiedEntity,
      id: `entity_${entityIdCounter}`,
      name: `${copiedEntity.name}_copy`,
      x: copiedEntity.x + 20,
      y: copiedEntity.y + 20,
    }

    // Add to entities array
    setEntities([...entities, newEntity])
    setEntityIdCounter(entityIdCounter + 1)
    setSelectedEntity(newEntity)

    addLog("info", `Pasted entity: ${newEntity.name}`)
  }

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId) => {
    setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  // Toggle layer lock
  const toggleLayerLock = (layerId) => {
    setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, locked: !layer.locked } : layer)))
  }

  // Set active layer
  const setActiveLayerId = (layerId) => {
    setLayers(layers.map((layer) => ({ ...layer, active: layer.id === layerId })))
    setActiveLayer(layerId)
  }

  // Run the game
  const runGame = () => {
    setIsRunning(!isRunning)

    if (!isRunning) {
      addLog("info", "Running game...")
      // Generate code and run it
      const code = generateCode()

      // In a real implementation, this would execute the code in a sandbox
      // For now, we'll just toggle the state

      // If we had onCodeGenerated prop, we'd call it here
      if (onCodeGenerated) {
        onCodeGenerated(code)
      }
    } else {
      addLog("info", "Stopped game")
    }
  }

  // Export project
  const exportProject = () => {
    const projectData = {
      gameProperties,
      entities,
      entityTypes,
      layers,
    }

    const dataStr = JSON.stringify(projectData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${gameProperties.title.replace(/\s+/g, "_")}_project.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    addLog("success", "Exported project")
  }

  // Import project
  const importProject = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result)

        // Validate project data
        if (!projectData.gameProperties || !projectData.entities || !projectData.entityTypes || !projectData.layers) {
          throw new Error("Invalid project file")
        }

        // Load project data
        setGameProperties(projectData.gameProperties)
        setEntities(projectData.entities)
        setEntityTypes(projectData.entityTypes)
        setLayers(projectData.layers)
        setSelectedEntity(null)

        addLog("success", "Imported project")
      } catch (error) {
        addLog("error", `Failed to import project: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Add a new entity type
  const addEntityType = () => {
    if (!newEntityType.name) {
      addLog("error", "Entity type name is required")
      return
    }

    // Create ID from name
    const id = newEntityType.name.toLowerCase().replace(/\s+/g, "_")

    // Check if ID already exists
    if (entityTypes.some((et) => et.id === id)) {
      addLog("error", `Entity type with ID "${id}" already exists`)
      return
    }

    // Add new entity type
    setEntityTypes([
      ...entityTypes,
      {
        id,
        name: newEntityType.name,
        color: newEntityType.color,
        isUnique: false,
      },
    ])

    // Reset form
    setNewEntityType({ name: "", color: "#FFFFFF" })

    addLog("success", `Added new entity type: ${newEntityType.name}`)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white" ref={studioContainerRef}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-yellow-400">SAAAM Game Studio</span>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded flex items-center ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            onClick={runGame}
          >
            {isRunning ? (
              <>
                <Square size={16} className="mr-1" /> Stop
              </>
            ) : (
              <>
                <Play size={16} className="mr-1" /> Run
              </>
            )}
          </button>
          <button
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
            onClick={() => {
              const code = generateCode()
              if (onCodeGenerated) {
                onCodeGenerated(code)
              }
            }}
          >
            <Code size={16} className="mr-1" /> Generate Code
          </button>
          <button
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} className="mr-1" /> Settings
          </button>
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center" onClick={exportProject}>
            <Download size={16} className="mr-1" /> Export
          </button>
          <label className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center cursor-pointer">
            <Upload size={16} className="mr-1" /> Import
            <input type="file" accept=".json" className="hidden" onChange={importProject} />
          </label>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Entity palette */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-2 font-semibold text-sm text-gray-400">ENTITY TYPES</div>
          <div className="flex-1 overflow-y-auto p-2">
            {entityTypes.map((entityType) => (
              <div
                key={entityType.id}
                className="mb-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                onClick={() => addEntity(entityType.id)}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: entityType.color }}></div>
                  <span>{entityType.name}</span>
                </div>
              </div>
            ))}

            {/* Add new entity type */}
            <div className="mt-4 p-2 bg-gray-700 rounded">
              <div className="text-sm font-semibold mb-2">Add New Type</div>
              <input
                type="text"
                placeholder="Type name"
                className="w-full p-1 mb-2 bg-gray-600 border border-gray-500 rounded text-sm"
                value={newEntityType.name}
                onChange={(e) => setNewEntityType({ ...newEntityType, name: e.target.value })}
              />
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">Color:</span>
                <input
                  type="color"
                  className="w-6 h-6 bg-transparent border-0"
                  value={newEntityType.color}
                  onChange={(e) => setNewEntityType({ ...newEntityType, color: e.target.value })}
                />
              </div>
              <button className="w-full p-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={addEntityType}>
                <Plus size={12} className="inline mr-1" /> Add Type
              </button>
            </div>
          </div>

          {/* Layers panel toggle */}
          <div className="p-2 border-t border-gray-700">
            <button
              className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              onClick={() => setShowLayerPanel(!showLayerPanel)}
            >
              {showLayerPanel ? "Hide Layers" : "Show Layers"}
            </button>
          </div>

          {/* Layers panel */}
          {showLayerPanel && (
            <div className="p-2 border-t border-gray-700">
              <div className="text-sm font-semibold mb-2">LAYERS</div>
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`mb-2 p-2 rounded cursor-pointer ${layer.active ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="flex items-center justify-between">
                    <span>{layer.name}</span>
                    <div className="flex items-center">
                      <button
                        className={`w-6 h-6 mr-1 flex items-center justify-center rounded ${layer.visible ? "text-white" : "text-gray-500"}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(layer.id)
                        }}
                      >
                        👁️
                      </button>
                      <button
                        className={`w-6 h-6 flex items-center justify-center rounded ${layer.locked ? "text-yellow-400" : "text-gray-500"}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerLock(layer.id)
                        }}
                      >
                        🔒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Asset library toggle */}
          <div className="p-2 border-t border-gray-700">
            <button
              className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              onClick={() => setShowAssetLibrary(!showAssetLibrary)}
            >
              {showAssetLibrary ? "Hide Assets" : "Show Assets"}
            </button>
          </div>

          {/* Asset library */}
          {showAssetLibrary && (
            <div className="p-2 border-t border-gray-700">
              <div className="text-sm font-semibold mb-2">ASSETS</div>
              <div className="mb-2">
                <div className="text-xs font-semibold mb-1">Sprites</div>
                {assets
                  .filter((a) => a.type === "sprite")
                  .map((asset) => (
                    <div key={asset.id} className="mb-1 p-1 bg-gray-700 rounded text-xs flex items-center">
                      <img
                        src={asset.url || "/placeholder.svg"}
                        alt={asset.name}
                        className="w-6 h-6 mr-1 object-cover"
                      />
                      <span className="truncate">{asset.name}</span>
                    </div>
                  ))}
              </div>
              <div>
                <div className="text-xs font-semibold mb-1">Sounds</div>
                {assets
                  .filter((a) => a.type === "sound")
                  .map((asset) => (
                    <div key={asset.id} className="mb-1 p-1 bg-gray-700 rounded text-xs flex items-center">
                      <span className="mr-1">🔊</span>
                      <span className="truncate">{asset.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 relative overflow-hidden bg-gray-900">
            <div
              className="absolute inset-0 flex items-center justify-center overflow-auto"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
              }}
            >
              <canvas
                ref={canvasRef}
                width={gameProperties.width}
                height={gameProperties.height}
                className="border border-gray-700 shadow-lg"
              ></canvas>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 bg-gray-800 rounded p-1 flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center text-lg"
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              >
                -
              </button>
              <span className="mx-2 text-sm">{Math.round(zoom * 100)}%</span>
              <button
                className="w-8 h-8 flex items-center justify-center text-lg"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                +
              </button>
            </div>

            {/* Grid controls */}
            <div className="absolute bottom-4 left-4 bg-gray-800 rounded p-1 flex items-center">
              <button
                className={`px-2 py-1 text-xs rounded ${showGrid ? "bg-blue-600" : "bg-gray-700"}`}
                onClick={() => setShowGrid(!showGrid)}
              >
                Grid
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ml-2 ${snapToGrid ? "bg-blue-600" : "bg-gray-700"}`}
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                Snap
              </button>
            </div>
          </div>

          {/* Console output */}
          <div className="h-32 bg-gray-800 border-t border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1 bg-gray-900">
              <span className="text-sm font-semibold">Console</span>
              <button className="text-sm text-gray-400 hover:text-white" onClick={() => setLogs([])}>
                Clear
              </button>
            </div>
            <div className="p-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-gray-300"
                  }`}
                >
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar - Entity properties */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          {selectedEntity ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Entity Properties</h2>
                <div className="flex">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                    onClick={copyEntity}
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300"
                    onClick={deleteSelectedEntity}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Basic properties */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  value={selectedEntity.name}
                  onChange={(e) => updateEntityProperty("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">X Position</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={selectedEntity.x}
                    onChange={(e) => updateEntityProperty("x", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Y Position</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={selectedEntity.y}
                    onChange={(e) => updateEntityProperty("y", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={selectedEntity.width}
                    onChange={(e) => updateEntityProperty("width", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={selectedEntity.height}
                    onChange={(e) => updateEntityProperty("height", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                <div className="flex">
                  <input
                    type="color"
                    className="w-10 h-10 p-0 bg-transparent border-0"
                    value={selectedEntity.color}
                    onChange={(e) => updateEntityProperty("color", e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 p-2 ml-2 bg-gray-700 border border-gray-600 rounded"
                    value={selectedEntity.color}
                    onChange={(e) => updateEntityProperty("color", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Layer</label>
                <select
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  value={selectedEntity.layer}
                  onChange={(e) => updateEntityProperty("layer", e.target.value)}
                >
                  {layers.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type-specific properties */}
              {selectedEntity.type === "player" && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Player Properties</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Speed</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        value={selectedEntity.properties?.speed || 5}
                        onChange={(e) => updateNestedEntityProperty("properties", "speed", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Health</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        value={selectedEntity.properties?.health || 100}
                        onChange={(e) => updateNestedEntityProperty("properties", "health", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.type === "enemy" && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Enemy Properties</h3>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Speed</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        value={selectedEntity.properties?.speed || 3}
                        onChange={(e) => updateNestedEntityProperty("properties", "speed", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Health</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        value={selectedEntity.properties?.health || 50}
                        onChange={(e) => updateNestedEntityProperty("properties", "health", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Damage</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      value={selectedEntity.properties?.damage || 10}
                      onChange={(e) => updateNestedEntityProperty("properties", "damage", Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {selectedEntity.type === "collectible" && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Collectible Properties</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      value={selectedEntity.properties?.value || 10}
                      onChange={(e) => updateNestedEntityProperty("properties", "value", Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {selectedEntity.type === "platform" && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Platform Properties</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="solid"
                      className="mr-2"
                      checked={selectedEntity.properties?.solid !== false}
                      onChange={(e) => updateNestedEntityProperty("properties", "solid", e.target.checked)}
                    />
                    <label htmlFor="solid" className="text-sm font-medium text-gray-300">
                      Solid (can stand on)
                    </label>
                  </div>
                </div>
              )}

              {selectedEntity.type === "trigger" && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Trigger Properties</h3>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="onlyOnce"
                      className="mr-2"
                      checked={selectedEntity.properties?.onlyOnce !== false}
                      onChange={(e) => updateNestedEntityProperty("properties", "onlyOnce", e.target.checked)}
                    />
                    <label htmlFor="onlyOnce" className="text-sm font-medium text-gray-300">
                      Trigger only once
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Game Properties</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Game Title</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  value={gameProperties.title}
                  onChange={(e) => setGameProperties({ ...gameProperties, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={gameProperties.width}
                    onChange={(e) => setGameProperties({ ...gameProperties, width: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={gameProperties.height}
                    onChange={(e) => setGameProperties({ ...gameProperties, height: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Background Color</label>
                <div className="flex">
                  <input
                    type="color"
                    className="w-10 h-10 p-0 bg-transparent border-0"
                    value={gameProperties.backgroundColor}
                    onChange={(e) => setGameProperties({ ...gameProperties, backgroundColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 p-2 ml-2 bg-gray-700 border border-gray-600 rounded"
                    value={gameProperties.backgroundColor}
                    onChange={(e) => setGameProperties({ ...gameProperties, backgroundColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gravity</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={gameProperties.gravity}
                    onChange={(e) => setGameProperties({ ...gameProperties, gravity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Friction</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={gameProperties.friction}
                    onChange={(e) => setGameProperties({ ...gameProperties, friction: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Editor Settings</h3>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="showGrid"
                    className="mr-2"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                  <label htmlFor="showGrid" className="text-sm font-medium text-gray-300">
                    Show Grid
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="snapToGrid"
                    className="mr-2"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                  />
                  <label htmlFor="snapToGrid" className="text-sm font-medium text-gray-300">
                    Snap to Grid
                  </label>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Grid Size</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code preview modal */}
      {showCodePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-lg w-3/4 h-3/4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Generated SAAAM Code</h2>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowCodePreview(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap">{generatedCode}</pre>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mr-2"
                onClick={() => {
                  if (onCodeGenerated) {
                    onCodeGenerated(generatedCode)
                  }
                  setShowCodePreview(false)
                }}
              >
                Use This Code
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setShowCodePreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-lg w-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowSettings(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Grid Size</label>
                <input
                  type="number"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="settingsShowGrid"
                  className="mr-2"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <label htmlFor="settingsShowGrid" className="text-sm font-medium text-gray-300">
                  Show Grid
                </label>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="settingsSnapToGrid"
                  className="mr-2"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                />
                <label htmlFor="settingsSnapToGrid" className="text-sm font-medium text-gray-300">
                  Snap to Grid
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameStudio
