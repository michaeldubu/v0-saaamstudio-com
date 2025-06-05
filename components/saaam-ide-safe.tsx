"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Square, Sun, Moon } from "lucide-react"
import { SaaamCompiler } from "@/lib/saaam-compiler"
import { SaaamInterpreter } from "@/lib/saaam-interpreter"
import { sampleSaaamCode } from "@/lib/sample-code"
import { Button } from "@/components/ui/button"

// Safe SAAAM IDE for v0 preview
const SaaamIDESafe = ({ initialCode, isMobile }: { initialCode?: string; isMobile?: boolean }) => {
  const [code, setCode] = useState(initialCode || sampleSaaamCode)
  const [activeTab, setActiveTab] = useState("editor")
  const [running, setRunning] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: string; message: string }>>([])
  const [theme, setTheme] = useState("dark")
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile)
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const compilerRef = useRef<SaaamCompiler | null>(null)
  const interpreterRef = useRef<SaaamInterpreter | null>(null)

  // Initialize compiler and interpreter
  useEffect(() => {
    compilerRef.current = new SaaamCompiler()

    if (typeof window !== "undefined") {
      // Simple SAAAM object
      ;(window as any).SAAAM = {
        keyboardCheck: (keyCode: number) => false,
        keyboardCheckPressed: (keyCode: number) => false,
        drawSprite: () => {},
        drawRectangle: () => {},
        drawCircle: () => {},
        drawLine: () => {},
        drawText: () => {},
        registerCreate: () => {},
        registerStep: () => {},
        registerDraw: () => {},
        vk: { left: 37, up: 38, right: 39, down: 40, space: 32, a: 65, s: 83, d: 68, w: 87 },
      }

      interpreterRef.current = new SaaamInterpreter((window as any).SAAAM)
      interpreterRef.current.initialize()
      interpreterRef.current.compiler = compilerRef.current
    }
  }, [])

  const runCode = () => {
    if (!compilerRef.current || !interpreterRef.current || !canvasRef.current) return

    setRunning(true)
    setConsoleOutput([{ type: "info", message: "> Running SAAAM code..." }])

    try {
      const interpreter = interpreterRef.current
      const success = interpreter.loadScript(code, "main_script")

      if (success) {
        interpreter.executeScript("main_script")
        interpreter.startGame(canvasRef.current)
        setConsoleOutput((prev) => [...prev, { type: "success", message: "> Game started successfully!" }])
      } else {
        throw new Error("Failed to compile script")
      }
    } catch (error) {
      setConsoleOutput((prev) => [...prev, { type: "error", message: `> Error: ${error}` }])
      setRunning(false)
    }
  }

  const stopCode = () => {
    if (interpreterRef.current) {
      interpreterRef.current.stopGame()
    }
    setRunning(false)
    setConsoleOutput((prev) => [...prev, { type: "info", message: "> Execution stopped" }])
  }

  return (
    <div
      className={`flex flex-col w-full h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-300"}`}
      >
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-yellow-400">SAAAM IDE</span>
          <span className="px-2 py-1 text-xs bg-green-600 rounded">v0 Safe</span>
        </div>
        <div className="flex space-x-2">
          <Button variant={running ? "destructive" : "default"} size="sm" onClick={running ? stopCode : runCode}>
            {running ? <Square size={14} /> : <Play size={14} />}
            <span className="ml-1">{running ? "Stop" : "Run"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div
            className={`flex ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-gray-200 border-b border-gray-300"}`}
          >
            <button
              className={`px-4 py-2 text-sm ${activeTab === "editor" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : "text-gray-400"}`}
              onClick={() => setActiveTab("editor")}
            >
              Code Editor
            </button>
            <button
              className={`px-4 py-2 text-sm ${activeTab === "game" ? (theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900") : "text-gray-400"}`}
              onClick={() => setActiveTab("game")}
            >
              Game Preview
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "editor" ? (
              <textarea
                ref={editorRef}
                className={`w-full h-full ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} font-mono text-sm p-4 resize-none focus:outline-none`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-black">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="border border-gray-600 bg-black max-w-full max-h-full"
                />
              </div>
            )}
          </div>

          {/* Console */}
          <div
            className={`h-32 ${theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-100 border-t border-gray-300"} overflow-y-auto p-2`}
          >
            <div className="text-xs font-semibold mb-2 text-gray-400">CONSOLE</div>
            {consoleOutput.map((output, index) => (
              <div
                key={index}
                className={`text-xs font-mono ${
                  output.type === "error"
                    ? "text-red-400"
                    : output.type === "success"
                      ? "text-green-400"
                      : "text-gray-300"
                }`}
              >
                {output.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaaamIDESafe
