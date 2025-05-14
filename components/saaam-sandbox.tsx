"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaaamRuntime } from "@/lib/saaam-runtime"
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

interface SaaamSandboxProps {
  initialCode?: string
  width?: number
  height?: number
}

// Code templates
const CODE_TEMPLATES = {
  empty:
    '// SAAAM Game Code\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nfunction create() {\n  console.log("Game created!");\n}\n\nfunction step(deltaTime) {\n  // Game logic here\n}\n\nfunction draw(ctx) {\n  // Clear the screen\n  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");\n}',
  playerMovement:
    '// SAAAM Game Code\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet player = {\n  x: 400,\n  y: 300,\n  width: 40,\n  height: 40,\n  speed: 200,\n  color: "#4488FF"\n};\n\nfunction create() {\n  console.log("Game created!");\n}\n\nfunction step(deltaTime) {\n  // Handle player input\n  if (SAAAM.keyboardCheck(SAAAM.vk.left)) {\n    player.x -= player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.right)) {\n    player.x += player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.up)) {\n    player.y -= player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.down)) {\n    player.y += player.speed * deltaTime;\n  }\n  \n  // Keep player within screen bounds\n  if (player.x < 0) player.x = 0;\n  if (player.x + player.width > 800) player.x = 800 - player.width;\n  if (player.y < 0) player.y = 0;\n  if (player.y + player.height > 600) player.y = 600 - player.height;\n}\n\nfunction draw(ctx) {\n  // Clear the screen\n  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");\n  \n  // Draw the player\n  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);\n}',
  particles:
    '// SAAAM Particle System\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet particles = [];\nconst MAX_PARTICLES = 100;\n\nfunction create() {\n  console.log("Particle system initialized");\n}\n\nfunction step(deltaTime) {\n  // Create new particles on mouse click\n  if (SAAAM.mousePressed()) {\n    const mouseX = SAAAM.mouseX();\n    const mouseY = SAAAM.mouseY();\n    \n    for (let i = 0; i < 10; i++) {\n      if (particles.length < MAX_PARTICLES) {\n        particles.push({\n          x: mouseX,\n          y: mouseY,\n          vx: (Math.random() - 0.5) * 200,\n          vy: (Math.random() - 0.5) * 200,\n          size: Math.random() * 10 + 5,\n          color: `hsl(${Math.random() * 360}, 100%, 50%)`,\n          life: 2.0\n        });\n      }\n    }\n  }\n  \n  // Update particles\n  for (let i = particles.length - 1; i >= 0; i--) {\n    const p = particles[i];\n    \n    p.x += p.vx * deltaTime;\n    p.y += p.vy * deltaTime;\n    p.life -= deltaTime;\n    \n    // Remove dead particles\n    if (p.life <= 0) {\n      particles.splice(i, 1);\n    }\n  }\n}\n\nfunction draw(ctx) {\n  // Clear the screen\n  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");\n  \n  // Draw particles\n  for (const p of particles) {\n    const alpha = Math.min(1, p.life);\n    SAAAM.drawCircle(p.x, p.y, p.size, p.color, alpha);\n  }\n  \n  // Draw instructions\n  SAAAM.drawText("Click to create particles", 20, 30, "white", "20px Arial");\n  SAAAM.drawText(`Particles: ${particles.length}/${MAX_PARTICLES}`, 20, 60, "white", "16px Arial");\n}',
}

// Local storage key
const STORAGE_KEY = "saaam-sandbox-code"

export default function SaaamSandbox({
  initialCode = '// SAAAM Game Code\n\nSAAAM.registerCreate(create);\nSAAAM.registerStep(step);\nSAAAM.registerDraw(draw);\n\nlet player = {\n  x: 400,\n  y: 300,\n  width: 40,\n  height: 40,\n  speed: 200,\n  color: "#4488FF"\n};\n\nfunction create() {\n  console.log("Game created!");\n}\n\nfunction step(deltaTime) {\n  // Handle player input\n  if (SAAAM.keyboardCheck(SAAAM.vk.left)) {\n    player.x -= player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.right)) {\n    player.x += player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.up)) {\n    player.y -= player.speed * deltaTime;\n  }\n  if (SAAAM.keyboardCheck(SAAAM.vk.down)) {\n    player.y += player.speed * deltaTime;\n  }\n  \n  // Keep player within screen bounds\n  if (player.x < 0) player.x = 0;\n  if (player.x + player.width > 800) player.x = 800 - player.width;\n  if (player.y < 0) player.y = 0;\n  if (player.y + player.height > 600) player.y = 600 - player.height;\n}\n\nfunction draw(ctx) {\n  // Clear the screen\n  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");\n  \n  // Draw the player\n  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);\n}',
  width = 800,
  height = 600,
}: SaaamSandboxProps) {
  const { updateFile, getActiveFile } = useStudio()

  // Try to load saved code from localStorage
  const getSavedCode = () => {
    if (typeof window === "undefined") return initialCode
    const savedCode = localStorage.getItem(STORAGE_KEY)
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

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runtimeRef = useRef<SaaamRuntime | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save code to localStorage
  useEffect(() => {
    if (autoSaveEnabled) {
      localStorage.setItem(STORAGE_KEY, code)
    }
  }, [code, autoSaveEnabled])

  // Initialize the runtime when the component mounts
  useEffect(() => {
    if (!canvasRef.current) return

    const runtime = new SaaamRuntime()
      .initialize(canvasRef.current)
      .onError((error) => {
        setErrors((prev) => [...prev, error])
      })
      .onLog((log) => {
        setLogs((prev) => [...prev, log])
      })

    runtimeRef.current = runtime

    return () => {
      if (runtimeRef.current) {
        runtimeRef.current.stop()
      }
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
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
    if (showFps && isRunning && !isPaused) {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
      }

      fpsIntervalRef.current = setInterval(() => {
        if (runtimeRef.current) {
          setFps(runtimeRef.current.getFps())
        }
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
    if (!runtimeRef.current) return

    // Clear previous logs and errors
    setLogs([])
    setErrors([])
    runtimeRef.current.clearLogsAndErrors()

    // Execute the code
    const success = runtimeRef.current.executeCode(code)

    if (success) {
      runtimeRef.current.start()
      setIsRunning(true)
      setIsPaused(false)
    } else {
      setIsRunning(false)
      setIsPaused(false)
    }
  }

  // Stop the code
  const stopCode = () => {
    if (!runtimeRef.current) return

    runtimeRef.current.stop()
    setIsRunning(false)
    setIsPaused(false)
  }

  // Toggle pause
  const togglePause = () => {
    if (!runtimeRef.current || !isRunning) return

    runtimeRef.current.togglePause()
    setIsPaused(!isPaused)
  }

  // Toggle debug mode
  const toggleDebugMode = () => {
    if (!runtimeRef.current) return

    const newDebugMode = !debugMode
    setDebugMode(newDebugMode)

    if (runtimeRef.current) {
      runtimeRef.current.sandboxEnv.SAAAM.setDebugMode(newDebugMode)
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
    a.download = "saaam-game.saaam"
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

        // Add a small delay to ensure the code state is updated before running
        setTimeout(() => {
          // Stop any currently running code first
          if (isRunning && runtimeRef.current) {
            runtimeRef.current.stop()
          }

          // Run the newly loaded code
          if (runtimeRef.current) {
            setLogs([])
            setErrors([])
            runtimeRef.current.clearLogsAndErrors()
            const success = runtimeRef.current.executeCode(content)
            if (success) {
              runtimeRef.current.start()
              setIsRunning(true)
              setIsPaused(false)
            }
          }
        }, 100)
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
        // Could add a toast notification here
        console.log("Code copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err)
      })
  }

  // Load a template
  const loadTemplate = (templateKey: keyof typeof CODE_TEMPLATES) => {
    if (code.trim() !== "" && !confirm("This will replace your current code. Continue?")) {
      return
    }

    setCode(CODE_TEMPLATES[templateKey])

    // Run the template code automatically
    setTimeout(() => {
      if (isRunning && runtimeRef.current) {
        runtimeRef.current.stop()
      }

      if (runtimeRef.current) {
        setLogs([])
        setErrors([])
        runtimeRef.current.clearLogsAndErrors()
        const success = runtimeRef.current.executeCode(CODE_TEMPLATES[templateKey])
        if (success) {
          runtimeRef.current.start()
          setIsRunning(true)
          setIsPaused(false)
        }
      }
    }, 100)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2 text-yellow-400" />
          <h2 className="text-lg font-bold text-yellow-400">SAAAM Sandbox</h2>
          {showFps && isRunning && (
            <Badge variant="outline" className="ml-4 bg-blue-900/30">
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
                  className={`h-8 w-8 p-0 ${debugMode ? "bg-blue-900/30" : ""}`}
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
              <DropdownMenuLabel>Code Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => loadTemplate("empty")}>Empty Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate("playerMovement")}>Player Movement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate("particles")}>Particle System</DropdownMenuItem>
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
                <span className="text-sm text-gray-400">SAAAM Script</span>
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
                    if (runtimeRef.current) {
                      runtimeRef.current.clearLogsAndErrors()
                    }
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
            <span className="text-sm text-gray-400">Game Preview</span>
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
                      className={`h-7 w-7 p-0 ${debugMode ? "bg-blue-900/30" : ""}`}
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
                      className={`h-7 w-7 p-0 ${showFps ? "bg-blue-900/30" : ""}`}
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
              <canvas ref={canvasRef} width={width} height={height} className="bg-black" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

