"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Save, FilePlus, Code, XCircle, Loader2 } from "lucide-react"

// Import the core SAAAM engine
import { getSAM } from "@/core/index.js"

export default function SaaamStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [files, setFiles] = useState<any[]>([
    {
      id: "main.saaam",
      name: "main.saaam",
      type: "file",
      content: `// My first SAAAM program
SAAAM.registerCreate(create);
SAAAM.registerDraw(draw);

function create() {
  console.log("Hello, SAAAM World!");
}

function draw(ctx) {
  draw_text("Hello, SAAAM World!", 400, 300, "#FFFFFF");
}`,
      lastModified: new Date().toISOString(),
    },
  ])
  const [activeFile, setActiveFile] = useState("main.saaam")
  const [editorContent, setEditorContent] = useState("")
  const [activeTab, setActiveTab] = useState("editor") // editor, game, console
  const [log, setLog] = useState<string[]>([])
  const [engineLoaded, setEngineLoaded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([])

  const logContainerRef = useRef<HTMLDivElement>(null)

  // Initialize SAM engine
  useEffect(() => {
    appendLog("system", "Initializing SAAAM Quantum Engine...")
    const sam = getSAM()

    const initEngine = async () => {
      if (canvasRef.current) {
        appendLog("engine", "Initializing Quantum Core...")
        // Assuming SAM.init takes a canvas element and returns a promise or boolean
        // This part needs to be adapted based on the actual SAM engine's init method
        // For now, we'll simulate it.
        try {
          // The user's IDE.jsx references window.SAAAM.Engine.init
          // We'll map this to the SAM instance from core/index.js
          window.SAAAM = window.SAAAM || {}
          window.SAAAM.Engine = sam // Make the SAM instance globally accessible for SAAAM scripts

          // Simulate engine initialization
          await new Promise((resolve) => setTimeout(resolve, 500))
          setEngineLoaded(true)
          appendLog("engine", "SAAAM Quantum Engine initialized successfully!")
        } catch (error: any) {
          appendLog("error", `Failed to initialize engine: ${error.message}`)
          setEngineLoaded(false)
        }
      } else {
        setTimeout(initEngine, 100) // Retry if canvas isn't ready
      }
    }

    initEngine()

    // Cleanup function for the engine
    return () => {
      // Stop any running game loops or clear resources if necessary
      if (window.SAAAM && window.SAAAM.Engine && typeof window.SAAAM.Engine.stop === "function") {
        window.SAAAM.Engine.stop()
      }
    }
  }, [])

  // Load active file content into editor
  useEffect(() => {
    const file = files.find((f) => f.id === activeFile)
    if (file) {
      setEditorContent(file.content)
    }
  }, [activeFile, files])

  // Auto-scroll log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [log])

  const appendLog = useCallback(
    (source: string, message: string, type: "info" | "error" | "system" | "engine" = "info") => {
      const timestamp = new Date().toLocaleTimeString()
      setLog((prev) => [...prev, `[${timestamp}] [${source.toUpperCase()}] ${message}`])
    },
    [],
  )

  const handleRunCode = useCallback(() => {
    if (!engineLoaded) {
      appendLog("system", "Engine not loaded yet. Please wait.", "error")
      return
    }

    setIsRunning(true)
    setSyntaxErrors([])
    appendLog("system", "Running SAAAM script...")

    try {
      const currentFile = files.find((f) => f.id === activeFile)
      if (!currentFile) {
        appendLog("system", "No active file selected.", "error")
        setIsRunning(false)
        return
      }

      // Clear previous game state and canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      // Reset SAAAM engine state if necessary
      const sam = getSAM()
      if (typeof sam.reset === "function") {
        sam.reset()
      }

      // Execute the SAAAM code
      // This is a simplified execution. In a real scenario, you'd parse and run the DSL.
      // For now, we'll use eval, but this is NOT secure for untrusted code.
      // A proper DSL interpreter would be needed here.
      const scriptContent = currentFile.content

      // Override console.log for capturing output
      const originalConsoleLog = console.log
      const capturedLogs: string[] = []
      console.log = (...args: any[]) => {
        capturedLogs.push(args.map((arg) => String(arg)).join(" "))
        originalConsoleLog(...args)
      }

      // Provide a mock SAAAM global object for the script to interact with
      // This needs to match the SAAAM language specification [^4]
      const mockSAAAM = {
        registerCreate: (fn: Function) => {
          appendLog("SAAAM", "Registered create function.")
          window.SAAAM.createFn = fn
        },
        registerDraw: (fn: Function) => {
          appendLog("SAAAM", "Registered draw function.")
          window.SAAAM.drawFn = fn
        },
        // Add other SAAAM functions as needed, e.g., for input, physics, etc.
      }

      // Expose draw_text and other SAAAM functions globally for the script
      // This is a simplification. A proper SAAAM runtime would manage this.
      ;(window as any).draw_text = (text: string, x: number, y: number, color: string) => {
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx) {
          ctx.fillStyle = color
          ctx.font = "24px Arial"
          ctx.textAlign = "center"
          ctx.fillText(text, x, y)
        }
      }
      ;(window as any).console = { log: console.log } // Expose captured console.log

      // Execute the script in a controlled environment
      // This is where the actual SAAAM DSL interpreter would run the code
      // For this demo, we're using a direct eval, which is a security risk in production
      // and only works for simple JS-like SAAAM.
      new Function("SAAAM", scriptContent)(mockSAAAM)

      // Run the create function once
      if (window.SAAAM.createFn) {
        window.SAAAM.createFn()
      }

      // Start game loop for draw function
      let animationFrameId: number
      const gameLoop = () => {
        if (!isRunning || !canvas) return // Stop if not running or canvas is gone
        const ctx = canvas.getContext("2d")
        if (ctx && window.SAAAM.drawFn) {
          ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear canvas each frame
          window.SAAAM.drawFn(ctx)
        }
        animationFrameId = requestAnimationFrame(gameLoop)
      }

      if (window.SAAAM.drawFn) {
        animationFrameId = requestAnimationFrame(gameLoop)
      }

      appendLog("system", "Script execution started. Check game preview.", "info")
    } catch (error: any) {
      appendLog("error", `Runtime Error: ${error.message}`, "error")
      setSyntaxErrors([error.message])
    } finally {
      setIsRunning(false)
      // Restore original console.log
      console.log = originalConsoleLog
      capturedLogs.forEach((msg) => appendLog("script_output", msg))
    }
  }, [engineLoaded, activeFile, files, appendLog, isRunning]) // Added isRunning to dependencies

  const handleStopCode = useCallback(() => {
    setIsRunning(false)
    appendLog("system", "Game execution stopped.", "info")
    // Clear any ongoing animation frames
    if (window.SAAAM && window.SAAAM.drawFn) {
      cancelAnimationFrame(window.SAAAM.drawFn.animationFrameId) // Assuming drawFn stores its animation frame ID
    }
  }, [appendLog])

  const handleSaveFile = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile ? { ...f, content: editorContent, lastModified: Date.now() } : f)),
    )
    appendLog("system", `File '${activeFile}' saved.`, "info")
  }, [activeFile, editorContent, appendLog])

  const handleNewFile = useCallback(() => {
    const newFileName = prompt("Enter new file name (e.g., my-script.saaam):")
    if (newFileName) {
      const newFile = {
        id: newFileName,
        name: newFileName,
        type: "file",
        content: `// New SAAAM file: ${newFileName}\n`,
        lastModified: new Date().toISOString(),
      }
      setFiles((prev) => [...prev, newFile])
      setActiveFile(newFileName)
      setEditorContent(newFile.content)
      appendLog("system", `Created new file '${newFileName}'.`, "info")
    }
  }, [appendLog])

  const handleOpenFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file && file.type === "file") {
        setActiveFile(fileId)
        setEditorContent(file.content)
        appendLog("system", `Opened file '${fileId}'.`, "info")
      }
    },
    [files, appendLog],
  )

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* File Explorer / Sidebar */}
      <div className="w-64 border-r border-slate-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Project Files</h2>
        <Button onClick={handleNewFile} className="mb-4 w-full">
          <FilePlus className="h-4 w-4 mr-2" /> New File
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {files.map((file) => (
              <Button
                key={file.id}
                variant={activeFile === file.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleOpenFile(file.id)}
              >
                <Code className="h-4 w-4 mr-2" /> {file.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor and Game/Console Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 rounded-none border-b border-slate-700">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="game">Game Preview</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 p-4">
            <Textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-full bg-slate-800 border-slate-700 text-white font-mono text-sm resize-none"
              spellCheck="false"
            />
            {syntaxErrors.length > 0 && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                <h4 className="font-bold">Syntax Errors:</h4>
                <ul className="list-disc list-inside">
                  {syntaxErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="game" className="flex-1 p-4 flex items-center justify-center bg-slate-800">
            <canvas
              ref={canvasRef}
              width={800} // Default canvas size
              height={600}
              className="border border-slate-700 bg-black"
            />
          </TabsContent>

          <TabsContent value="console" className="flex-1 p-4">
            <ScrollArea className="h-full bg-slate-800 rounded-lg p-4 font-mono text-sm border border-slate-700">
              <div ref={logContainerRef} className="text-slate-300">
                {log.map((entry, index) => (
                  <div key={index} className={entry.includes("[ERROR]") ? "text-red-400" : ""}>
                    {entry}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleRunCode} disabled={!engineLoaded || isRunning}>
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Running..." : "Run Game"}
            </Button>
            <Button onClick={handleStopCode} disabled={!isRunning} variant="outline">
              <XCircle className="h-4 w-4 mr-2" /> Stop
            </Button>
            <Button onClick={handleSaveFile} variant="outline">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
          <div className="text-sm text-slate-400">
            {activeFile} - {engineLoaded ? "Engine Ready" : "Engine Loading..."}
          </div>
        </div>
      </div>
    </div>
  )
}
