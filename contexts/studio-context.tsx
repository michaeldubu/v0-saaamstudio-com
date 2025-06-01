"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Define the CodeAnalysisResult type
export interface CodeAnalysisResult {
  issues: Array<{
    type: "error" | "warning" | "info"
    message: string
    line?: number
  }>
  suggestions: Array<{
    message: string
    code?: string
    line?: number
  }>
  entities: Array<{
    name: string
    type: string
    line: number
  }>
  functions: Array<{
    name: string
    params: string[]
    line: number
  }>
}

// Define the context type
interface StudioContextType {
  // Editor state
  currentFile: string
  files: Array<{ id: string; name: string; content: string; type: string; path: string }>
  activeFileContent: string
  setActiveFile: (fileId: string) => void
  updateFileContent: (content: string) => void
  addFile: (name: string, content: string, type?: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void

  // Runtime state
  isRunning: boolean
  startGame: () => void
  stopGame: () => void

  // Compilation
  compileCode: (code: string) => { success: boolean; errors?: string[]; warnings?: string[] }

  // Console output
  consoleOutput: Array<{ type: string; message: string; timestamp: Date }>
  clearConsole: () => void
  logToConsole: (message: string, type?: string) => void

  // Game state
  gameObjects: any[]
  gameVariables: Record<string, any>

  // Asset management
  assets: Array<{ id: string; name: string; type: string; url: string }>
  addAsset: (name: string, type: string, url: string) => void
  deleteAsset: (assetId: string) => void

  // Project settings
  projectSettings: {
    name: string
    width: number
    height: number
    backgroundColor: string
  }
  updateProjectSettings: (settings: Partial<StudioContextType["projectSettings"]>) => void

  // Code analysis
  analyzeCode: (code: string) => Promise<CodeAnalysisResult>
  highlightCodeSection: (startLine: number, endLine: number) => void

  // Project
  project: {
    name: string
    files: Array<{ id: string; name: string; content: string; type: string; path: string }>
    assets: Array<{ id: string; name: string; type: string; url: string }>
    entities: any[]
    activeFile: string | null
    activeEntity: any | null
  }

  // Editor
  editorContent: string
  insertCodeAtCursor: (code: string) => void
  getActiveFile: () => { id: string; name: string; content: string; type: string; path: string } | undefined
  updateFile: (fileId: string, content: string) => void
}

// Create the context with a default value
const StudioContext = createContext<StudioContextType | undefined>(undefined)

// Provider component
export function StudioProvider({ children }: { children: ReactNode }) {
  // Editor state
  const [currentFile, setCurrentFile] = useState<string>("main.saaam")
  const [files, setFiles] = useState<Array<{ id: string; name: string; content: string; type: string; path: string }>>([
    {
      id: "main.saaam",
      name: "main.saaam",
      content: `// My first SAAAM program
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

function create() {
  console.log("Hello, World!");
}

function step(deltaTime) {
  // Game logic goes here
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");
  
  // Draw text
  SAAAM.drawText("Hello, SAAAM World!", 400, 300, "#FFFFFF");
}`,
      type: "code",
      path: "/main.saaam",
    },
  ])

  // Runtime state
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Console output
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: string; message: string; timestamp: Date }>>([])

  // Game state
  const [gameObjects, setGameObjects] = useState<any[]>([])
  const [gameVariables, setGameVariables] = useState<Record<string, any>>({})

  // Asset management
  const [assets, setAssets] = useState<Array<{ id: string; name: string; type: string; url: string }>>([
    { id: "asset1", name: "player.png", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset2", name: "enemy.png", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset3", name: "coin.png", type: "sprite", url: "/placeholder.svg?height=64&width=64" },
    { id: "asset4", name: "jump.mp3", type: "sound", url: "#" },
    { id: "asset5", name: "background.mp3", type: "sound", url: "#" },
  ])

  // Project settings
  const [projectSettings, setProjectSettings] = useState({
    name: "My SAAAM Game",
    width: 800,
    height: 600,
    backgroundColor: "#222222",
  })

  // Get the active file content
  const activeFileContent = files.find((file) => file.id === currentFile)?.content || ""

  // Update file content
  const updateFileContent = (content: string) => {
    setFiles((prevFiles) => prevFiles.map((file) => (file.id === currentFile ? { ...file, content } : file)))
  }

  // Update file by ID
  const updateFile = (fileId: string, content: string) => {
    setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, content } : file)))
  }

  // Add a new file
  const addFile = (name: string, content = "", type = "code") => {
    const newFile = {
      id: name,
      name,
      content,
      type,
      path: "/" + name,
    }

    setFiles((prevFiles) => [...prevFiles, newFile])
    setCurrentFile(name)
  }

  // Delete a file
  const deleteFile = (fileId: string) => {
    // Don't delete the last file
    if (files.length <= 1) return

    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))

    // If deleting the current file, switch to another file
    if (currentFile === fileId) {
      const remainingFile = files.find((file) => file.id !== fileId)
      if (remainingFile) {
        setCurrentFile(remainingFile.id)
      }
    }
  }

  // Rename a file
  const renameFile = (fileId: string, newName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId ? { ...file, id: newName, name: newName, path: "/" + newName } : file,
      ),
    )

    // Update current file if it was renamed
    if (currentFile === fileId) {
      setCurrentFile(newName)
    }
  }

  // Start the game
  const startGame = () => {
    clearConsole()
    logToConsole("Starting game...", "info")
    setIsRunning(true)
    logToConsole("Game started", "success")
  }

  // Stop the game
  const stopGame = () => {
    setIsRunning(false)
    logToConsole("Game stopped", "info")
  }

  // Compile code
  const compileCode = (code: string) => {
    return { success: true, errors: [], warnings: [] }
  }

  // Clear console
  const clearConsole = () => {
    setConsoleOutput([])
  }

  // Log to console
  const logToConsole = (message: string, type = "info") => {
    setConsoleOutput((prev) => [...prev, { type, message, timestamp: new Date() }])
  }

  // Add an asset
  const addAsset = (name: string, type: string, url: string) => {
    const newAsset = {
      id: `asset_${Date.now()}`,
      name,
      type,
      url,
    }

    setAssets((prev) => [...prev, newAsset])
  }

  // Delete an asset
  const deleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
  }

  // Update project settings
  const updateProjectSettings = (settings: Partial<StudioContextType["projectSettings"]>) => {
    setProjectSettings((prev) => ({ ...prev, ...settings }))
  }

  const analyzeCode = async (code: string): Promise<CodeAnalysisResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const issues: CodeAnalysisResult["issues"] = []
        const suggestions: CodeAnalysisResult["suggestions"] = []
        const entities: CodeAnalysisResult["entities"] = []
        const functions: CodeAnalysisResult["functions"] = []

        resolve({ issues, suggestions, entities, functions })
      }, 500)
    })
  }

  const highlightCodeSection = (startLine: number, endLine: number) => {
    console.log(`Highlighting lines ${startLine} to ${endLine}`)
  }

  const insertCodeAtCursor = (code: string) => {
    const newContent = activeFileContent + "\n" + code
    updateFileContent(newContent)
  }

  const getActiveFile = () => {
    return files.find((file) => file.id === currentFile)
  }

  // Context value
  const contextValue: StudioContextType = {
    currentFile,
    files,
    activeFileContent,
    setActiveFile: setCurrentFile,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,

    isRunning,
    startGame,
    stopGame,

    compileCode,

    consoleOutput,
    clearConsole,
    logToConsole,

    gameObjects,
    gameVariables,

    assets,
    addAsset,
    deleteAsset,

    projectSettings,
    updateProjectSettings,

    analyzeCode,
    highlightCodeSection,

    project: {
      name: projectSettings.name,
      files: files,
      assets: assets,
      entities: gameObjects,
      activeFile: currentFile,
      activeEntity: null,
    },

    editorContent: activeFileContent,
    insertCodeAtCursor,
    getActiveFile,
    updateFile,
  }

  return <StudioContext.Provider value={contextValue}>{children}</StudioContext.Provider>
}

// Custom hook to use the context
export function useStudio() {
  const context = useContext(StudioContext)

  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider")
  }

  return context
}
