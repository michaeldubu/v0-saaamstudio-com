export class SaaamInterpreter {
  private scripts: Map<string, string>
  private canvas: HTMLCanvasElement | null
  private ctx: CanvasRenderingContext2D | null
  private gameRunning: boolean
  private lastFrameTime: number
  private keyStates: Map<number, boolean>
  private keyPressedStates: Map<number, boolean>
  private createFn: Function | null
  private stepFn: Function | null
  private drawFn: Function | null
  public compiler: any

  constructor(saaamGlobal: any) {
    this.scripts = new Map()
    this.canvas = null
    this.ctx = null
    this.gameRunning = false
    this.lastFrameTime = 0
    this.keyStates = new Map()
    this.keyPressedStates = new Map()
    this.createFn = null
    this.stepFn = null
    this.drawFn = null
    this.compiler = null

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  initialize() {
    console.log("SaaamInterpreter initialized")

    // Set up keyboard event listeners
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("keyup", this.handleKeyUp)
  }

  loadScript(code: string, scriptId: string): boolean {
    // Store the script
    this.scripts.set(scriptId, code)
    return true
  }

  executeScript(scriptId: string): boolean {
    const code = this.scripts.get(scriptId)
    if (!code) return false

    try {
      // Reset game functions
      this.createFn = null
      this.stepFn = null
      this.drawFn = null

      // Execute the script
      new Function(code)()

      return true
    } catch (error) {
      console.error("Error executing script:", error)
      return false
    }
  }

  startGame(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")

    if (!this.ctx) {
      console.error("Could not get 2D context from canvas")
      return false
    }

    // Call create function if it exists
    if (this.createFn) {
      try {
        this.createFn()
      } catch (error) {
        console.error("Error in create function:", error)
      }
    }

    // Start game loop
    this.gameRunning = true
    this.lastFrameTime = performance.now()
    requestAnimationFrame(this.gameLoop)

    return true
  }

  stopGame() {
    this.gameRunning = false

    // Clean up event listeners
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
  }

  private gameLoop(timestamp: number) {
    if (!this.gameRunning || !this.ctx || !this.canvas) return

    // Calculate delta time
    const deltaTime = (timestamp - this.lastFrameTime) / 1000
    this.lastFrameTime = timestamp

    // Clear canvas
    this.ctx.fillStyle = "#222"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Call step function if it exists
    if (this.stepFn) {
      try {
        this.stepFn(deltaTime)
      } catch (error) {
        console.error("Error in step function:", error)
      }
    }

    // Call draw function if it exists
    if (this.drawFn) {
      try {
        this.drawFn(this.ctx)
      } catch (error) {
        console.error("Error in draw function:", error)
      }
    }

    // Reset keyPressed states
    this.keyPressedStates.clear()

    // Continue game loop
    requestAnimationFrame(this.gameLoop)
  }

  private handleKeyDown(event: KeyboardEvent) {
    const keyCode = event.keyCode || event.which

    // Set key pressed state if key wasn't already down
    if (!this.keyStates.get(keyCode)) {
      this.keyPressedStates.set(keyCode, true)
    }

    // Set key down state
    this.keyStates.set(keyCode, true)

    // Prevent default behavior for arrow keys to avoid page scrolling
    if (keyCode >= 37 && keyCode <= 40) {
      event.preventDefault()
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const keyCode = event.keyCode || event.which

    // Clear key states
    this.keyStates.set(keyCode, false)
    this.keyPressedStates.delete(keyCode)
  }

  // Public methods for game code to use
  keyboardCheck(keyCode: number): boolean {
    return !!this.keyStates.get(keyCode)
  }

  keyboardCheckPressed(keyCode: number): boolean {
    return !!this.keyPressedStates.get(keyCode)
  }

  drawSprite(spriteIndex: number, imageIndex: number, x: number, y: number) {
    if (!this.ctx) return

    // Simple placeholder for sprite drawing
    this.ctx.fillStyle = "#0FF"
    this.ctx.fillRect(x, y, 32, 32)
    this.ctx.strokeStyle = "#000"
    this.ctx.strokeRect(x, y, 32, 32)
    this.ctx.fillStyle = "#000"
    this.ctx.font = "10px Arial"
    this.ctx.fillText(`S:${spriteIndex},I:${imageIndex}`, x + 2, y + 16)
  }

  drawRectangle(x: number, y: number, width: number, height: number, color: string) {
    if (!this.ctx) return

    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }

  drawCircle(x: number, y: number, radius: number, color: string) {
    if (!this.ctx) return

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    if (!this.ctx) return

    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  drawText(text: string, x: number, y: number, color: string) {
    if (!this.ctx) return

    this.ctx.fillStyle = color
    this.ctx.font = "16px Arial"
    this.ctx.fillText(text, x, y)
  }

  registerCreate(func: Function) {
    this.createFn = func
  }

  registerStep(func: Function) {
    this.stepFn = func
  }

  registerDraw(func: Function) {
    this.drawFn = func
  }

  // Add this method to the SaaamInterpreter class
  isGameRunning(): boolean {
    return this.gameRunning
  }
}

