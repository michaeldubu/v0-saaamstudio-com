/**
 * Drag and Drop System Integration for SAAAM Studio
 * Integrates the drag and drop system with the IDE, Game Studio, and File System
 */

import { dragAndDropSystem } from "./drag-and-drop-system.js"

class DragAndDropIntegration {
  constructor() {
    this.studioContext = null
    this.initialized = false
  }

  initialize(studioContext) {
    this.studioContext = studioContext
    this.setupFileSystemIntegration()
    this.setupCodeEditorIntegration()
    this.setupAssetManagerIntegration()
    this.setupGameStudioIntegration()
    this.setupCopilotIntegration()
    this.initialized = true
  }

  setupFileSystemIntegration() {
    // Make file tree items draggable
    this.setupFileTreeDragAndDrop()

    // Setup external file drop zones
    this.setupExternalFileDropZones()
  }

  setupFileTreeDragAndDrop() {
    // This will be called when the file tree is rendered
    const makeFileTreeItemDraggable = (element, file) => {
      const dragData = {
        id: file.id,
        name: file.name,
        content: file.content,
        type: file.type,
        path: file.path,
      }

      dragAndDropSystem.makeDraggable(
        element,
        dragData,
        file.type === "folder" ? dragAndDropSystem.DRAG_TYPES.FOLDER : dragAndDropSystem.DRAG_TYPES.FILE,
      )
    }

    // Setup file tree drop zones for reordering
    const setupFileTreeDropZone = (element, targetFile) => {
      dragAndDropSystem.registerDropZone(element, {
        acceptedTypes: [dragAndDropSystem.DRAG_TYPES.FILE, dragAndDropSystem.DRAG_TYPES.FOLDER],
        onDrop: (e, draggedData) => {
          this.handleFileMove(draggedData.data, targetFile)
        },
        validator: (draggedData) => {
          // Prevent dropping on self or invalid targets
          return draggedData.data.id !== targetFile.id
        },
      })
    }

    // Export functions for use in React components
    window.SAAAM = window.SAAAM || {}
    window.SAAAM.dragDrop = {
      makeFileTreeItemDraggable,
      setupFileTreeDropZone,
    }
  }

  setupExternalFileDropZones() {
    // Setup drop zones for external files
    const setupExternalDropZone = (element) => {
      dragAndDropSystem.setupExternalFileDropZone(element, (files) => {
        this.handleExternalFileDrop(files)
      })
    }

    window.SAAAM.dragDrop.setupExternalDropZone = setupExternalDropZone
  }

  setupCodeEditorIntegration() {
    // Setup code snippet drag and drop
    const makeCodeSnippetDraggable = (element, snippet) => {
      dragAndDropSystem.makeDraggable(element, snippet, dragAndDropSystem.DRAG_TYPES.CODE_SNIPPET)
    }

    // Setup code editor drop zone
    const setupCodeEditorDropZone = (element) => {
      dragAndDropSystem.registerDropZone(element, {
        acceptedTypes: [
          dragAndDropSystem.DRAG_TYPES.CODE_SNIPPET,
          dragAndDropSystem.DRAG_TYPES.FILE,
          dragAndDropSystem.DRAG_TYPES.ASSET,
        ],
        onDrop: (e, draggedData) => {
          this.handleCodeEditorDrop(e, draggedData)
        },
      })
    }

    window.SAAAM.dragDrop.makeCodeSnippetDraggable = makeCodeSnippetDraggable
    window.SAAAM.dragDrop.setupCodeEditorDropZone = setupCodeEditorDropZone
  }

  setupAssetManagerIntegration() {
    // Make assets draggable
    const makeAssetDraggable = (element, asset) => {
      dragAndDropSystem.makeDraggable(element, asset, dragAndDropSystem.DRAG_TYPES.ASSET)
    }

    // Setup asset drop zones
    const setupAssetDropZone = (element, onAssetDrop) => {
      dragAndDropSystem.createAssetDropZone(element, onAssetDrop)
    }

    window.SAAAM.dragDrop.makeAssetDraggable = makeAssetDraggable
    window.SAAAM.dragDrop.setupAssetDropZone = setupAssetDropZone
  }

  setupGameStudioIntegration() {
    // Make game objects draggable
    const makeGameObjectDraggable = (element, gameObject) => {
      dragAndDropSystem.makeDraggable(element, gameObject, dragAndDropSystem.DRAG_TYPES.GAME_OBJECT)
    }

    // Make components draggable
    const makeComponentDraggable = (element, component) => {
      dragAndDropSystem.makeDraggable(element, component, dragAndDropSystem.DRAG_TYPES.COMPONENT)
    }

    // Setup game canvas drop zone
    const setupGameCanvasDropZone = (canvasElement) => {
      dragAndDropSystem.createGameObjectDropZone(canvasElement, (data, position) => {
        this.handleGameObjectDrop(data, position)
      })
    }

    window.SAAAM.dragDrop.makeGameObjectDraggable = makeGameObjectDraggable
    window.SAAAM.dragDrop.makeComponentDraggable = makeComponentDraggable
    window.SAAAM.dragDrop.setupGameCanvasDropZone = setupGameCanvasDropZone
  }

  setupCopilotIntegration() {
    // Setup copilot suggestion drag and drop
    const makeCopilotSuggestionDraggable = (element, suggestion) => {
      dragAndDropSystem.makeDraggable(element, suggestion, dragAndDropSystem.DRAG_TYPES.CODE_SNIPPET)
    }

    window.SAAAM.dragDrop.makeCopilotSuggestionDraggable = makeCopilotSuggestionDraggable
  }

  // Event handlers
  handleFileMove(draggedFile, targetFile) {
    if (!this.studioContext) return

    // Implement file moving logic
    console.log("Moving file:", draggedFile.name, "to:", targetFile.name)

    // Emit event for UI updates
    this.emitIntegrationEvent("file-moved", {
      source: draggedFile,
      target: targetFile,
    })
  }

  handleExternalFileDrop(files) {
    if (!this.studioContext) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        const fileName = file.name

        // Add file to studio context
        if (this.studioContext.addFile) {
          this.studioContext.addFile(fileName, content, this.getFileType(fileName))
        }

        // Emit event
        this.emitIntegrationEvent("external-file-added", {
          name: fileName,
          size: file.size,
          type: file.type,
        })
      }
      reader.readAsText(file)
    })
  }

  handleCodeEditorDrop(e, draggedData) {
    if (!this.studioContext) return

    const { type, data } = draggedData
    let codeToInsert = ""

    switch (type) {
      case dragAndDropSystem.DRAG_TYPES.CODE_SNIPPET:
        codeToInsert = data.code || data.content || ""
        break
      case dragAndDropSystem.DRAG_TYPES.FILE:
        codeToInsert = `// Imported from ${data.name}\n${data.content || ""}`
        break
      case dragAndDropSystem.DRAG_TYPES.ASSET:
        codeToInsert = this.generateAssetCode(data)
        break
    }

    if (codeToInsert && this.studioContext.insertCodeAtCursor) {
      this.studioContext.insertCodeAtCursor(codeToInsert)
    }

    this.emitIntegrationEvent("code-inserted", {
      type,
      data,
      code: codeToInsert,
    })
  }

  handleGameObjectDrop(data, position) {
    console.log("Game object dropped:", data, "at position:", position)

    // Create game object at position
    const gameObject = {
      ...data,
      position: position,
      id: `obj_${Date.now()}`,
    }

    this.emitIntegrationEvent("game-object-created", {
      gameObject,
      position,
    })
  }

  generateAssetCode(asset) {
    const { name, type } = asset
    const varName = name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")

    switch (type) {
      case "sprite":
        return `const ${varName} = SAAAM.loadSprite("${name}");\n`
      case "sound":
        return `const ${varName} = SAAAM.loadSound("${name}");\n`
      case "music":
        return `const ${varName} = SAAAM.loadMusic("${name}");\n`
      default:
        return `const ${varName} = SAAAM.loadAsset("${name}");\n`
    }
  }

  getFileType(fileName) {
    const extension = fileName.split(".").pop().toLowerCase()
    const typeMap = {
      saaam: "code",
      js: "code",
      ts: "code",
      jsx: "code",
      tsx: "code",
      json: "data",
      txt: "text",
      md: "markdown",
    }
    return typeMap[extension] || "file"
  }

  emitIntegrationEvent(eventName, detail) {
    const event = new CustomEvent(`saaam-drag-drop-${eventName}`, { detail })
    document.dispatchEvent(event)
  }

  // Utility methods for React components
  setupReactComponentDragDrop(ref, config) {
    if (!ref.current) return

    const element = ref.current

    if (config.draggable) {
      dragAndDropSystem.makeDraggable(element, config.dragData, config.dragType)
    }

    if (config.dropZone) {
      dragAndDropSystem.registerDropZone(element, config.dropZone)
    }
  }

  // Cleanup
  destroy() {
    dragAndDropSystem.destroy()
    this.initialized = false
  }
}

// Global instance
export const dragAndDropIntegration = new DragAndDropIntegration()
export default DragAndDropIntegration
