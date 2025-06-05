"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Square, Code, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SaaamRuntime } from "@/lib/saaam-runtime"
import { getSaaamPopupStatus } from "@/lib/saaam-popup-initializer"

interface SaaamPopupIDEProps {
  initialCode?: string
  width?: number
  height?: number
}

const defaultCode = `// SAAAM Game Code

SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

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
  
  // Draw instructions
  SAAAM.drawText("Use arrow keys to move", 20, 30, "white", "16px Arial");
}`

export default function SaaamPopupIDE({ initialCode = defaultCode, width = 800, height = 600 }: SaaamPopupIDEProps) {
  const [code, setCode] = useState(initialCode)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const [logs, setLogs] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [systemStatus, setSystemStatus] = useState(getSaaamPopupStatus())

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runtimeRef = useRef<SaaamRuntime | null>(null)

  // Initialize systems
  useEffect(() => {
    const checkSystems = () => {
      const status = getSaaamPopupStatus()
      setSystemStatus(status)
    }

    // Check immediately
    checkSystems()

    // Listen for initialization
    const handleInit = () => checkSystems()
    window.addEventListener("saaam-popup-initialized", handleInit)

    return () => {
      window.removeEventListener("saaam-popup-initialized", handleInit)
    }
  }, [])

  // Initialize runtime
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
    }
  }, [])

  const runCode = () => {
    if (!runtimeRef.current) return

    setLogs([])
    setErrors([])
    runtimeRef.current.clearLogsAndErrors()

    const success = runtimeRef.current.executeCode(code)

    if (success) {
      runtimeRef.current.start()
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }
  }

  const stopCode = () => {
    if (!runtimeRef.current) return

    runtimeRef.current.stop()
    setIsRunning(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-yellow-400">SAAAM Studio</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">Popup Mode</span>
          {systemStatus.initialized && <div className="w-2 h-2 bg-green-500 rounded-full" title="Systems Ready" />}
        </div>
        <div className="flex space-x-2">
          <Button variant={isRunning ? "destructive" : "default"} size="sm" onClick={isRunning ? stopCode : runCode}>
            {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Stop" : "Run"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "code" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("code")}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Code
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "game" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("game")}
        >
          <Monitor className="w-4 h-4 inline mr-2" />
          Game
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "code" ? (
          <div className="h-full flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
              placeholder="Write your SAAAM game code here..."
            />

            {/* Console */}
            <div className="h-32 bg-gray-800 border-t border-gray-700 overflow-y-auto p-2">
              <div className="text-xs font-semibold mb-2 text-gray-400">CONSOLE</div>
              {errors.length > 0 && (
                <div className="mb-2">
                  {errors.map((error, index) => (
                    <div key={`error-${index}`} className="text-red-400 text-xs mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              )}
              {logs.map((log, index) => (
                <div key={`log-${index}`} className="text-green-400 text-xs mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-center">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="border border-gray-600 bg-black max-w-full max-h-full"
              />
              {!isRunning && (
                <div className="text-white mt-4">
                  <p>Click "Run" to start your game</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
