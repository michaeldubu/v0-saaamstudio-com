// SAAAM Runtime - Core engine for executing SAAAM code in a sandboxed environment

// Define types for the SAAAM runtime
export type SaaamVector2 = {
  x: number
  y: number
}

export type SaaamColor = string

export type SaaamKeyCode = {
  left: number
  right: number
  up: number
  down: number
  space: number
  enter: number
  escape: number
  shift: number
  ctrl: number
  alt: number
  [key: string]: number
}

export type SaaamGameObject = {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  visible: boolean
  [key: string]: any
}

export type SaaamRuntimeState = {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  width: number
  height: number
  objects: SaaamGameObject[]
  lastFrameTime: number
  deltaTime: number
  fps: number
  frameCount: number
  keys: Record<number, boolean>
  mousePosition: SaaamVector2
  mouseButtons: Record<number, boolean>
  debugMode: boolean
  paused: boolean
  createFn: Function | null
  stepFn: Function | null
  drawFn: Function | null
  destroyFn: Function | null
}

// Create the SAAAM runtime
export class SaaamRuntime {
  private state: SaaamRuntimeState
  private animationFrameId: number | null = null
  public sandboxEnv: Record<string, any> = {}
  private errors: string[] = []
  private logs: string[] = []
  private onErrorCallback: ((error: string) => void) | null = null
  private onLogCallback: ((log: string) => void) | null = null

  constructor() {
    this.state = {
      canvas: null,
      ctx: null,
      width: 800,
      height: 600,
      objects: [],
      lastFrameTime: 0,
      deltaTime: 0,
      fps: 0,
      frameCount: 0,
      keys: {},
      mousePosition: { x: 0, y: 0 },
      mouseButtons: {},
      debugMode: false,
      paused: false,
      createFn: null,
      stepFn: null,
      drawFn: null,
      destroyFn: null,
    }

    // Initialize the sandbox environment with SAAAM API
    this.initSandboxEnv()
  }

  // Initialize the sandbox environment with SAAAM API
  private initSandboxEnv() {
    // Core SAAAM API
    this.sandboxEnv.SAAAM = {
      // Lifecycle registration
      registerCreate: (fn: Function) => {
        this.state.createFn = fn
      },
      registerStep: (fn: Function) => {
        this.state.stepFn = fn
      },
      registerDraw: (fn: Function) => {
        this.state.drawFn = fn
      },
      registerDestroy: (fn: Function) => {
        this.state.destroyFn = fn
      },

      // Drawing functions
      drawRectangle: (x: number, y: number, width: number, height: number, color: SaaamColor) => {
        if (!this.state.ctx) return
        this.state.ctx.fillStyle = color
        this.state.ctx.fillRect(x, y, width, height)
      },
      drawCircle: (x: number, y: number, radius: number, color: SaaamColor) => {
        if (!this.state.ctx) return
        this.state.ctx.fillStyle = color
        this.state.ctx.beginPath()
        this.state.ctx.arc(x, y, radius, 0, Math.PI * 2)
        this.state.ctx.fill()
      },
      drawLine: (x1: number, y1: number, x2: number, y2: number, color: SaaamColor, width = 1) => {
        if (!this.state.ctx) return
        this.state.ctx.strokeStyle = color
        this.state.ctx.lineWidth = width
        this.state.ctx.beginPath()
        this.state.ctx.moveTo(x1, y1)
        this.state.ctx.lineTo(x2, y2)
        this.state.ctx.stroke()
      },
      drawText: (text: string, x: number, y: number, color: SaaamColor, font = "16px Arial") => {
        if (!this.state.ctx) return
        this.state.ctx.fillStyle = color
        this.state.ctx.font = font
        this.state.ctx.fillText(text, x, y)
      },
      drawSprite: (sprite: string, x: number, y: number, width: number, height: number) => {
        // In a real implementation, this would load and draw sprites
        console.log(`Drawing sprite ${sprite} at (${x}, ${y})`)
      },

      // Input functions
      keyboardCheck: (keyCode: number) => {
        return !!this.state.keys[keyCode]
      },
      mouseCheck: (button: number) => {
        return !!this.state.mouseButtons[button]
      },
      getMousePosition: () => {
        return { ...this.state.mousePosition }
      },
      mousePressed: () => {
        return !!this.state.mouseButtons[0] // Left mouse button
      },
      mouseX: () => {
        return this.state.mousePosition.x
      },
      mouseY: () => {
        return this.state.mousePosition.y
      },
      keyboardCheckPressed: (keyCode: number) => {
        // This requires tracking previous key state, which is not in current runtime.
        // For simplicity, we'll simulate a "pressed" state by checking if it's currently down.
        // A more robust solution would involve a `prevKeys` state.
        return !!this.state.keys[keyCode] // Simple check for now
      },

      // Utility functions
      random: (min: number, max: number) => {
        return Math.random() * (max - min) + min
      },
      randomInt: (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
      },
      distance: (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      },
      clamp: (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max)
      },

      // Game object management
      createObject: (obj: Partial<SaaamGameObject>) => {
        const gameObject: SaaamGameObject = {
          id: `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          x: 0,
          y: 0,
          width: 32,
          height: 32,
          rotation: 0,
          visible: true,
          ...obj,
        }
        this.state.objects.push(gameObject)
        return gameObject
      },
      destroyObject: (id: string) => {
        this.state.objects = this.state.objects.filter((obj) => obj.id !== id)
      },
      getObject: (id: string) => {
        return this.state.objects.find((obj) => obj.id === id)
      },
      getAllObjects: () => {
        return [...this.state.objects]
      },

      // Debug functions
      setDebugMode: (enabled: boolean) => {
        this.state.debugMode = enabled
      },
      log: (message: string) => {
        this.logs.push(message)
        if (this.onLogCallback) {
          this.onLogCallback(message)
        }
        console.log(`[SAAAM] ${message}`)
      },

      // Constants
      vk: {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
        space: 32,
        enter: 13,
        escape: 27,
        shift: 16,
        ctrl: 17,
        alt: 18,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        num0: 48,
        num1: 49,
        num2: 50,
        num3: 51,
        num4: 52,
        num5: 53,
        num6: 54,
        num7: 55,
        num8: 56,
        num9: 57,
      } as SaaamKeyCode,
    }

    // Add console functions
    this.sandboxEnv.console = {
      log: (...args: any[]) => {
        const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
        this.logs.push(message)
        if (this.onLogCallback) {
          this.onLogCallback(message)
        }
        console.log(`[SAAAM Console] ${message}`)
      },
      error: (...args: any[]) => {
        const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
        this.errors.push(message)
        if (this.onErrorCallback) {
          this.onErrorCallback(message)
        }
        console.error(`[SAAAM Console] ${message}`)
      },
      warn: (...args: any[]) => {
        const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
        this.logs.push(`[WARN] ${message}`)
        if (this.onLogCallback) {
          this.onLogCallback(`[WARN] ${message}`)
        }
        console.warn(`[SAAAM Console] ${message}`)
      },
    }

    // Add Math functions
    this.sandboxEnv.Math = { ...Math }
  }

  // Initialize the runtime with a canvas
  public initialize(canvas: HTMLCanvasElement) {
    this.state.canvas = canvas
    this.state.ctx = canvas.getContext("2d")
    this.state.width = canvas.width
    this.state.height = canvas.height

    // Set up event listeners
    this.setupEventListeners()

    return this
  }

  // Set up event listeners for input
  private setupEventListeners() {
    if (!this.state.canvas) return

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      this.state.keys[e.keyCode] = true
    })

    window.addEventListener("keyup", (e) => {
      this.state.keys[e.keyCode] = false
    })

    // Mouse events
    this.state.canvas.addEventListener("mousemove", (e) => {
      const rect = this.state.canvas!.getBoundingClientRect()
      this.state.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    })

    this.state.canvas.addEventListener("mousedown", (e) => {
      this.state.mouseButtons[e.button] = true
    })

    this.state.canvas.addEventListener("mouseup", (e) => {
      this.state.mouseButtons[e.button] = false
    })

    // Prevent context menu on right-click
    this.state.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault()
    })
  }

  // Execute SAAAM code in the sandbox
  public executeCode(code: string): boolean {
    this.errors = []
    this.logs = []

    try {
      // Reset lifecycle functions
      this.state.createFn = null
      this.state.stepFn = null
      this.state.drawFn = null
      this.state.destroyFn = null

      // Create a function that executes the code in the sandbox environment
      const sandboxFunction = new Function(
        ...Object.keys(this.sandboxEnv),
        `
        try {
          ${code}
          return true;
        } catch (error) {
          throw error;
        }
        `,
      )

      // Execute the code with the sandbox environment
      const result = sandboxFunction(...Object.values(this.sandboxEnv))

      // Call the create function if it was registered
      if (this.state.createFn) {
        try {
          this.state.createFn()
        } catch (error) {
          this.handleError(`Error in create function: ${error}`)
          return false
        }
      }

      return result === true
    } catch (error) {
      this.handleError(`Error executing code: ${error}`)
      return false
    }
  }

  // Start the game loop
  public start() {
    if (this.animationFrameId !== null) {
      this.stop()
    }

    this.state.lastFrameTime = performance.now()
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  // Stop the game loop
  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // Call the destroy function if it was registered
    if (this.state.destroyFn) {
      try {
        this.state.destroyFn()
      } catch (error) {
        this.handleError(`Error in destroy function: ${error}`)
      }
    }
  }

  // Pause/unpause the game
  public togglePause() {
    this.state.paused = !this.state.paused
  }

  // The main game loop
  private gameLoop(timestamp: number) {
    // Calculate delta time
    this.state.deltaTime = (timestamp - this.state.lastFrameTime) / 1000
    this.state.lastFrameTime = timestamp
    this.state.fps = 1 / this.state.deltaTime
    this.state.frameCount++

    // Clear the canvas
    if (this.state.ctx && this.state.canvas) {
      this.state.ctx.clearRect(0, 0, this.state.width, this.state.height)
    }

    // Update game state if not paused
    if (!this.state.paused) {
      // Call the step function if it was registered
      if (this.state.stepFn) {
        try {
          this.state.stepFn(this.state.deltaTime)
        } catch (error) {
          this.handleError(`Error in step function: ${error}`)
          this.stop()
          return
        }
      }
    }

    // Draw the game
    if (this.state.drawFn) {
      try {
        this.state.drawFn(this.state.ctx)
      } catch (error) {
        this.handleError(`Error in draw function: ${error}`)
        this.stop()
        return
      }
    }

    // Draw debug info if debug mode is enabled
    if (this.state.debugMode && this.state.ctx) {
      this.drawDebugInfo()
    }

    // Continue the game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  // Draw debug information
  private drawDebugInfo() {
    if (!this.state.ctx) return

    const ctx = this.state.ctx
    const padding = 10
    const lineHeight = 20
    let y = padding

    // Set up debug text style
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(0, 0, 200, 100)
    ctx.font = "12px monospace"
    ctx.fillStyle = "#00FF00"

    // Draw FPS
    ctx.fillText(`FPS: ${Math.round(this.state.fps)}`, padding, y)
    y += lineHeight

    // Draw object count
    ctx.fillText(`Objects: ${this.state.objects.length}`, padding, y)
    y += lineHeight

    // Draw mouse position
    ctx.fillText(
      `Mouse: (${Math.round(this.state.mousePosition.x)}, ${Math.round(this.state.mousePosition.y)})`,
      padding,
      y,
    )
    y += lineHeight

    // Draw frame count
    ctx.fillText(`Frame: ${this.state.frameCount}`, padding, y)
  }

  // Handle errors
  private handleError(error: string) {
    this.errors.push(error)
    if (this.onErrorCallback) {
      this.onErrorCallback(error)
    }
    console.error(`[SAAAM Runtime] ${error}`)
  }

  // Set error callback
  public onError(callback: (error: string) => void) {
    this.onErrorCallback = callback
    return this
  }

  // Set log callback
  public onLog(callback: (log: string) => void) {
    this.onLogCallback = callback
    return this
  }

  // Get all errors
  public getErrors(): string[] {
    return [...this.errors]
  }

  // Get all logs
  public getLogs(): string[] {
    return [...this.logs]
  }

  // Clear all errors and logs
  public clearLogsAndErrors() {
    this.errors = []
    this.logs = []
  }

  // Resize the canvas
  public resize(width: number, height: number) {
    if (!this.state.canvas) return

    this.state.canvas.width = width
    this.state.canvas.height = height
    this.state.width = width
    this.state.height = height
  }

  // Get the current state
  public getState(): SaaamRuntimeState {
    return { ...this.state }
  }

  // Add this method to the SaaamRuntime class
  getFps(): number {
    return this.state.fps || 0
  }
}
