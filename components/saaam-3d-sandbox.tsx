"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  RefreshCw,
  Bug,
  Save,
  Download,
  Upload,
  Trash2,
  Copy,
  Layers,
  Code,
  FileText,
  Maximize2,
  Minimize2,
  ZapOff,
  BookOpen,
  Cpu,
  Gauge,
  CuboidIcon as Cube,
} from "lucide-react"
import { useStudio } from "@/contexts/studio-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { load3DEngine, get3DEngine } from "@/lib/saaam-engine-bridge"

interface Saaam3DSandboxProps {
  initialCode?: string
  width?: number
  height?: number
}

// Code templates for 3D
const CODE_TEMPLATES_3D = {
  empty:
    '// SAAAM 3D Game Code\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet engine3D;\nlet scene;\nlet camera;\nlet cube;\n\nfunction create() {\n  console.log("3D Game created!");\n  \n  // Initialize 3D engine\n  const canvas = document.getElementById("gameCanvas");\n  engine3D = SAAAM.ThreeD.createEngine(canvas, "main");\n  \n  if (!engine3D) {\n    console.error("Failed to initialize 3D engine");\n    return;\n  }\n  \n  // Create a scene\n  scene = engine3D.getScene();\n  scene.backgroundColor = [0.1, 0.1, 0.2, 1.0];\n  \n  // Create a camera\n  camera = engine3D.createCamera();\n  camera.transform.setPosition(0, 2, 5);\n  camera.transform.lookAt(SAAAM.ThreeD.Vector3.zero());\n  scene.addCamera(camera);\n  \n  // Create a light\n  const light = engine3D.createLight("directional", [1, 1, 1], 1.0);\n  light.transform.setPosition(1, 3, 2);\n  scene.addLight(light);\n  \n  // Start the engine\n  engine3D.start();\n}\n\nfunction step(deltaTime) {\n  // Game logic here\n}\n\nfunction draw(ctx) {\n  // 2D drawing still works alongside 3D\n  // Clear the 2D canvas (3D has its own canvas)\n  SAAAM.drawRectangle(0, 0, 800, 600, "rgba(0,0,0,0)");\n}',

  rotatingCube:
    '// SAAAM 3D Rotating Cube\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet engine3D;\nlet scene;\nlet camera;\nlet cube;\n\nfunction create() {\n  console.log("3D Game created!");\n  \n  // Initialize 3D engine\n  const canvas = document.getElementById("gameCanvas");\n  engine3D = SAAAM.ThreeD.createEngine(canvas, "main");\n  \n  if (!engine3D) {\n    console.error("Failed to initialize 3D engine");\n    return;\n  }\n  \n  // Create a scene\n  scene = engine3D.getScene();\n  scene.backgroundColor = [0.1, 0.1, 0.2, 1.0];\n  \n  // Create a camera\n  camera = engine3D.createCamera();\n  camera.transform.setPosition(0, 2, 5);\n  camera.transform.lookAt(SAAAM.ThreeD.Vector3.zero());\n  scene.addCamera(camera);\n  \n  // Create a cube\n  cube = SAAAM.ThreeD.GameObject3D.createCube("Cube", 1);\n  cube.setMaterial(SAAAM.ThreeD.Material.phong([1, 0.5, 0.2], 0.3));\n  scene.addGameObject(cube);\n  \n  // Create a light\n  const light = engine3D.createLight("directional", [1, 1, 1], 1.0);\n  light.transform.setPosition(1, 3, 2);\n  scene.addLight(light);\n  \n  // Add ambient light\n  const ambient = engine3D.createLight("ambient", [0.2, 0.2, 0.3], 0.5);\n  scene.addLight(ambient);\n  \n  // Create a ground plane\n  const ground = SAAAM.ThreeD.GameObject3D.createPlane("Ground", 10, 10);\n  ground.transform.setPosition(0, -1, 0);\n  ground.setMaterial(SAAAM.ThreeD.Material.basic([0.3, 0.3, 0.3]));\n  scene.addGameObject(ground);\n  \n  // Start the engine\n  engine3D.start();\n}\n\nfunction step(deltaTime) {\n  // Rotate the cube\n  if (cube) {\n    cube.transform.rotate(0, deltaTime, deltaTime * 0.5);\n  }\n  \n  // Move camera with keyboard\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.left)) {\n    camera.transform.translate(-2 * deltaTime, 0, 0);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.right)) {\n    camera.transform.translate(2 * deltaTime, 0, 0);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.up)) {\n    camera.transform.translate(0, 0, -2 * deltaTime);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.down)) {\n    camera.transform.translate(0, 0, 2 * deltaTime);\n  }\n}\n\nfunction draw(ctx) {\n  // 2D drawing still works alongside 3D\n  // Draw some UI text\n  SAAAM.drawText("3D Rotating Cube - Use arrow keys to move camera", 20, 30, "white", "16px Arial");\n}',

  physics3D:
    '// SAAAM 3D Physics Demo\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet engine3D;\nlet scene;\nlet camera;\nlet spheres = [];\nlet ground;\nlet lastSpawnTime = 0;\n\nfunction create() {\n  console.log("3D Physics Demo created!");\n  \n  // Initialize 3D engine\n  const canvas = document.getElementById("gameCanvas");\n  engine3D = SAAAM.ThreeD.createEngine(canvas, "main");\n  \n  if (!engine3D) {\n    console.error("Failed to initialize 3D engine");\n    return;\n  }\n  \n  // Create a scene\n  scene = engine3D.getScene();\n  scene.backgroundColor = [0.1, 0.1, 0.2, 1.0];\n  \n  // Create a camera\n  camera = engine3D.createCamera();\n  camera.transform.setPosition(0, 5, 10);\n  camera.transform.lookAt(SAAAM.ThreeD.Vector3.zero());\n  scene.addCamera(camera);\n  \n  // Create lights\n  const light = engine3D.createLight("directional", [1, 1, 1], 1.0);\n  light.transform.setPosition(1, 3, 2);\n  scene.addLight(light);\n  \n  const ambient = engine3D.createLight("ambient", [0.2, 0.2, 0.3], 0.5);\n  scene.addLight(ambient);\n  \n  // Create a ground plane\n  ground = SAAAM.ThreeD.GameObject3D.createPlane("Ground", 20, 20);\n  ground.transform.setPosition(0, -2, 0);\n  ground.setMaterial(SAAAM.ThreeD.Material.basic([0.3, 0.5, 0.3]));\n  scene.addGameObject(ground);\n  \n  // Start the engine\n  engine3D.start();\n}\n\nfunction createSphere() {\n  const radius = 0.2 + Math.random() * 0.3;\n  const sphere = SAAAM.ThreeD.GameObject3D.createSphere("Sphere" + spheres.length, radius, 16);\n  \n  // Random position above the ground\n  const x = (Math.random() - 0.5) * 8;\n  const y = 5 + Math.random() * 5;\n  const z = (Math.random() - 0.5) * 8;\n  sphere.transform.setPosition(x, y, z);\n  \n  // Random color\n  const r = Math.random();\n  const g = Math.random();\n  const b = Math.random();\n  sphere.setMaterial(SAAAM.ThreeD.Material.phong([r, g, b], 0.3));\n  \n  // Add physics properties\n  sphere.velocity = new SAAAM.ThreeD.Vector3(0, 0, 0);\n  sphere.radius = radius;\n  sphere.mass = radius * 10;\n  sphere.restitution = 0.7 + Math.random() * 0.3; // Bounciness\n  \n  scene.addGameObject(sphere);\n  spheres.push(sphere);\n  \n  // Limit the number of spheres\n  if (spheres.length > 30) {\n    const removed = spheres.shift();\n    scene.removeGameObject(removed);\n  }\n}\n\nfunction step(deltaTime) {\n  // Spawn new spheres periodically\n  const currentTime = performance.now() / 1000;\n  if (currentTime - lastSpawnTime > 0.5) {\n    createSphere();\n    lastSpawnTime = currentTime;\n  }\n  \n  // Apply gravity and handle collisions\n  const gravity = new SAAAM.ThreeD.Vector3(0, -9.8, 0);\n  \n  for (const sphere of spheres) {\n    // Apply gravity\n    sphere.velocity = sphere.velocity.add(gravity.multiply(deltaTime));\n    \n    // Update position\n    const newPos = sphere.transform.position.add(sphere.velocity.multiply(deltaTime));\n    sphere.transform.setPosition(newPos.x, newPos.y, newPos.z);\n    \n    // Ground collision\n    if (newPos.y - sphere.radius < ground.transform.position.y) {\n      // Bounce\n      sphere.velocity.y = -sphere.velocity.y * sphere.restitution;\n      sphere.transform.setPosition(newPos.x, ground.transform.position.y + sphere.radius, newPos.z);\n    }\n    \n    // Add some damping\n    sphere.velocity = sphere.velocity.multiply(0.99);\n  }\n  \n  // Move camera with keyboard\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.left)) {\n    camera.transform.translate(-5 * deltaTime, 0, 0);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.right)) {\n    camera.transform.translate(5 * deltaTime, 0, 0);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.up)) {\n    camera.transform.translate(0, 0, -5 * deltaTime);\n  }\n  if (camera && SAAAM.keyboardCheck(SAAAM.vk.down)) {\n    camera.transform.translate(0, 0, 5 * deltaTime);\n  }\n}\n\nfunction draw(ctx) {\n  // Draw UI\n  SAAAM.drawText("3D Physics Demo - Use arrow keys to move camera", 20, 30, "white", "16px Arial");\n  SAAAM.drawText(`Spheres: ${spheres.length}`, 20, 60, "white", "14px Arial");\n}',
}

// Local storage key
const STORAGE_KEY_3D = "saaam-3d-sandbox-code"

export default function Saaam3DSandbox({
  initialCode = CODE_TEMPLATES_3D.rotatingCube,
  width = 800,
  height = 600,
}: Saaam3DSandboxProps) {
  const { updateFile, getActiveFile } = useStudio()

  // Try to load saved code from localStorage
  const getSavedCode = () => {
    if (typeof window === "undefined") return initialCode
    const savedCode = localStorage.getItem(STORAGE_KEY_3D)
    return savedCode || initialCode
  }

  const [code, setCode] = useState(getSavedCode)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("code")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fps, setFps] = useState(0)
  const [showFps, setShowFps] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [is3DLoaded, setIs3DLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const engine3DRef = useRef<any>(null)

  // Auto-save code to localStorage
  useEffect(() => {
    if (autoSaveEnabled) {
      localStorage.setItem(STORAGE_KEY_3D, code)
    }
  }, [code, autoSaveEnabled])

  // Initialize the 3D engine when the component mounts
  useEffect(() => {
    const init3D = async () => {
      if (!canvasRef.current) return

      try {
        // Load the 3D engine
        const success = await load3DEngine()
        if (success) {
          setIs3DLoaded(true)
          console.log("3D engine loaded successfully")
        } else {
          console.error("Failed to load 3D engine")
        }
      } catch (error) {
        console.error("Error loading 3D engine:", error)
      }
    }

    init3D()

    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
      }

      // Stop the 3D engine if it's running
      if (engine3DRef.current) {
        engine3DRef.current.stop()
      }
    }
  }, [])

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if Ctrl/Cmd is pressed
      if (!(e.ctrlKey || e.metaKey)) return

      switch (e.key) {
        case "Enter": // Ctrl+Enter to run code
          e.preventDefault()
          if (isRunning) {
            stopCode()
          } else {
            runCode()
          }
          break
        case "s": // Ctrl+S to save
          e.preventDefault()
          saveToActiveFile()
          break
        case "b": // Ctrl+B to toggle debug mode
          e.preventDefault()
          toggleDebugMode()
          break
        case "p": // Ctrl+P to toggle pause
          e.preventDefault()
          if (isRunning) {
            togglePause()
          }
          break
        case "f": // Ctrl+F to toggle fullscreen
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isRunning])

  // FPS counter
  useEffect(() => {
    if (showFps && isRunning && !isPaused && engine3DRef.current) {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
      }

      fpsIntervalRef.current = setInterval(() => {
        const stats = engine3DRef.current.getStats()
        setFps(stats.fps)
      }, 500)
    } else {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
        fpsIntervalRef.current = null
      }
    }

    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
      }
    }
  }, [showFps, isRunning, isPaused])

  // Run the code
  const runCode = () => {
    if (!canvasRef.current || !is3DLoaded) {
      setErrors(["3D engine not loaded yet. Please wait and try again."])
      return
    }

    // Clear previous logs and errors
    setLogs([])
    setErrors([])

    try {
      // Create a sandbox environment
      const sandbox = {
        document: {
          getElementById: (id: string) => {
            if (id === "gameCanvas") return canvasRef.current
            return null
          },
        },
        console: {
          log: (...args: any[]) => {
            const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
            setLogs((prev) => [...prev, message])
          },
          error: (...args: any[]) => {
            const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
            setErrors((prev) => [...prev, message])
          },
          warn: (...args: any[]) => {
            const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
            setLogs((prev) => [...prev, `[WARN] ${message}`])
          },
        },
        performance: window.performance,
        SAAAM: window.SAAAM,
        setTimeout: window.setTimeout,
        clearTimeout: window.clearTimeout,
        setInterval: window.setInterval,
        clearInterval: window.clearInterval,
        requestAnimationFrame: window.requestAnimationFrame,
        cancelAnimationFrame: window.cancelAnimationFrame,
      }

      // Execute the code
      const executeFunction = new Function(...Object.keys(sandbox), code)
      executeFunction(...Object.values(sandbox))

      // Store the 3D engine reference
      engine3DRef.current = get3DEngine("main")

      setIsRunning(true)
      setIsPaused(false)
    } catch (error) {
      setErrors([`Error executing code: ${error}`])
      setIsRunning(false)
      setIsPaused(false)
    }
  }

  // Stop the code
  const stopCode = () => {
    if (engine3DRef.current) {
      engine3DRef.current.stop()
      engine3DRef.current = null
    }

    setIsRunning(false)
    setIsPaused(false)
  }

  // Toggle pause
  const togglePause = () => {
    if (!engine3DRef.current || !isRunning) return

    if (isPaused) {
      engine3DRef.current.start()
    } else {
      engine3DRef.current.stop()
    }

    setIsPaused(!isPaused)
  }

  // Toggle debug mode
  const toggleDebugMode = () => {
    const newDebugMode = !debugMode
    setDebugMode(newDebugMode)

    if (engine3DRef.current) {
      // Set debug mode in the 3D engine if it has such a method
      if (engine3DRef.current.setDebugMode) {
        engine3DRef.current.setDebugMode(newDebugMode)
      }
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Toggle FPS counter
  const toggleFpsCounter = () => {
    setShowFps(!showFps)
  }

  // Save code to active file
  const saveToActiveFile = () => {
    const activeFile = getActiveFile()
    if (activeFile) {
      updateFile(activeFile.id, code)
    }
  }

  // Download code as a file
  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "saaam-3d-game.saaam"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Upload code from a file
  const uploadCode = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".saaam,.js,.txt"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCode(content)
      }
      reader.readAsText(file)
    }

    input.click()
  }

  // Clear the code
  const clearCode = () => {
    if (confirm("Are you sure you want to clear the code?")) {
      setCode("")
    }
  }

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        console.log("Code copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err)
      })
  }

  // Load a template
  const loadTemplate = (templateKey: keyof typeof CODE_TEMPLATES_3D) => {
    if (code.trim() !== "" && !confirm("This will replace your current code. Continue?")) {
      return
    }

    setCode(CODE_TEMPLATES_3D[templateKey])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center">
          <Cube className="h-5 w-5 mr-2 text-purple-400" />
          <h2 className="text-lg font-bold text-purple-400">SAAAM 3D Sandbox</h2>
          {showFps && isRunning && (
            <Badge variant="outline" className="ml-4 bg-purple-900/30">
              <Gauge className="h-3 w-3 mr-1" /> {fps.toFixed(1)} FPS
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  size="sm"
                  onClick={isRunning ? stopCode : runCode}
                  className="h-8 px-3"
                >
                  {isRunning ? "Stop" : "Run"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRunning ? "Stop execution (Ctrl+Enter)" : "Run code (Ctrl+Enter)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isRunning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={togglePause} className="h-8 w-8 p-0">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPaused ? "Resume (Ctrl+P)" : "Pause (Ctrl+P)"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDebugMode}
                  className={`h-8 w-8 p-0 ${debugMode ? "bg-purple-900/30" : ""}`}
                >
                  <Bug className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle debug mode (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <BookOpen className="h-4 w-4 mr-1" /> Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>3D Code Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => loadTemplate("empty")}>Empty 3D Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate("rotatingCube")}>Rotating Cube</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate("physics3D")}>Physics Demo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${isFullscreen ? "hidden" : "w-1/2"} border-r border-gray-700 flex flex-col`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-2 mt-2">
              <TabsTrigger value="code" className="flex-1">
                <Code className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm text-gray-400">SAAAM 3D Script</span>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={saveToActiveFile} className="h-7 w-7 p-0">
                          <Save className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save to active file (Ctrl+S)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={downloadCode} className="h-7 w-7 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={uploadCode} className="h-7 w-7 p-0">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={copyCode} className="h-7 w-7 p-0">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={clearCode} className="h-7 w-7 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                          className={`h-7 w-7 p-0 ${!autoSaveEnabled ? "bg-red-900/30" : ""}`}
                        >
                          {autoSaveEnabled ? <Save className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
              />
            </TabsContent>

            <TabsContent value="logs" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm text-gray-400">Console Output</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogs([])
                    setErrors([])
                  }}
                  className="h-7 w-7 p-0"
                  title="Clear logs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-2 overflow-auto bg-black">
                {errors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-red-500 font-bold mb-1">Errors:</h3>
                    {errors.map((error, index) => (
                      <div key={`error-${index}`} className="text-red-400 font-mono text-sm mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                {logs.map((log, index) => (
                  <div key={`log-${index}`} className="text-green-400 font-mono text-sm mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div ref={fullscreenContainerRef} className={`${isFullscreen ? "w-full" : "w-1/2"} flex flex-col`}>
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <span className="text-sm text-gray-400">3D Preview</span>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={runCode} className="h-7 w-7 p-0">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restart game</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDebugMode}
                      className={`h-7 w-7 p-0 ${debugMode ? "bg-purple-900/30" : ""}`}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle debug visualization</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFpsCounter}
                      className={`h-7 w-7 p-0 ${showFps ? "bg-purple-900/30" : ""}`}
                    >
                      <Cpu className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle FPS counter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-7 w-7 p-0">
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFullscreen ? "Exit fullscreen (Ctrl+F)" : "Fullscreen mode (Ctrl+F)"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-950 overflow-auto p-4">
            <Card className={`shadow-xl ${isFullscreen ? "scale-100" : ""}`}>
              <canvas id="gameCanvas" ref={canvasRef} width={width} height={height} className="bg-black" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
