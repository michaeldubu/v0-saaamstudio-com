"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/studio/file-explorer"
import { CodeEditor } from "@/components/studio/code-editor"
import { Terminal } from "@/components/studio/terminal"
import { GamePreview } from "@/components/studio/game-preview"
import { saaamEngine } from "@/lib/saaam-engine" // Import the mock engine

interface FileItem {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  folder?: string
}

interface SaaamStudioPageProps {
  initialProjectData?: {
    description: string
    template: string | null
    framework: string
    language: string | null
    features: string[]
    timestamp: number
    // Add a mock 'files' array for generated content
    generatedFiles?: { name: string; content: string; type: "file" }[]
  }
}

export default function SaaamStudioPage({ initialProjectData }: SaaamStudioPageProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [consoleLogs, setConsoleLogs] = useState<{ type: "info" | "success" | "error" | "system"; message: string }[]>(
    [],
  )
  const [activePanel, setActivePanel] = useState("editor")
  const [gameRunning, setGameRunning] = useState(false)

  const appendLog = useCallback((type: "info" | "success" | "error" | "system", message: string) => {
    setConsoleLogs((prev) => [...prev, { type, message }])
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
      appendLog("system", `Project "${initialProjectData.description}" loaded into Studio.`)
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

    // Save current changes before running
    handleSaveFile()

    setGameRunning(true)
    appendLog("system", `Attempting to run ${activeFile.name}...`)
    const result = await saaamEngine.runScript(activeFile.content, activeFile.name)
    setConsoleLogs((prev) => [...prev, ...result.logs])
    if (!result.success) {
      setGameRunning(false) // Stop game if script failed
    }
    // In a real engine, gameRunning would be controlled by the engine's state
  }, [activeFileId, files, handleSaveFile, appendLog])

  const handleEditorContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent)
  }, [])

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
              <GamePreview gameRunning={gameRunning} />
            </TabsContent>
            <TabsContent value="console" className="flex-1 mt-0">
              <Terminal logs={consoleLogs} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
