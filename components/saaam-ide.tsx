"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Square,
  Bug,
  BarChart,
  RefreshCw,
  Sun,
  Moon,
  Users,
  Menu,
  X,
  Code,
  BotIcon as Robot,
  Brain,
  Network,
} from "lucide-react"
import { SaaamCompiler } from "@/lib/saaam-compiler"
import { SaaamInterpreter } from "@/lib/saaam-interpreter"
import { sampleSaaamCode } from "@/lib/sample-code"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import CopilotPanel from "./copilot-panel"
import AssetManager from "./asset-manager"
// import { getSaaamSystemStatus } from "@/lib/saaam-system-initializer"
// import { dragAndDropIntegration } from "@/lib/drag-and-drop-integration"
// import { aiSystem } from "@/lib/ai-system"

// Replace with local implementations:
const getSaaamSystemStatus = () => ({
  initialized: true,
  systems: {
    integrationManager: true,
    neurosphere: true,
    physics: true,
    world: true,
    linter: true,
    intellisense: true,
    neuralEngine: true,
    sceneGraph: true,
  },
})

// Main IDE component
const EnhancedSaaamIDE = ({ initialCode, isMobile }: { initialCode?: string; isMobile?: boolean }) => {
  const [code, setCode] = useState(initialCode || sampleSaaamCode)
  const [activeTab, setActiveTab] = useState("editor")
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: string; message: string }>>([])
  const [visualMode, setVisualMode] = useState("game")
  const [showCoroutineVisualizer, setShowCoroutineVisualizer] = useState(false)
  const [systemStatus, setSystemStatus] = useState(getSaaamSystemStatus())

  // AI System state
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiEnabled, setAiEnabled] = useState(true)

  // New state for enhanced features
  const [debugMode, setDebugMode] = useState(false)
  const [breakpoints, setBreakpoints] = useState<number[]>([])
  const [currentBreakpoint, setCurrentBreakpoint] = useState<number | null>(null)
  const [executionSpeed, setExecutionSpeed] = useState(1.0) // 1.0 = normal speed
  const [profilerData, setProfilerData] = useState<any>(null)
  const [showProfiler, setShowProfiler] = useState(false)
  const [aiSuggestionActive, setAiSuggestionActive] = useState(false)
  const [coroutineState, setCoroutineState] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [variableInspector, setVariableInspector] = useState<any[]>([])
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)
  const [theme, setTheme] = useState("dark")
  const [files, setFiles] = useState([
    {
      name: "main.saaam",
      content: initialCode || sampleSaaamCode,
    },
    {
      name: "player.saaam",
      content: "// Player controller code",
    },
    {
      name: "enemy.saaam",
      content: "// Enemy AI code",
    },
    {
      name: "physics.saaam",
      content: "// Physics engine code",
    },
  ])
  const [currentFile, setCurrentFile] = useState("main.saaam")
  const [tabs, setTabs] = useState([{ name: "main.saaam", active: true }])
  const [multiplayerOpen, setMultiplayerOpen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [minimap, setMinimap] = useState("always")
  const [users, setUsers] = useState<any[]>([])
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile)
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile)
  const [systemsConnected, setSystemsConnected] = useState(false)

  // Asset manager state
  const [showAssetManager, setShowAssetManager] = useState(false)
  const [currentAssetType, setCurrentAssetType] = useState<"sprite" | "sound" | "room">("sprite")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const compilerRef = useRef<SaaamCompiler | null>(null)
  const interpreterRef = useRef<SaaamInterpreter | null>(null)

  // Check for SAAAM systems
  useEffect(() => {
    const checkSystems = () => {
      const status = getSaaamSystemStatus()
      setSystemStatus(status)
      setSystemsConnected(status.initialized)

      if (status.initialized && !systemsConnected) {
        addMessage("All SAAAM systems connected and ready", "success")
      }
    }

    // Check immediately
    checkSystems()

    // Then check periodically
    const interval = setInterval(checkSystems, 2000)

    // Listen for system initialization events
    const handleSystemsInitialized = () => {
      checkSystems()
    }

    window.addEventListener("saaam-systems-initialized", handleSystemsInitialized)

    return () => {
      clearInterval(interval)
      window.removeEventListener("saaam-systems-initialized", handleSystemsInitialized)
    }
  }, [systemsConnected])

  // Initialize systems
  useEffect(() => {
    // Initialize drag and drop system
    // if (typeof window !== "undefined") {
    //   dragAndDropIntegration.initialize({
    //     addFile: (name, content, type) => {
    //       setFiles((prev) => [...prev, { name, content }])
    //       addMessage(`File ${name} added via drag and drop`, "success")
    //     },
    //     insertCodeAtCursor: (codeToInsert) => {
    //       if (editorRef.current) {
    //         const textarea = editorRef.current
    //         const start = textarea.selectionStart
    //         const end = textarea.selectionEnd
    //         const newCode = code.substring(0, start) + codeToInsert + code.substring(end)
    //         setCode(newCode)
    //         updateFileContent(newCode)
    //       }
    //     },
    //     updateFileContent: (content) => {
    //       setCode(content)
    //       updateFileContent(content)
    //     },
    //   })
    //   // Setup drag and drop for editor
    //   if (editorRef.current) {
    //     window.SAAAM?.dragDrop?.setupCodeEditorDropZone(editorRef.current)
    //   }
    // }
    // return () => {
    //   // Cleanup on unmount
    //   dragAndDropIntegration.destroy()
    // }
  }, [])

  // Initialize compiler and interpreter
  useEffect(() => {
    compilerRef.current = new SaaamCompiler()

    if (typeof window !== "undefined") {
      // Create a global SAAAM object for the interpreter to use
      ;(window as any).SAAAM = {
        ...(window.SAAAM || {}),
        keyboardCheck: (keyCode: number) => interpreterRef.current?.keyboardCheck(keyCode) || false,
        keyboardCheckPressed: (keyCode: number) => interpreterRef.current?.keyboardCheckPressed(keyCode) || false,
        drawSprite: (spriteIndex: number, imageIndex: number, x: number, y: number) =>
          interpreterRef.current?.drawSprite(spriteIndex, imageIndex, x, y),
        drawRectangle: (x: number, y: number, width: number, height: number, color: string) =>
          interpreterRef.current?.drawRectangle(x, y, width, height, color),
        drawCircle: (x: number, y: number, radius: number, color: string) =>
          interpreterRef.current?.drawCircle(x, y, radius, color),
        drawLine: (x1: number, y1: number, x2: number, y2: number, color: string) =>
          interpreterRef.current?.drawLine(x1, y1, x2, y2, color),
        drawText: (text: string, x: number, y: number, color: string) =>
          interpreterRef.current?.drawText(text, x, y, color),
        registerCreate: (func: Function) => interpreterRef.current?.registerCreate(func),
        registerStep: (func: Function) => interpreterRef.current?.registerStep(func),
        registerDraw: (func: Function) => interpreterRef.current?.registerDraw(func),
        vk: {
          left: 37,
          up: 38,
          right: 39,
          down: 40,
          space: 32,
          a: 65,
          s: 83,
          d: 68,
          w: 87,
        },
        // Add drag and drop functions
        dragDrop: window.SAAAM?.dragDrop || {},
      }

      interpreterRef.current = new SaaamInterpreter((window as any).SAAAM)
      interpreterRef.current.initialize()
      interpreterRef.current.compiler = compilerRef.current
    }

    return () => {
      if (interpreterRef.current) {
        interpreterRef.current.stopGame()
      }
    }
  }, [])

  // AI Analysis effect
  useEffect(() => {
    if (aiEnabled && code) {
      const analyzeCodeWithAI = async () => {
        try {
          // Use the linter from SAAAM systems if available
          if (window.SAAAM?.lintCode) {
            const lintResults = window.SAAAM.lintCode(code, currentFile)

            // Format results for display
            const analysis = {
              issues: lintResults,
              suggestions: lintResults
                .filter((issue) => issue.severity === "info")
                .map((issue) => ({
                  type: "suggestion",
                  message: issue.message,
                  line: issue.line,
                  confidence: 0.8,
                })),
              confidence: lintResults.length > 0 ? 0.7 : 0.9,
              metrics: {
                complexity: lintResults.filter((i) => i.type === "function-complexity").length > 0 ? "high" : "medium",
                maintainabilityIndex: 75,
                performance: 80,
              },
            }

            setAiAnalysis(analysis)
            setAiSuggestions(analysis.suggestions)
          } else {
            // Fallback to AI system
            // const analysis = await aiSystem.analyzeCode(code, currentFile)
            // setAiAnalysis(analysis)
            // setAiSuggestions(analysis.suggestions || [])
          }

          // Emit code change event for AI system
          document.dispatchEvent(
            new CustomEvent("saaam-code-changed", {
              detail: { code, file: currentFile },
            }),
          )
        } catch (error) {
          console.error("AI analysis failed:", error)
        }
      }

      const debounceTimer = setTimeout(analyzeCodeWithAI, 1000)
      return () => clearTimeout(debounceTimer)
    }
  }, [code, currentFile, aiEnabled])

  // Add this useEffect to update the code when initialCode changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)

      // Also update the file content in the files array
      setFiles(files.map((f) => (f.name === currentFile ? { ...f, content: initialCode } : f)))

      // Add a console message
      setConsoleOutput((prev) => [...prev, { type: "info", message: "> Example code loaded successfully" }])
    }
  }, [initialCode])

  // Add this useEffect after the existing useEffect that initializes the compiler and interpreter
  useEffect(() => {
    // This effect ensures the canvas is properly initialized when in game view
    if (activeTab === "game" && canvasRef.current) {
      // Make sure canvas dimensions are set correctly
      if (canvasRef.current.width === 0 || canvasRef.current.height === 0) {
        canvasRef.current.width = 800
        canvasRef.current.height = 600
      }

      // If we're already running, make sure the game is properly started
      if (running && interpreterRef.current && !interpreterRef.current.isGameRunning()) {
        interpreterRef.current.startGame(canvasRef.current)
      }
    }
  }, [activeTab, running])

  // Update sidebar visibility based on mobile state
  useEffect(() => {
    if (isMobile) {
      setShowLeftSidebar(false)
      setShowRightSidebar(false)
    } else {
      setShowLeftSidebar(true)
      setShowRightSidebar(true)
    }
  }, [isMobile])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLeftSidebar = () => {
    setShowLeftSidebar(!showLeftSidebar)
  }

  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar)
  }

  const openFile = (fileName) => {
    setCurrentFile(fileName)
    setTabs(
      tabs.map((tab) => ({
        ...tab,
        active: tab.name === fileName,
      })),
    )

    // Update code with the content of the selected file
    const file = files.find((f) => f.name === fileName)
    if (file) {
      setCode(file.content)
    }
  }

  const updateFileContent = (content) => {
    setCode(content)
    setFiles(files.map((f) => (f.name === currentFile ? { ...f, content } : f)))
  }

  const toggleMultiplayer = () => {
    setMultiplayerOpen(!multiplayerOpen)
  }

  // Function to open asset manager
  const openAssetManager = (assetType: "sprite" | "sound" | "room") => {
    setCurrentAssetType(assetType)
    setShowAssetManager(true)
  }

  // Function to close asset manager
  const closeAssetManager = () => {
    setShowAssetManager(false)
    // Force the active tab to be "editor" when closing
    setActiveTab("editor")
  }

  // Function to handle running code
  // Modify the runCode function to ensure the canvas is available
  const runCode = () => {
    if (!compilerRef.current || !interpreterRef.current) {
      addMessage("Engine not initialized", "error")
      return
    }

    // First switch to game view to ensure canvas is rendered
    setActiveTab("game")

    // Use setTimeout to ensure the canvas is rendered before accessing it
    setTimeout(() => {
      if (!canvasRef.current) {
        addMessage("Canvas not available. Please try again.", "error")
        return
      }

      setRunning(true)
      setOutput("")
      setConsoleOutput([{ type: "info", message: "> Running SAAAM code..." }])
      setExecutionTime(0)

      // Start tracking execution time
      const executionTimer = setInterval(() => {
        setExecutionTime((prevTime) => prevTime + 0.1)
      }, 100)

      // Simulate memory usage
      const memoryInterval = setInterval(() => {
        setMemoryUsage(Math.floor(Math.random() * 50) + 150) // Random between 150-200 MB
      }, 1000)

      try {
        // Compile the code
        const compiler = compilerRef.current
        const interpreter = interpreterRef.current

        // Load and compile the script
        const scriptId = "main_script"
        const success = interpreter.loadScript(code, scriptId)

        if (!success) {
          throw new Error("Failed to compile script")
        }

        addMessage("> Code compiled successfully!", "success")

        // Execute the script
        const executed = interpreter.executeScript(scriptId)

        if (!executed) {
          throw new Error("Failed to execute script")
        }

        addMessage("> Script executed successfully", "success")

        // Start the game
        if (canvasRef.current) {
          interpreter.startGame(canvasRef.current)
          addMessage("> Game started", "success")

          // Create variable inspector data
          setVariableInspector([
            { name: "player_health", value: 100, type: "number", scope: "global" },
            { name: "GRAVITY", value: 0.5, type: "number", scope: "global", isConstant: true },
            { name: "position", value: { x: 100, y: 100 }, type: "vec2", scope: "this" },
            { name: "speed", value: 5, type: "number", scope: "this" },
            { name: "frame", value: 0, type: "number", scope: "this" },
            { name: "frame_count", value: 4, type: "number", scope: "this" },
            { name: "animation_speed", value: 0.1, type: "number", scope: "this" },
          ])

          // Simulate profiler data collection
          setTimeout(() => {
            generateProfilerData()
          }, 3000)
        } else {
          throw new Error("Canvas not available")
        }
      } catch (error) {
        console.error("Error running code:", error)
        setConsoleOutput((prev) => [
          ...prev,
          { type: "error", message: `> Error: ${error instanceof Error ? error.message : String(error)}` },
        ])
        setRunning(false)
        clearInterval(executionTimer)
        clearInterval(memoryInterval)
      }
    }, 100) // Short delay to ensure canvas is rendered
  }

  // Stop the running code
  const stopCode = () => {
    if (interpreterRef.current) {
      interpreterRef.current.stopGame()
    }

    setRunning(false)
    setConsoleOutput((prev) => [...prev, { type: "info", message: "> Execution stopped by user" }])
  }

  // Function to generate profiler data
  const generateProfilerData = () => {
    setProfilerData({
      functions: [
        { name: "step", executionTime: 0.4, calls: 60, percentage: 32 },
        { name: "draw", executionTime: 0.3, calls: 60, percentage: 24 },
        { name: "patrol_area", executionTime: 0.2, calls: 6, percentage: 16 },
        { name: "wait", executionTime: 0.15, calls: 2, percentage: 12 },
        { name: "create", executionTime: 0.1, calls: 1, percentage: 8 },
        { name: "Others", executionTime: 0.1, calls: 20, percentage: 8 },
      ],
      memory: [
        { category: "Game Objects", bytes: 54000, percentage: 32 },
        { category: "Textures", bytes: 48000, percentage: 28 },
        { category: "Audio", bytes: 34000, percentage: 20 },
        { category: "Scripts", bytes: 17000, percentage: 10 },
        { category: "Others", bytes: 17000, percentage: 10 },
      ],
      frames: Array(60)
        .fill(0)
        .map(() => 16 + Math.random() * 4), // Frame times around 16-20ms
    })
  }

  // Add a message to the console
  const addMessage = (text: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setConsoleOutput((prev) => [...prev, { type, message: text }])
  }

  // AI suggestion handlers
  const handleAISuggestionAccept = (suggestion) => {
    // Apply the suggestion
    if (suggestion.code) {
      const newCode = code + "\n" + suggestion.code
      setCode(newCode)
      updateFileContent(newCode)
    }

    // Learn from user action
    document.dispatchEvent(
      new CustomEvent("saaam-user-action", {
        detail: {
          type: "suggestion-accepted",
          suggestion,
          context: { file: currentFile, code },
        },
      }),
    )

    addMessage(`Applied AI suggestion: ${suggestion.message}`, "success")
  }

  const handleAISuggestionReject = (suggestion) => {
    // Learn from user action
    document.dispatchEvent(
      new CustomEvent("saaam-user-action", {
        detail: {
          type: "suggestion-rejected",
          suggestion,
          context: { file: currentFile, code },
        },
      }),
    )

    // Remove suggestion from list
    setAiSuggestions((prev) => prev.filter((s) => s !== suggestion))
  }

  // Simple code validation
  const validateCode = (code: string) => {
    const errors: string[] = []
    const lines = code.split("\n")

    // Check for basic syntax errors (very simplified)
    lines.forEach((line, i) => {
      // Check for missing semicolons on statements
      if (
        line.trim() &&
        !line.trim().startsWith("//") &&
        !line.includes("{") &&
        !line.includes("}") &&
        !line.endsWith(";") &&
        !line.trim().endsWith(")")
      ) {
        errors.push(`Line ${i + 1}: Missing semicolon`)
      }

      // Check for mismatched parentheses
      const openCount = (line.match(/\(/g) || []).length
      const closeCount = (line.match(/\)/g) || []).length
      if (openCount !== closeCount) {
        errors.push(`Line ${i + 1}: Mismatched parentheses`)
      }
    })

    return errors
  }

  // Add a function to load example code
  const loadExampleCode = (code: string) => {
    setCode(code)
    setConsoleOutput([{ type: "info", message: "> Example code loaded successfully" }])
  }

  return (
    <div
      className={`flex flex-col w-full h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-300"}`}
      >
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={toggleLeftSidebar} className="mr-1">
              <Menu size={18} />
            </Button>
          )}
          <span className="font-bold text-lg md:text-xl text-yellow-400">SAAAM IDE</span>
          <span className="px-2 py-1 text-xs bg-gray-700 rounded hidden sm:inline-block">v1.0</span>
          {aiEnabled && aiAnalysis && (
            <span className="px-2 py-1 text-xs bg-purple-600 rounded">
              AI: {Math.round(aiAnalysis.confidence * 100)}%
            </span>
          )}

          {/* System status indicators */}
          <div className="flex items-center space-x-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-2 h-2 rounded-full ${systemStatus.systems.integrationManager ? "bg-green-500" : "bg-red-500"}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                Integration Manager: {systemStatus.systems.integrationManager ? "Connected" : "Disconnected"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-2 h-2 rounded-full ${systemStatus.systems.neurosphere ? "bg-green-500" : "bg-red-500"}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                Neurosphere: {systemStatus.systems.neurosphere ? "Connected" : "Disconnected"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-2 h-2 rounded-full ${systemStatus.systems.physics ? "bg-green-500" : "bg-red-500"}`}
                />
              </TooltipTrigger>
              <TooltipContent>Physics: {systemStatus.systems.physics ? "Connected" : "Disconnected"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex space-x-1 md:space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={running ? "destructive" : "default"}
                  size="sm"
                  onClick={running ? stopCode : runCode}
                  className="flex items-center"
                >
                  {running ? (
                    <>
                      <Square size={14} /> <span className="hidden sm:inline ml-1">Stop</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} /> <span className="hidden sm:inline ml-1">Run</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{running ? "Stop execution" : "Run code"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className={`flex items-center ${debugMode ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <Bug size={14} /> <span className="hidden sm:inline ml-1">Debug</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle debugging mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Add Examples button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.parent.postMessage({ type: "switchTab", tab: "examples" }, "*")}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                >
                  <Code size={14} /> <span className="hidden sm:inline ml-1">Examples</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Browse example games</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("copilot")}
                  className={`flex items-center ${activeTab === "copilot" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                >
                  <Robot size={14} /> <span className="hidden sm:inline ml-1">Copilot</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Coding Assistant</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Neural Engine button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.SAAAM?.neuralEngine) {
                      addMessage("Neural engine activated", "success")
                    } else {
                      addMessage("Neural engine not available", "error")
                    }
                  }}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Brain size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Neural Engine</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Neurosphere button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.SAAAM?.neurosphere) {
                      const state = window.SAAAM.neurosphere.getCurrentState()
                      addMessage(`Neurosphere consciousness: ${state.consciousness.toFixed(2)}`, "info")
                    } else {
                      addMessage("Neurosphere not available", "error")
                    }
                  }}
                  className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Network size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Neurosphere Status</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isMobile && currentBreakpoint !== null && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 rounded flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600"
              onClick={() => {}}
            >
              <RefreshCw size={14} /> <span>Step</span>
            </Button>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfiler(!showProfiler)}
                  className={`flex items-center ${showProfiler ? "bg-pink-700 text-white" : "bg-pink-600 hover:bg-pink-700 text-white"}`}
                >
                  <BarChart size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Performance profiler</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMultiplayer}
                    className={`flex items-center ${multiplayerOpen ? "bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  >
                    <Users size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Multiplayer tools</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isMobile && (
            <Button variant="ghost" size="sm" onClick={toggleRightSidebar} className="ml-1">
              <Menu size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left sidebar - Project files */}
        {showLeftSidebar && (
          <div
            className={`w-48 ${theme === "dark" ? "bg-gray-800 border-r border-gray-700" : "bg-gray-200 border-r border-gray-300"} overflow-y-auto ${isMobile ? "absolute z-10 h-full" : ""}`}
          >
            {isMobile && (
              <div className="flex justify-end p-2">
                <Button variant="ghost" size="sm" onClick={toggleLeftSidebar}>
                  <X size={18} />
                </Button>
              </div>
            )}
            <div className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              PROJECT FILES
            </div>
            <div className="px-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center p-1 rounded cursor-pointer ${
                    file.name === currentFile
                      ? theme === "dark"
                        ? "bg-blue-800 text-white"
                        : "bg-blue-100 text-blue-800"
                      : theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-300"
                  }`}
                  onClick={() => openFile(file.name)}
                  onMouseEnter={(e) => {
                    // Make file draggable when hovered
                    if (window.SAAAM?.dragDrop?.makeFileTreeItemDraggable) {
                      window.SAAAM.dragDrop.makeFileTreeItemDraggable(e.currentTarget, file)
                    }
                  }}
                >
                  <span className="text-sm">📄 {file.name}</span>
                </div>
              ))}
            </div>

            <div className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}>
              ASSETS
            </div>
            <div className="px-2">
              <div
                className={`flex items-center p-1 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} cursor-pointer`}
                onClick={() => openAssetManager("sprite")}
              >
                <span className="text-sm">🖼️ sprites/</span>
              </div>
              <div
                className={`flex items-center p-1 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} cursor-pointer`}
                onClick={() => openAssetManager("sound")}
              >
                <span className="text-sm">🔊 sounds/</span>
              </div>
              <div
                className={`flex items-center p-1 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} cursor-pointer`}
                onClick={() => openAssetManager("room")}
              >
                <span className="text-sm">🏞️ rooms/</span>
              </div>
            </div>

            {/* System status section */}
            <div className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}>
              SYSTEMS
            </div>
            <div className="px-2">
              {Object.entries(systemStatus.systems).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between p-1">
                  <span className="text-xs">{name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`}
                    title={status ? "Connected" : "Disconnected"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div
            className={`flex ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-gray-200 border-b border-gray-300"}`}
          >
            <button
              className={`px-3 md:px-4 py-2 text-sm font-medium ${activeTab === "editor" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("editor")}
            >
              Code Editor
            </button>
            <button
              className={`px-3 md:px-4 py-2 text-sm font-medium ${activeTab === "game" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("game")}
            >
              Game Preview
            </button>
            <button
              className={`px-3 md:px-4 py-2 text-sm font-medium ${activeTab === "copilot" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("copilot")}
            >
              Copilot
            </button>
            <button
              className={`px-3 md:px-4 py-2 text-sm font-medium ${activeTab === "neural" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("neural")}
            >
              Neural
            </button>
          </div>

          {/* Editor or Game view */}
          <div className="flex-1 overflow-hidden relative min-h-0">
            {showAssetManager ? (
              <div className="absolute inset-0 z-50 bg-gray-900 bg-opacity-90">
                <AssetManager
                  assetType={currentAssetType}
                  onClose={closeAssetManager}
                  theme={theme}
                  onSelectAsset={(asset) => {
                    // Handle asset selection - could insert code to use the asset
                    const assetCode = `// Using ${asset.name}
const ${asset.name.split(".")[0]} = SAAAM.load${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}("${asset.name}");
`
                    // Insert at cursor position or append to code
                    setCode(code + "\n" + assetCode)
                    closeAssetManager()
                    addMessage(`> Added code to use ${asset.name}`, "success")
                  }}
                />
              </div>
            ) : activeTab === "editor" ? (
              <div className={`h-full overflow-auto ${theme === "dark" ? "bg-gray-900" : "bg-white"} p-2 relative`}>
                <textarea
                  ref={editorRef}
                  className={`w-full h-full ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} font-mono text-xs leading-snug p-2 resize-none focus:outline-none`}
                  value={code}
                  onChange={(e) => updateFileContent(e.target.value)}
                  spellCheck="false"
                ></textarea>

                {/* AI Suggestions Overlay */}
                {aiEnabled && aiSuggestions.length > 0 && (
                  <div className="absolute top-4 right-4 w-80 bg-gray-800 border border-purple-500 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Robot className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">AI Suggestions</span>
                        </div>
                        <button onClick={() => setAiEnabled(false)} className="text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                      {aiSuggestions.slice(0, 5).map((suggestion, i) => (
                        <div key={i} className="p-3 bg-gray-700 rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    suggestion.type === "optimization"
                                      ? "bg-green-600"
                                      : suggestion.type === "refactor"
                                        ? "bg-blue-600"
                                        : suggestion.type === "bug"
                                          ? "bg-red-600"
                                          : "bg-purple-600"
                                  }`}
                                >
                                  {suggestion.type}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {Math.round((suggestion.confidence || 0.8) * 100)}%
                                </span>
                              </div>
                              <p className="text-sm">{suggestion.message}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <button
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                              onClick={() => handleAISuggestionAccept(suggestion)}
                            >
                              Apply
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                              onClick={() => handleAISuggestionReject(suggestion)}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === "game" ? (
              // Your existing game view code
              <div className="h-full flex flex-col bg-black items-center justify-center">
                {/* Keep all your existing game view code here */}
                {showProfiler ? (
                  <div className="w-full h-full p-4 bg-gray-900 overflow-auto">
                    <div className="text-white text-center text-lg font-bold mb-4">Performance Profiler</div>

                    {profilerData && (
                      <div className="space-y-6">
                        {/* Function performance breakdown */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-yellow-400 font-bold mb-2">Function Execution Time</h3>
                          <div className="h-6 bg-gray-700 rounded-full overflow-hidden mb-2">
                            {profilerData.functions.map((func, i) => (
                              <div
                                key={i}
                                className="h-full float-left"
                                style={{
                                  width: `${func.percentage}%`,
                                  backgroundColor: ["#4C9AFF", "#FF5630", "#36B37E", "#FFAB00", "#6554C0", "#8993A4"][
                                    i % 6
                                  ],
                                }}
                              ></div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {profilerData.functions.map((func, i) => (
                              <div key={i} className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor: ["#4C9AFF", "#FF5630", "#36B37E", "#FFAB00", "#6554C0", "#8993A4"][
                                      i % 6
                                    ],
                                  }}
                                ></div>
                                <div>
                                  <div className="text-white text-sm">{func.name}</div>
                                  <div className="text-gray-400 text-xs">
                                    {func.percentage}% ({func.executionTime.toFixed(1)}ms)
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Memory usage breakdown */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-yellow-400 font-bold mb-2">Memory Usage</h3>
                          <div className="h-6 bg-gray-700 rounded-full overflow-hidden mb-2">
                            {profilerData.memory.map((mem, i) => (
                              <div
                                key={i}
                                className="h-full float-left"
                                style={{
                                  width: `${mem.percentage}%`,
                                  backgroundColor: ["#36B37E", "#FFAB00", "#4C9AFF", "#6554C0", "#FF5630", "#8993A4"][
                                    i % 6
                                  ],
                                }}
                              ></div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {profilerData.memory.map((mem, i) => (
                              <div key={i} className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor: ["#36B37E", "#FFAB00", "#4C9AFF", "#6554C0", "#FF5630", "#8993A4"][
                                      i % 6
                                    ],
                                  }}
                                ></div>
                                <div>
                                  <div className="text-white text-sm">{mem.category}</div>
                                  <div className="text-gray-400 text-xs">
                                    {mem.percentage}% ({(mem.bytes / 1024).toFixed(1)}KB)
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Frame time graph */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-yellow-400 font-bold mb-2">Frame Time (Last 60 frames)</h3>
                          <div className="h-32 flex items-end space-x-1">
                            {profilerData.frames.map((frameTime, i) => (
                              <div
                                key={i}
                                className="bg-green-500 w-2"
                                style={{
                                  height: `${(frameTime / 25) * 100}%`,
                                  backgroundColor: frameTime > 20 ? "#FF5630" : frameTime > 18 ? "#FFAB00" : "#36B37E",
                                }}
                              ></div>
                            ))}
                          </div>
                          <div className="text-gray-400 text-xs mt-2">
                            Target: 16.67ms (60 FPS) | Current:{" "}
                            {profilerData.frames[profilerData.frames.length - 1].toFixed(1)}
                            ms
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="border border-gray-600 bg-black"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                    {!running && (
                      <div className="text-white text-center mt-4">
                        <p className="text-lg">Click "Run" to start your game</p>
                        <p className="text-sm text-gray-400">Your SAAAM code will be executed here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === "copilot" ? (
              <CopilotPanel
                code={code}
                onCodeChange={updateFileContent}
                currentFile={currentFile}
                files={files}
                onFileSelect={openFile}
                theme={theme}
                onMessage={addMessage}
              />
            ) : activeTab === "neural" ? (
              <div className="h-full p-4 bg-gray-900 text-white">
                <h2 className="text-xl font-bold mb-4">Neural Engine Interface</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Neurosphere Status</h3>
                    <div className="space-y-2">
                      <div>Consciousness Level: {systemStatus.systems.neurosphere ? "85%" : "Offline"}</div>
                      <div>Pattern Recognition: {systemStatus.systems.neurosphere ? "Active" : "Inactive"}</div>
                      <div>Learning Rate: {systemStatus.systems.neurosphere ? "0.001" : "N/A"}</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Neural Engine</h3>
                    <div className="space-y-2">
                      <div>Network Layers: {systemStatus.systems.neuralEngine ? "5" : "N/A"}</div>
                      <div>Training Epochs: {systemStatus.systems.neuralEngine ? "1000" : "N/A"}</div>
                      <div>Accuracy: {systemStatus.systems.neuralEngine ? "92.5%" : "N/A"}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    onClick={() => {
                      if (window.SAAAM?.neuralEngine) {
                        addMessage("Neural training initiated", "success")
                      } else {
                        addMessage("Neural engine not available", "error")
                      }
                    }}
                  >
                    Start Neural Training
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Console */}
          <div
            className={`h-32 ${theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-100 border-t border-gray-300"} overflow-y-auto p-2`}
          >
            <div className={`text-xs font-semibold mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              CONSOLE OUTPUT
            </div>
            <div className="space-y-1">
              {consoleOutput.map((output, index) => (
                <div
                  key={index}
                  className={`text-xs font-mono ${
                    output.type === "error"
                      ? "text-red-400"
                      : output.type === "success"
                        ? "text-green-400"
                        : output.type === "warning"
                          ? "text-yellow-400"
                          : theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-700"
                  }`}
                >
                  {output.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar - Debug info and tools */}
        {showRightSidebar && (
          <div
            className={`w-64 ${theme === "dark" ? "bg-gray-800 border-l border-gray-700" : "bg-gray-200 border-l border-gray-300"} overflow-y-auto ${isMobile ? "absolute right-0 z-10 h-full" : ""}`}
          >
            {isMobile && (
              <div className="flex justify-start p-2">
                <Button variant="ghost" size="sm" onClick={toggleRightSidebar}>
                  <X size={18} />
                </Button>
              </div>
            )}

            {/* Execution stats */}
            <div className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              EXECUTION STATS
            </div>
            <div className="px-2 space-y-1">
              <div className="text-xs">
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Runtime:</span>{" "}
                <span className="text-green-400">{executionTime.toFixed(1)}s</span>
              </div>
              <div className="text-xs">
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Memory:</span>{" "}
                <span className="text-blue-400">{memoryUsage}MB</span>
              </div>
              <div className="text-xs">
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>FPS:</span>{" "}
                <span className="text-yellow-400">{running ? "60" : "0"}</span>
              </div>
            </div>

            {/* Variable inspector */}
            {debugMode && variableInspector.length > 0 && (
              <>
                <div
                  className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}
                >
                  VARIABLES
                </div>
                <div className="px-2 space-y-1">
                  {variableInspector.map((variable, index) => (
                    <div
                      key={index}
                      className={`text-xs p-1 rounded cursor-pointer ${
                        selectedVariable === variable.name
                          ? theme === "dark"
                            ? "bg-blue-800"
                            : "bg-blue-100"
                          : theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-300"
                      }`}
                      onClick={() => setSelectedVariable(variable.name)}
                    >
                      <div className="flex justify-between">
                        <span className={variable.isConstant ? "text-purple-400" : "text-white"}>{variable.name}</span>
                        <span className="text-gray-400">{variable.scope}</span>
                      </div>
                      <div className="text-gray-400">
                        {typeof variable.value === "object" ? JSON.stringify(variable.value) : variable.value}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AI Analysis */}
            {aiEnabled && aiAnalysis && (
              <>
                <div
                  className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}
                >
                  AI ANALYSIS
                </div>
                <div className="px-2 space-y-2">
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Confidence:</span>{" "}
                    <span className="text-purple-400">{Math.round(aiAnalysis.confidence * 100)}%</span>
                  </div>
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Complexity:</span>{" "}
                    <span
                      className={
                        aiAnalysis.metrics?.complexity === "high"
                          ? "text-red-400"
                          : aiAnalysis.metrics?.complexity === "medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                    >
                      {aiAnalysis.metrics?.complexity || "low"}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Performance:</span>{" "}
                    <span className="text-blue-400">{aiAnalysis.metrics?.performance || 85}%</span>
                  </div>
                  {aiAnalysis.issues && aiAnalysis.issues.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-red-400 font-semibold">Issues:</div>
                      {aiAnalysis.issues.slice(0, 3).map((issue, i) => (
                        <div key={i} className="text-xs text-red-300 mt-1">
                          • {issue.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Multiplayer panel */}
            {multiplayerOpen && (
              <>
                <div
                  className={`p-2 font-semibold text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}
                >
                  MULTIPLAYER
                </div>
                <div className="px-2 space-y-2">
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Status:</span>{" "}
                    <span className="text-green-400">Connected</span>
                  </div>
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Room:</span>{" "}
                    <span className="text-blue-400">saaam-dev-123</span>
                  </div>
                  <div className="text-xs">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Users online:</span>{" "}
                    <span className="text-yellow-400">{users.length}</span>
                  </div>
                  {users.map((user, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSaaamIDE
