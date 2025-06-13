"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/studio/file-explorer"
import { CodeEditor } from "@/components/studio/code-editor"
import { Terminal } from "@/components/studio/terminal"
import { GamePreview } from "@/components/studio/game-preview"
import { saaamEngine } from "@/lib/saaam-engine" // Import the mock engine
import { Button } from "@/components/ui/button"

export interface FileItem {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  folder?: string
}

interface LogEntry {
  type: "info" | "success" | "error" | "system"
  message: string
}

interface SaaamStudioPageProps {
  initialProjectData?: {
    description: string
    template: string | null
    framework: string
    language: string | null
    features: string[]
    timestamp: number
    generatedFiles?: { name: string; content: string; type: "file" }[]
  }
}

export default function SaaamStudioPage({ initialProjectData }: SaaamStudioPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([])
  const [activePanel, setActivePanel] = useState("editor")
  const [gameRunning, setGameRunning] = useState(false)

  const appendLog = useCallback((type: "info" | "success" | "error" | "system", message: string) => {
    setConsoleLogs((prev) => [...prev, { type, message }])
  }, [])

  // Effect to update gameRunning state from engine
  useEffect(() => {
    const interval = setInterval(() => {
      setGameRunning(saaamEngine.getIsRunning())
    }, 100) // Check every 100ms
    return () => clearInterval(interval)
  }, [])

  // Initialize with default files or generated project files
  useEffect(() => {
    if (initialProjectData && initialProjectData.generatedFiles && initialProjectData.generatedFiles.length > 0) {
      const loadedFiles: FileItem[] = initialProjectData.generatedFiles.map((f, index) => ({
        id: `generated-${index}-${Date.now()}`,
        name: f.name,
        content: f.content,
        type: f.type,
        folder: f.type === "file" && f.name.endsWith(".saaam") ? "scripts" : undefined,
      }))
      setFiles(loadedFiles)
      if (loadedFiles.length > 0) {
        setActiveFileId(loadedFiles[0].id)
        setEditorContent(loadedFiles[0].content)
      }
      appendLog("system", `Project "${initialProjectData.description}" loaded into SAAAM Studio.`)
      saaamEngine.loadProject(loadedFiles).then((result) => {
        setConsoleLogs((prev) => [...prev, ...result.logs])
      })
    } else if (files.length === 0) {
      // Load default files if no project data and no existing files
      const defaultFile: FileItem = {
        id: "main-script.saaam",
        name: "main-script.saaam",
        content: `// Welcome to your SAAAM Studio!
// This is a SAAAM script.
// You can write your game logic here.

// Example: Define a player entity
entity Player {
  property health = 100;
  property speed = 5;
  
  action move(direction) {
    log("Player moves " + direction);
    // Add game logic for movement
  }
}

// Example: Game initialization
on gameStart {
  log("Game started!");
  let player = new Player();
  player.move("north");
  draw_text("Hello SAAAM World!", 400, 300, "#FFFFFF");
}

// Example: Game drawing loop
on gameDraw(ctx) {
  // Clear the canvas (done by engine, but good practice to know)
  // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw a simple rectangle
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(100, 100, 50, 50);
  
  draw_text("Drawing in SAAAM!", 400, 100, "#00FF00");
}

// Try changing 'log' to 'ERROR' to see a simulated error!
`,
        type: "file",
        folder: "scripts",
      }
      setFiles([defaultFile])
      setActiveFileId(defaultFile.id)
      setEditorContent(defaultFile.content)
      appendLog("system", "Welcome to SAAAM Studio! Start by editing your script.")
    }
  }, [initialProjectData, appendLog]) // Only run on initial mount or when initialProjectData changes

  const handleOpenFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file && file.type === "file") {
        setActiveFileId(file.id)
        setEditorContent(file.content)
        appendLog("info", `Opened file: ${file.name}`)
      }
    },
    [files, appendLog],
  )

  const handleNewFile = useCallback(() => {
    const newFileName = prompt("Enter new file name (e.g., my-script.saaam or config.json):")
    if (newFileName) {
      const newFile: FileItem = {
        id: `${newFileName}-${Date.now()}`,
        name: newFileName,
        content: newFileName.endsWith(".json") ? "{}" : "// New SAAAM file",
        type: "file",
        folder: newFileName.endsWith(".saaam") ? "scripts" : undefined,
      }
      setFiles((prev) => [...prev, newFile])
      setActiveFileId(newFile.id)
      setEditorContent(newFile.content)
      appendLog("system", `Created new file: ${newFile.name}`)
    }
  }, [appendLog])

  const handleDeleteFile = useCallback(
    (fileId: string) => {
      const fileToDelete = files.find((f) => f.id === fileId)
      if (fileToDelete && confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        if (activeFileId === fileId) {
          setActiveFileId(null)
          setEditorContent("")
        }
        appendLog("system", `Deleted file: ${fileToDelete.name}`)
      }
    },
    [files, activeFileId, appendLog],
  )

  const handleSaveFile = useCallback(() => {
    if (activeFileId) {
      setFiles((prev) => prev.map((file) => (file.id === activeFileId ? { ...file, content: editorContent } : file)))
      appendLog("system", `Saved file: ${files.find((f) => f.id === activeFileId)?.name || "Unknown file"}`)
    } else {
      appendLog("error", "No active file to save.")
    }
  }, [activeFileId, editorContent, files, appendLog])

  const handleRunScript = useCallback(async () => {
    if (!activeFileId) {
      appendLog("error", "No file selected to run.")
      return
    }
    const activeFile = files.find((f) => f.id === activeFileId)
    if (!activeFile || !activeFile.name.endsWith(".saaam")) {
      appendLog("error", "Please select a SAAAM script file to run.")
      return
    }
    if (!canvasRef.current) {
      appendLog("error", "Canvas not ready for rendering.")
      return
    }

    // Save current changes before running
    handleSaveFile()

    appendLog("system", `Attempting to run ${activeFile.name}...`)
    const result = await saaamEngine.runScript(activeFile.content, activeFile.name, canvasRef.current)
    setConsoleLogs((prev) => [...prev, ...result.logs])
    setGameRunning(saaamEngine.getIsRunning()) // Update state based on engine
  }, [activeFileId, files, handleSaveFile, appendLog])

  const handleStopScript = useCallback(() => {
    saaamEngine.stop()
    setGameRunning(saaamEngine.getIsRunning()) // Update state based on engine
    appendLog("system", "Script execution stopped by user.")
  }, [appendLog])

  const handleEditorContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent)
  }, [])

  const handleImportProject = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json" // Or a custom project file extension like .saaamproj
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target?.result as string)
              if (
                Array.isArray(importedData) &&
                importedData.every((item) => "id" in item && "name" in item && "content" in item && "type" in item)
              ) {
                setFiles(importedData)
                if (importedData.length > 0) {
                  setActiveFileId(importedData[0].id)
                  setEditorContent(importedData[0].content)
                }
                appendLog("success", `Project imported successfully from ${file.name}.`)
                saaamEngine.loadProject(importedData).then((result) => {
                  setConsoleLogs((prev) => [...prev, ...result.logs])
                })
              } else {
                appendLog("error", "Invalid project file format. Expected an array of file objects.")
              }
            } catch (parseError: any) {
              appendLog("error", `Failed to parse project file: ${parseError.message}`)
            }
          }
          reader.readAsText(file)
        } catch (readError: any) {
          appendLog("error", `Error reading file: ${readError.message}`)
        }
      }
    }
    input.click()
  }, [appendLog])

  const handleExportProject = useCallback(() => {
    const projectData = JSON.stringify(files, null, 2)
    const blob = new Blob([projectData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "saaam_project.json" // Or .saaamproj
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    appendLog("success", "Project exported successfully as saaam_project.json.")
  }, [files, appendLog])

  const activeFileName = activeFileId ? files.find((f) => f.id === activeFileId)?.name : null

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File Explorer */}
        <div className="lg:col-span-1">
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onOpenFile={handleOpenFile}
            onNewFile={handleNewFile}
            onDeleteFile={handleDeleteFile}
            onSaveFile={handleSaveFile}
            onRunScript={handleRunScript}
            onImportProject={handleImportProject}
            onExportProject={handleExportProject}
          />
        </div>

        {/* Main Content Area (Editor, Preview, Console) */}
        <div className="lg:col-span-3 flex flex-col">
          <Tabs value={activePanel} onValueChange={setActivePanel} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 mb-4">
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
              <TabsTrigger value="preview">Game Preview</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 mt-0">
              <CodeEditor
                content={editorContent}
                onContentChange={handleEditorContentChange}
                fileName={activeFileName}
              />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 mt-0">
              <GamePreview canvasRef={canvasRef} gameRunning={gameRunning} />
            </TabsContent>
            <TabsContent value="console" className="flex-1 mt-0">
              <Terminal logs={consoleLogs} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handleRunScript} disabled={gameRunning}>
            {gameRunning ? "Running..." : "Run Game"}
          </Button>
          <Button onClick={handleStopScript} disabled={!gameRunning} variant="outline">
            Stop
          </Button>
        </div>
        <div className="text-sm text-slate-400">
          {activeFileName || "No file selected"} - {gameRunning ? "Game Running" : "Idle"}
        </div>
      </div>
    </div>
  )
}
