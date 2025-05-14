"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define types for our context
export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: "script" | "asset" | "config" | "room" | "sprite" | "sound" | "other"
  lastModified: Date
}

export interface ProjectAsset {
  id: string
  name: string
  path: string
  type: "sprite" | "sound" | "room" | "other"
  metadata?: Record<string, any>
}

export interface ProjectEntity {
  id: string
  name: string
  components: string[]
  properties: Record<string, any>
}

export interface ProjectData {
  name: string
  files: ProjectFile[]
  assets: ProjectAsset[]
  entities: ProjectEntity[]
  activeFile: string | null
  activeEntity: string | null
}

interface StudioContextType {
  project: ProjectData
  editorContent: string
  setEditorContent: (content: string) => void
  updateFile: (fileId: string, content: string) => void
  getFileById: (fileId: string) => ProjectFile | undefined
  getActiveFile: () => ProjectFile | undefined
  setActiveFile: (fileId: string) => void
  analyzeCode: (code: string) => Promise<CodeAnalysisResult>
  insertCodeAtCursor: (code: string) => void
  highlightCodeSection: (lineStart: number, lineEnd: number) => void
  clearHighlights: () => void
}

export interface CodeAnalysisResult {
  issues: {
    type: "error" | "warning" | "info"
    message: string
    line?: number
    column?: number
  }[]
  suggestions: {
    type: "optimization" | "style" | "feature"
    message: string
    code?: string
    line?: number
  }[]
  entities: {
    name: string
    type: string
    line: number
  }[]
  functions: {
    name: string
    params: string[]
    line: number
  }[]
}

// Create the context with a default value
const StudioContext = createContext<StudioContextType | undefined>(undefined)

// Sample project data for demonstration
const sampleProject: ProjectData = {
  name: "My SAAAM Game",
  files: [
    {
      id: "main-script",
      name: "main.saaam",
      path: "/main.saaam",
      content: `// Main game script
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game variables
let player = {
  x: 400,
  y: 300,
  width: 40,
  height: 40,
  speed: 200,
  color: "#4488FF"
};

function create() {
  console.log("Game created!");
}

function step(deltaTime) {
  // Handle player input
  if (SAAAM.keyboardCheck(SAAAM.vk.left)) {
    player.x -= player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.right)) {
    player.x += player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.up)) {
    player.y -= player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.down)) {
    player.y += player.speed * deltaTime;
  }
  
  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > 800) player.x = 800 - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > 600) player.y = 600 - player.height;
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");
  
  // Draw the player
  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);
}`,
      type: "script",
      lastModified: new Date(),
    },
    {
      id: "player-script",
      name: "player.saaam",
      path: "/player.saaam",
      content: `// Player controller
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 200;
    this.color = "#4488FF";
    this.health = 100;
    this.maxHealth = 100;
  }
  
  update(deltaTime) {
    // Handle input
    if (SAAAM.keyboardCheck(SAAAM.vk.left)) {
      this.x -= this.speed * deltaTime;
    }
    if (SAAAM.keyboardCheck(SAAAM.vk.right)) {
      this.x += this.speed * deltaTime;
    }
    if (SAAAM.keyboardCheck(SAAAM.vk.up)) {
      this.y -= this.speed * deltaTime;
    }
    if (SAAAM.keyboardCheck(SAAAM.vk.down)) {
      this.y += this.speed * deltaTime;
    }
    
    // Keep within screen bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 800) this.x = 800 - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > 600) this.y = 600 - this.height;
  }
  
  draw(ctx) {
    SAAAM.drawRectangle(this.x, this.y, this.width, this.height, this.color);
    
    // Draw health bar
    const healthBarWidth = this.width;
    const healthBarHeight = 5;
    const healthPercent = this.health / this.maxHealth;
    
    // Background
    SAAAM.drawRectangle(
      this.x, 
      this.y - 10, 
      healthBarWidth, 
      healthBarHeight, 
      "#333333"
    );
    
    // Health
    SAAAM.drawRectangle(
      this.x, 
      this.y - 10, 
      healthBarWidth * healthPercent, 
      healthBarHeight, 
      "#33CC33"
    );
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }
  
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }
}`,
      type: "script",
      lastModified: new Date(),
    },
    {
      id: "enemy-script",
      name: "enemy.saaam",
      path: "/enemy.saaam",
      content: `// Enemy AI
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.color = "#FF4444";
    this.health = 50;
    this.maxHealth = 50;
    this.state = "patrol"; // patrol, chase, attack
    this.patrolPoints = [
      { x: x, y: y },
      { x: x + 100, y: y },
      { x: x + 100, y: y + 100 },
      { x: x, y: y + 100 }
    ];
    this.currentPatrolPoint = 0;
    this.detectionRadius = 150;
  }
  
  update(deltaTime, playerX, playerY) {
    // Check distance to player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    
    // Update state based on player distance
    if (distanceToPlayer < this.detectionRadius) {
      this.state = "chase";
    } else {
      this.state = "patrol";
    }
    
    // Handle different states
    if (this.state === "patrol") {
      this.patrol(deltaTime);
    } else if (this.state === "chase") {
      this.chase(deltaTime, playerX, playerY);
    }
  }
  
  patrol(deltaTime) {
    const target = this.patrolPoints[this.currentPatrolPoint];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Move to next patrol point
      this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
    } else {
      // Move towards patrol point
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.speed * deltaTime;
      this.y += Math.sin(angle) * this.speed * deltaTime;
    }
  }
  
  chase(deltaTime, playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const angle = Math.atan2(dy, dx);
    
    this.x += Math.cos(angle) * this.speed * deltaTime;
    this.y += Math.sin(angle) * this.speed * deltaTime;
  }
  
  draw(ctx) {
    SAAAM.drawRectangle(this.x, this.y, this.width, this.height, this.color);
    
    // Draw detection radius in debug mode
    if (SAAAM.debugMode) {
      ctx.globalAlpha = 0.1;
      SAAAM.drawCircle(
        this.x + this.width/2, 
        this.y + this.height/2, 
        this.detectionRadius, 
        "#FF0000"
      );
      ctx.globalAlpha = 1.0;
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    return this.health <= 0;
  }
}`,
      type: "script",
      lastModified: new Date(),
    },
  ],
  assets: [
    {
      id: "player-sprite",
      name: "player.png",
      path: "/sprites/player.png",
      type: "sprite",
    },
    {
      id: "enemy-sprite",
      name: "enemy.png",
      path: "/sprites/enemy.png",
      type: "sprite",
    },
    {
      id: "background-music",
      name: "background.mp3",
      path: "/sounds/background.mp3",
      type: "sound",
    },
  ],
  entities: [
    {
      id: "player-entity",
      name: "Player",
      components: ["Transform", "Sprite", "Controller"],
      properties: {
        x: 400,
        y: 300,
        speed: 200,
      },
    },
    {
      id: "enemy-entity",
      name: "Enemy",
      components: ["Transform", "Sprite", "AI"],
      properties: {
        x: 200,
        y: 200,
        speed: 100,
      },
    },
  ],
  activeFile: "main-script",
  activeEntity: null,
}

// Create a provider component
export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectData>(sampleProject)
  const [editorContent, setEditorContent] = useState<string>(
    sampleProject.files.find((f) => f.id === sampleProject.activeFile)?.content || "",
  )

  // Update a file's content
  const updateFile = (fileId: string, content: string) => {
    setProject((prev) => ({
      ...prev,
      files: prev.files.map((file) => (file.id === fileId ? { ...file, content, lastModified: new Date() } : file)),
    }))
  }

  // Get a file by ID
  const getFileById = (fileId: string) => {
    return project.files.find((file) => file.id === fileId)
  }

  // Get the active file
  const getActiveFile = () => {
    return project.files.find((file) => file.id === project.activeFile)
  }

  // Set the active file
  const setActiveFile = (fileId: string) => {
    const file = getFileById(fileId)
    if (file) {
      setProject((prev) => ({ ...prev, activeFile: fileId }))
      setEditorContent(file.content)
    }
  }

  // Analyze code for issues, suggestions, and structure
  const analyzeCode = async (code: string): Promise<CodeAnalysisResult> => {
    // In a real implementation, this would call an API or use a local parser
    // For now, we'll simulate some basic analysis

    const issues = []
    const suggestions = []
    const entities = []
    const functions = []

    // Simple pattern matching for demonstration
    const lines = code.split("\n")

    lines.forEach((line, index) => {
      // Check for potential issues
      if (line.includes("console.log")) {
        issues.push({
          type: "info",
          message: "Console logs should be removed in production code",
          line: index + 1,
        })
      }

      // Look for missing semicolons
      if (
        line.trim() &&
        !line.trim().startsWith("//") &&
        !line.includes("{") &&
        !line.includes("}") &&
        !line.endsWith(";") &&
        !line.trim().endsWith(")")
      ) {
        issues.push({
          type: "warning",
          message: "Missing semicolon",
          line: index + 1,
        })
      }

      // Detect entity definitions
      if (line.includes("class") && line.includes("{")) {
        const match = line.match(/class\s+(\w+)/)
        if (match && match[1]) {
          entities.push({
            name: match[1],
            type: "class",
            line: index + 1,
          })
        }
      }

      // Detect function definitions
      if (line.includes("function") && line.includes("(")) {
        const match = line.match(/function\s+(\w+)\s*$$(.*?)$$/)
        if (match && match[1]) {
          functions.push({
            name: match[1],
            params: match[2].split(",").map((p) => p.trim()),
            line: index + 1,
          })
        }
      }

      // Generate suggestions
      if (line.includes("if") && line.includes("keyboardCheck") && !code.includes("else if")) {
        suggestions.push({
          type: "optimization",
          message: "Consider using a switch statement for multiple key checks",
          line: index + 1,
        })
      }
    })

    // Check for missing lifecycle functions
    if (
      !code.includes("SAAAM.registerCreate") ||
      !code.includes("SAAAM.registerStep") ||
      !code.includes("SAAAM.registerDraw")
    ) {
      suggestions.push({
        type: "feature",
        message: "Add missing SAAAM lifecycle registrations",
        code: `// Add these at the top of your file
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);`,
      })
    }

    return {
      issues,
      suggestions,
      entities,
      functions,
    }
  }

  // Insert code at the cursor position (simulated)
  const insertCodeAtCursor = (code: string) => {
    // In a real implementation, this would interact with the editor
    // For now, we'll just append the code to the current content
    setEditorContent((prev) => prev + "\n\n" + code)

    // Also update the active file
    if (project.activeFile) {
      updateFile(project.activeFile, editorContent + "\n\n" + code)
    }
  }

  // Highlight a section of code (simulated)
  const highlightCodeSection = (lineStart: number, lineEnd: number) => {
    console.log(`Highlighting lines ${lineStart} to ${lineEnd}`)
    // In a real implementation, this would interact with the editor
  }

  // Clear all highlights (simulated)
  const clearHighlights = () => {
    console.log("Clearing all highlights")
    // In a real implementation, this would interact with the editor
  }

  // Update editor content when active file changes
  useEffect(() => {
    const activeFile = getActiveFile()
    if (activeFile) {
      setEditorContent(activeFile.content)
    }
  }, [project.activeFile])

  const contextValue: StudioContextType = {
    project,
    editorContent,
    setEditorContent,
    updateFile,
    getFileById,
    getActiveFile,
    setActiveFile,
    analyzeCode,
    insertCodeAtCursor,
    highlightCodeSection,
    clearHighlights,
  }

  return <StudioContext.Provider value={contextValue}>{children}</StudioContext.Provider>
}

// Custom hook to use the studio context
export const useStudio = () => {
  const context = useContext(StudioContext)
  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider")
  }
  return context
}

