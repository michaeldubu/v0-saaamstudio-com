import type { FileItem } from "@/app/studio/page" // Import FileItem type

interface LogEntry {
  type: "info" | "success" | "error" | "system"
  message: string
}

interface RunScriptResult {
  success: boolean
  logs: LogEntry[]
}

// Extend the Window interface to include SAAAM properties
declare global {
  interface Window {
    SAAAM: {
      createFn?: Function
      drawFn?: Function
      Engine?: any // Reference to the engine instance
      animationFrameId?: number // To store the requestAnimationFrame ID
    }
    draw_text: (text: string, x: number, y: number, color: string) => void
    log: (...args: any[]) => void // Global log function for SAAAM scripts
    ERROR: (...args: any[]) => void // Global ERROR function for SAAAM scripts
  }
}

interface SAAAM {
  createFn: () => void
  drawFn: (ctx: CanvasRenderingContext2D) => void
  animationFrameId: number | null
}

window.SAAAM = {
  createFn: () => {},
  drawFn: (ctx: CanvasRenderingContext2D) => {},
  animationFrameId: null,
}

class SaaamEngine {
  private logs: LogEntry[] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationFrameId: number | null = null
  private isRunning = false

  constructor() {
    // Initialize global SAAAM object and functions
    window.SAAAM = window.SAAAM || {}
    window.SAAAM.Engine = this // Make the engine instance accessible globally

    // Global log function for SAAAM scripts
    window.log = (...args: any[]) => {
      this.appendLog("info", args.map(String).join(" "))
    }
    // Global ERROR function for SAAAM scripts
    window.ERROR = (...args: any[]) => {
      this.appendLog("error", args.map(String).join(" "))
    }
  }

  private appendLog(type: "info" | "success" | "error" | "system", message: string) {
    this.logs.push({ type, message })
  }

  public async loadProject(files: FileItem[]): Promise<RunScriptResult> {
    this.logs = []
    this.appendLog("system", "Loading project into SAAAM Engine...")
    // In a real scenario, this would parse and load game assets, configurations, etc.
    // For now, it just simulates loading.
    await new Promise((resolve) => setTimeout(resolve, 200))
    this.appendLog("success", `Loaded ${files.length} files.`)
    return { success: true, logs: this.logs }
  }

  public async runScript(scriptContent: string, fileName: string, canvas: HTMLCanvasElement): Promise<RunScriptResult> {
    this.logs = []
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")

    if (!this.ctx) {
      this.appendLog("error", "Failed to get 2D rendering context from canvas.")
      return { success: false, logs: this.logs }
    }

    this.stop() // Stop any previously running game

    this.appendLog("system", `Running script: ${fileName}...`)
    this.isRunning = true

    // Clear canvas before running new script
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Reset SAAAM global functions for new script execution
    window.SAAAM.createFn = undefined
    window.SAAAM.drawFn = undefined

    // Provide a mock SAAAM global object for the script to interact with
    const mockSAAAM = {
      registerCreate: (fn: Function) => {
        this.appendLog("info", "SAAAM: Registered create function.")
        window.SAAAM.createFn = fn
      },
      registerDraw: (fn: Function) => {
        this.appendLog("info", "SAAAM: Registered draw function.")
        window.SAAAM.drawFn = fn
      },
      // Add other SAAAM functions as needed, e.g., for input, physics, etc.
    }

    // Expose draw_text globally for the script
    window.draw_text = (text: string, x: number, y: number, color: string) => {
      if (this.ctx) {
        this.ctx.fillStyle = color
        this.ctx.font = "24px Arial"
        this.ctx.textAlign = "center"
        this.ctx.fillText(text, x, y)
      }
    }

    try {
      // Execute the script in a controlled environment
      // WARNING: Using `new Function()` with untrusted code is a security risk.
      // A proper DSL interpreter would parse and execute the SAAAM language safely.
      new Function("SAAAM", scriptContent)(mockSAAAM)

      // Run the create function once
      if (window.SAAAM.createFn) {
        this.appendLog("info", "SAAAM: Executing create function.")
        window.SAAAM.createFn()
      }

      // Start game loop for draw function
      if (window.SAAAM.drawFn) {
        this.appendLog("info", "SAAAM: Starting game loop.")
        const gameLoop = () => {
          if (!this.isRunning || !this.ctx || !this.canvas) return // Stop if not running or canvas is gone
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // Clear canvas each frame
          window.SAAAM.drawFn!(this.ctx) // Call the script's draw function
          this.animationFrameId = requestAnimationFrame(gameLoop)
        }
        this.animationFrameId = requestAnimationFrame(gameLoop)
      } else {
        this.appendLog("info", "SAAAM: No draw function registered. Game loop not started.")
      }

      this.appendLog("success", "Script execution started. Check game preview.")
      return { success: true, logs: this.logs }
    } catch (error: any) {
      this.appendLog("error", `Runtime Error in ${fileName}: ${error.message}`)
      this.isRunning = false // Stop game on error
      this.stop()
      return { success: false, logs: this.logs }
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
    this.appendLog("system", "Game execution stopped.")
  }

  public getIsRunning(): boolean {
    return this.isRunning
  }
}

export const saaamEngine = new SaaamEngine()

export function runScript(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    console.error("Could not get 2D rendering context")
    return
  }

  window.SAAAM.createFn()

  function gameLoop() {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      window.SAAAM.drawFn(ctx)
    }
    window.SAAAM.animationFrameId = requestAnimationFrame(gameLoop)
  }

  gameLoop()
}

export function draw_text(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.fillText(text, x, y)
}

export function stop() {
  if (window.SAAAM.animationFrameId !== null) {
    cancelAnimationFrame(window.SAAAM.animationFrameId)
    window.SAAAM.animationFrameId = null
  }
}
