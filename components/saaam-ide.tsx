"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Square, Bug, BarChart, RefreshCw, Sun, Moon, Users, Menu, X, Code, BotIcon as Robot } from "lucide-react"
import { SaaamCompiler } from "@/lib/saaam-compiler"
import { SaaamInterpreter } from "@/lib/saaam-interpreter"
import { sampleSaaamCode } from "@/lib/sample-code"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CopilotPanel from "./copilot-panel"
import AssetManager from "./asset-manager"

// Main IDE component
const SaaamIDE = ({ initialCode, isMobile }: { initialCode?: string; isMobile?: boolean }) => {
  const [code, setCode] = useState(initialCode || sampleSaaamCode)
  const [activeTab, setActiveTab] = useState("editor")
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: string; message: string }>>([])
  const [visualMode, setVisualMode] = useState("game")
  const [showCoroutineVisualizer, setShowCoroutineVisualizer] = useState(false)

  // New state for enhanced features
  const [debugMode, setDebugMode] = useState(false)
  const [breakpoints, setBreakpoints] = useState<number[]>([])
  const [currentBreakpoint, setCurrentBreakpoint] = useState<number | null>(null)
  const [executionSpeed, setExecutionSpeed] = useState(1.0) // 1.0 = normal speed
  const [profilerData, setProfilerData] = useState<any>(null)
  const [showProfiler, setShowProfiler] = useState(false)
  const [aiSuggestionActive, setAiSuggestionActive] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
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

  // Asset manager state
  const [showAssetManager, setShowAssetManager] = useState(false)
  const [currentAssetType, setCurrentAssetType] = useState<"sprite" | "sound" | "room">("sprite")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const compilerRef = useRef<SaaamCompiler | null>(null)
  const interpreterRef = useRef<SaaamInterpreter | null>(null)

  // Initialize compiler and interpreter
  useEffect(() => {
    compilerRef.current = new SaaamCompiler()

    if (typeof window !== "undefined") {
      // Create a global SAAAM object for the interpreter to use
      ;(window as any).SAAAM = {
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

  // Add a useEffect to ensure the canvas is properly initialized when the component mounts

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
      className={`flex flex-col w-full h-full ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}
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
                  className="flex items-center bg-green-600 hover:bg-green-700"
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
                  className={`flex items-center ${activeTab === "copilot" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  <Robot size={14} /> <span className="hidden sm:inline ml-1">Copilot</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Coding Assistant</TooltipContent>
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
                  className={`flex items-center ${showProfiler ? "bg-pink-700" : "bg-pink-600 hover:bg-pink-700"}`}
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
                    className={`flex items-center ${multiplayerOpen ? "bg-blue-600" : ""}`}
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
                <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center">
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
      <div className="flex flex-1 overflow-hidden">
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
          </div>

          {/* Editor or Game view */}
          <div className="flex-1 overflow-hidden">
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
            ) : // Rest of your existing code for the editor/game/copilot views
            activeTab === "editor" ? (
              <div className={`h-full overflow-auto ${theme === "dark" ? "bg-gray-900" : "bg-white"} p-2`}>
                <textarea
                  className={`w-full h-full ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} font-mono p-2 resize-none focus:outline-none`}
                  value={code}
                  onChange={(e) => updateFileContent(e.target.value)}
                  spellCheck="false"
                ></textarea>
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
                                    {(mem.bytes / 1024).toFixed(1)} KB ({mem.percentage}%)
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Frame time graph */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-yellow-400 font-bold mb-2">Frame Times (ms)</h3>
                          <div className="h-32 flex items-end space-x-1 overflow-x-auto">
                            {profilerData.frames.map((frameTime, i) => (
                              <div
                                key={i}
                                className="w-2 bg-blue-500 flex-shrink-0"
                                style={{
                                  height: `${Math.min(100, frameTime * 5)}%`,
                                  backgroundColor: frameTime > 16.7 ? "#FF5630" : "#36B37E",
                                }}
                              ></div>
                            ))}
                          </div>
                          <div className="flex justify-between text-gray-400 text-xs mt-1">
                            <div>0 Frame</div>
                            <div>30</div>
                            <div>60 Frame</div>
                          </div>
                          <div className="mt-2 text-center text-sm">
                            <span className="text-white">Average: </span>
                            <span className="text-green-400">
                              {(profilerData.frames.reduce((a, b) => a + b, 0) / profilerData.frames.length).toFixed(2)}{" "}
                              ms
                            </span>
                            <span className="text-white ml-4">FPS: </span>
                            <span className="text-green-400">
                              {Math.round(
                                1000 / (profilerData.frames.reduce((a, b) => a + b, 0) / profilerData.frames.length),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-800 border border-gray-700 w-full md:w-4/5 h-3/4 flex items-center justify-center relative overflow-hidden">
                      {/* Game canvas */}
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      {!running && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          {currentBreakpoint !== null ? (
                            <div className="text-center">
                              <div className="text-xl text-yellow-400">Paused at Breakpoint</div>
                              <div className="text-sm text-gray-400 mt-2">Press "Step" to continue</div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-xl text-gray-300">Game Not Running</div>
                              <div className="text-sm text-gray-400 mt-2">Press "Run" to start the game</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Debug overlay */}
                      {debugMode && running && (
                        <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs font-mono">
                          <div>FPS: {Math.round(1000 / (16 + Math.random() * 2))}</div>
                          <div>Objects: 3</div>
                          <div>Memory: {memoryUsage} MB</div>
                          <div>Execution: {executionTime.toFixed(1)}s</div>
                        </div>
                      )}

                      {/* Execution speed controls */}
                      {running && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded flex items-center space-x-2">
                          <span className="text-xs">Speed:</span>
                          <button
                            className={`px-2 py-1 text-xs rounded ${executionSpeed === 0.5 ? "bg-blue-600" : "bg-gray-700"}`}
                            onClick={() => setExecutionSpeed(0.5)}
                          >
                            0.5x
                          </button>
                          <button
                            className={`px-2 py-1 text-xs rounded ${executionSpeed === 1.0 ? "bg-blue-600" : "bg-gray-700"}`}
                            onClick={() => setExecutionSpeed(1.0)}
                          >
                            1x
                          </button>
                          <button
                            className={`px-2 py-1 text-xs rounded ${executionSpeed === 2.0 ? "bg-blue-600" : "bg-gray-700"}`}
                            onClick={() => setExecutionSpeed(2.0)}
                          >
                            2x
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 md:space-x-4 mt-4 overflow-x-auto px-2 w-full justify-center">
                      <button
                        className={`px-2 md:px-3 py-1 rounded flex items-center text-sm ${visualMode === "game" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setVisualMode("game")}
                      >
                        <span>Game View</span>
                      </button>
                      <button
                        className={`px-2 md:px-3 py-1 rounded flex items-center text-sm ${visualMode === "physics" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setVisualMode("physics")}
                      >
                        <span>Physics Debug</span>
                      </button>
                      <button
                        className={`px-2 md:px-3 py-1 rounded flex items-center text-sm ${visualMode === "collision" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setVisualMode("collision")}
                      >
                        <span>Collision</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Your existing copilot view
              <div className="h-full flex flex-col bg-gray-900 items-center justify-center p-4 overflow-auto">
                <CopilotPanel />
              </div>
            )}
          </div>

          {/* Console output */}
          <div
            className={`h-32 md:h-40 ${theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-200 border-t border-gray-300"} overflow-y-auto`}
          >
            <div
              className={`flex items-center justify-between px-2 py-1 ${theme === "dark" ? "bg-gray-900" : "bg-gray-300"}`}
            >
              <span className="text-sm font-semibold">Console</span>
              <button
                className={`text-sm ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setConsoleOutput([])}
              >
                Clear
              </button>
            </div>
            <div className="p-2 font-mono text-sm">
              {consoleOutput.map((entry, index) => (
                <div
                  key={index}
                  className={`${
                    entry.type === "error"
                      ? "text-red-400"
                      : entry.type === "success"
                        ? "text-green-400"
                        : theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                  }`}
                >
                  {entry.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar - Properties, variables, and documentation */}
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
            <div className="p-2">
              {/* Tab selection for right sidebar */}
              <Tabs defaultValue="inspector">
                <TabsList className="w-full">
                  <TabsTrigger
                    value="inspector"
                    className={`flex-1 ${theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900"}`}
                  >
                    Inspector
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className={`flex-1 ${theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900"}`}
                  >
                    Docs
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className={`flex-1 ${theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900"}`}
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inspector" className="mt-2">
                  {debugMode && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <div
                          className={`text-sm font-semibold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"} mb-2`}
                        >
                          BREAKPOINTS
                        </div>
                        <button
                          className={`text-xs ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                        >
                          + Add
                        </button>
                      </div>
                      <div className={`${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded p-2 text-sm`}>
                        <div
                          className={`flex justify-between items-center p-1 ${currentBreakpoint === 42 ? "bg-yellow-900 bg-opacity-50" : theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} rounded`}
                        >
                          <span className="text-xs">Line 42 (Move right)</span>
                          <button className="text-red-400 hover:text-red-300 text-xs">×</button>
                        </div>
                        <div
                          className={`flex justify-between items-center p-1 ${currentBreakpoint === 51 ? "bg-yellow-900 bg-opacity-50" : theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} rounded`}
                        >
                          <span className="text-xs">Line 51 (Move left)</span>
                          <button className="text-red-400 hover:text-red-300 text-xs">×</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                    VARIABLES INSPECTOR
                  </div>

                  <div className={`border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded mb-4`}>
                    <div
                      className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} px-2 py-1 text-sm font-medium flex justify-between items-center`}
                    >
                      <span>Runtime Values</span>
                      <button
                        className={`text-xs ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {variableInspector.map((variable, i) => (
                        <div
                          key={i}
                          className={`p-2 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-300"} ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"} cursor-pointer ${selectedVariable === variable.name ? (theme === "dark" ? "bg-gray-700" : "bg-gray-300") : ""}`}
                          onClick={() => setSelectedVariable(variable.name)}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${variable.isConstant ? "text-purple-400" : "text-blue-400"}`}>
                              {variable.name}
                            </span>
                            <span className="text-xs text-gray-400">{variable.type}</span>
                          </div>
                          <div className="mt-1">
                            {typeof variable.value === "object" ? (
                              variable.type === "vec2" ? (
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                  ({variable.value.x.toFixed(1)}, {variable.value.y.toFixed(1)})
                                </span>
                              ) : (
                                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                  {JSON.stringify(variable.value)}
                                </span>
                              )
                            ) : (
                              <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                {String(variable.value)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Scope: {variable.scope}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                    OBJECT PROPERTIES
                  </div>

                  <div className={`border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded mb-4`}>
                    <div
                      className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} px-2 py-1 text-sm font-medium`}
                    >
                      Player
                    </div>
                    <div className="p-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Position</span>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          x: 100, y: 100
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Health</span>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>100</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Frame</span>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Facing</span>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Right</span>
                      </div>
                    </div>
                  </div>

                  {running && (
                    <div className={`border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded mb-4`}>
                      <div
                        className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} px-2 py-1 text-sm font-medium`}
                      >
                        Performance
                      </div>
                      <div className="p-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Execution Time</span>
                          <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {executionTime.toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memory Usage</span>
                          <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {memoryUsage} MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Speed</span>
                          <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {executionSpeed}x
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                    DOCUMENTATION
                  </div>
                  <div className={`${theme === "dark" ? "bg-gray-900" : "bg-white"} p-2 rounded text-sm`}>
                    <h3 className="text-yellow-400 font-bold">SAAAM Language</h3>
                    <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      A clean, intuitive language for game development.
                    </p>

                    <h4 className="text-yellow-400 font-medium mt-3">Quick Reference</h4>
                    <div className={`mt-1 space-y-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      <details>
                        <summary
                          className={`cursor-pointer ${theme === "dark" ? "hover:text-white" : "hover:text-gray-900"}`}
                        >
                          Basic Syntax
                        </summary>
                        <ul className="pl-4 mt-1 space-y-1 list-disc">
                          <li>var/let - Variable declaration</li>
                          <li>const - Constant declaration</li>
                          <li>function - Define functions</li>
                        </ul>
                      </details>
                      <details>
                        <summary
                          className={`cursor-pointer ${theme === "dark" ? "hover:text-white" : "hover:text-gray-900"}`}
                        >
                          Game Features
                        </summary>
                        <ul className="pl-4 mt-1 space-y-1 list-disc">
                          <li>vec2, vec3 - Vector types</li>
                          <li>yield - Pause coroutine</li>
                          <li>signals - Event system</li>
                          <li>StateMachine - Object state management</li>
                        </ul>
                      </details>
                      <details>
                        <summary
                          className={`cursor-pointer ${theme === "dark" ? "hover:text-white" : "hover:text-gray-900"}`}
                        >
                          Coroutines
                        </summary>
                        <ul className="pl-4 mt-1 space-y-1 list-disc">
                          <li>function* - Define coroutine</li>
                          <li>yield* - Pause and wait for another coroutine</li>
                          <li>start_coroutine() - Start a coroutine</li>
                        </ul>
                      </details>
                    </div>

                    <div className="mt-3">
                      <a href="#" className="text-blue-400 hover:underline">
                        View Full Documentation
                      </a>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="mt-2">
                  <div className="p-2 space-y-4">
                    <h3 className={`font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                      SAAAM Engine Documentation
                    </h3>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                      The SAAAM engine provides powerful tools for game development with a focus on performance and ease
                      of use.
                    </p>

                    <h4 className={`font-semibold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                      Key Features
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Coroutine-based game flow</li>
                      <li>Advanced procedural generation</li>
                      <li>Integrated multiplayer support</li>
                      <li>Dynamic difficulty adjustment</li>
                      <li>Cinematic cutscene system</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-2">
                  <div className="p-2 space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Font Size
                      </label>
                      <select
                        className={`mt-1 block w-full p-2 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        } rounded-md shadow-sm focus:outline-none`}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number.parseInt(e.target.value))}
                      >
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Show Minimap
                      </label>
                      <select
                        className={`mt-1 block w-full p-2 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        } rounded-md shadow-sm focus:outline-none`}
                        value={minimap}
                        onChange={(e) => setMinimap(e.target.value)}
                      >
                        <option value="always">Always</option>
                        <option value="mouseover">On Mouseover</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className={`flex items-center justify-between px-2 py-1 ${theme === "dark" ? "bg-blue-800" : "bg-blue-600"} text-white text-xs`}
      >
        <div>Ready</div>
        <div className="flex space-x-4">
          <span>Line: 12</span>
          <span>Col: 4</span>
          <span>SAAAM v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default SaaamIDE

