/**
 * Advanced Drag and Drop System for SAAAM Studio
 * Supports file operations, code snippets, assets, and game objects
 */

class DragAndDropSystem {
  constructor() {
    this.draggedElement = null
    this.draggedData = null
    this.dropZones = new Map()
    this.dragPreview = null
    this.isDragging = false
    this.dragStartPosition = { x: 0, y: 0 }
    this.dragThreshold = 5 // pixels before drag starts

    // Drag types
    this.DRAG_TYPES = {
      FILE: "file",
      CODE_SNIPPET: "code-snippet",
      ASSET: "asset",
      GAME_OBJECT: "game-object",
      COMPONENT: "component",
      ENTITY: "entity",
      FOLDER: "folder",
    }

    // Only initialize if we're in the browser
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      this.initialize()
    }
  }

  initialize() {
    // Double check we're in the browser
    if (typeof window === "undefined" || typeof document === "undefined") {
      return
    }

    this.setupGlobalEventListeners()
    this.createDragPreview()
  }

  setupGlobalEventListeners() {
    // Safety check for document
    if (typeof document === "undefined") {
      return
    }

    document.addEventListener("dragstart", this.handleDragStart.bind(this))
    document.addEventListener("dragend", this.handleDragEnd.bind(this))
    document.addEventListener("dragover", this.handleDragOver.bind(this))
    document.addEventListener("drop", this.handleDrop.bind(this))
    document.addEventListener("mousedown", this.handleMouseDown.bind(this))
    document.addEventListener("mousemove", this.handleMouseMove.bind(this))
    document.addEventListener("mouseup", this.handleMouseUp.bind(this))
  }

  createDragPreview() {
    // Safety check for document
    if (typeof document === "undefined") {
      return
    }

    this.dragPreview = document.createElement("div")
    this.dragPreview.className = "drag-preview"
    this.dragPreview.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      display: none;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `
    document.body.appendChild(this.dragPreview)
  }

  // Make an element draggable
  makeDraggable(element, data, type = this.DRAG_TYPES.FILE) {
    element.draggable = true
    element.dataset.dragType = type
    element.dataset.dragData = JSON.stringify(data)

    // Add visual feedback
    element.addEventListener("mouseenter", () => {
      if (!this.isDragging) {
        element.style.cursor = "grab"
      }
    })

    element.addEventListener("mouseleave", () => {
      if (!this.isDragging) {
        element.style.cursor = "default"
      }
    })
  }

  // Register a drop zone
  registerDropZone(element, config) {
    const dropZone = {
      element,
      acceptedTypes: config.acceptedTypes || Object.values(this.DRAG_TYPES),
      onDrop: config.onDrop || (() => {}),
      onDragEnter: config.onDragEnter || (() => {}),
      onDragLeave: config.onDragLeave || (() => {}),
      onDragOver: config.onDragOver || (() => {}),
      validator: config.validator || (() => true),
    }

    this.dropZones.set(element, dropZone)

    // Add visual styling
    element.addEventListener("dragenter", (e) => {
      e.preventDefault()
      if (this.canDrop(dropZone, this.draggedData)) {
        element.classList.add("drag-over")
        dropZone.onDragEnter(e, this.draggedData)
      }
    })

    element.addEventListener("dragleave", (e) => {
      e.preventDefault()
      element.classList.remove("drag-over")
      dropZone.onDragLeave(e, this.draggedData)
    })

    element.addEventListener("dragover", (e) => {
      e.preventDefault()
      if (this.canDrop(dropZone, this.draggedData)) {
        dropZone.onDragOver(e, this.draggedData)
      }
    })

    element.addEventListener("drop", (e) => {
      e.preventDefault()
      element.classList.remove("drag-over")
      if (this.canDrop(dropZone, this.draggedData)) {
        dropZone.onDrop(e, this.draggedData)
      }
    })
  }

  handleMouseDown(e) {
    const draggableElement = e.target.closest('[draggable="true"]')
    if (draggableElement) {
      this.dragStartPosition = { x: e.clientX, y: e.clientY }
      this.potentialDragElement = draggableElement
    }
  }

  handleMouseMove(e) {
    if (this.potentialDragElement && !this.isDragging) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - this.dragStartPosition.x, 2) + Math.pow(e.clientY - this.dragStartPosition.y, 2),
      )

      if (distance > this.dragThreshold) {
        this.startCustomDrag(this.potentialDragElement, e)
      }
    }

    if (this.isDragging) {
      this.updateDragPreview(e)
    }
  }

  handleMouseUp(e) {
    this.potentialDragElement = null
    if (this.isDragging) {
      this.endCustomDrag(e)
    }
  }

  startCustomDrag(element, e) {
    this.isDragging = true
    this.draggedElement = element
    this.draggedData = {
      type: element.dataset.dragType,
      data: JSON.parse(element.dataset.dragData || "{}"),
      element: element,
    }

    element.style.cursor = "grabbing"
    element.classList.add("dragging")

    this.showDragPreview(e)

    // Emit drag start event
    this.emitEvent("dragStart", {
      element,
      data: this.draggedData,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  endCustomDrag(e) {
    if (!this.isDragging) return

    this.isDragging = false
    this.hideDragPreview()

    if (this.draggedElement) {
      this.draggedElement.style.cursor = "grab"
      this.draggedElement.classList.remove("dragging")
    }

    // Find drop target
    const dropTarget = this.findDropTarget(e.target)
    if (dropTarget) {
      const dropZone = this.dropZones.get(dropTarget)
      if (dropZone && this.canDrop(dropZone, this.draggedData)) {
        dropZone.onDrop(e, this.draggedData)
      }
    }

    // Emit drag end event
    this.emitEvent("dragEnd", {
      element: this.draggedElement,
      data: this.draggedData,
      position: { x: e.clientX, y: e.clientY },
      dropped: !!dropTarget,
    })

    this.draggedElement = null
    this.draggedData = null
  }

  handleDragStart(e) {
    const element = e.target
    if (element.dataset.dragType) {
      this.draggedElement = element
      this.draggedData = {
        type: element.dataset.dragType,
        data: JSON.parse(element.dataset.dragData || "{}"),
        element: element,
      }

      // Set drag effect
      e.dataTransfer.effectAllowed = "all"
      e.dataTransfer.setData("text/plain", JSON.stringify(this.draggedData))

      // Create custom drag image if needed
      this.createDragImage(e, element)
    }
  }

  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove("dragging")
      this.draggedElement = null
      this.draggedData = null
    }
  }

  handleDragOver(e) {
    e.preventDefault()
  }

  handleDrop(e) {
    e.preventDefault()
    // Handled by individual drop zones
  }

  createDragImage(e, element) {
    const dragImage = element.cloneNode(true)
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 4px;
      pointer-events: none;
    `

    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  showDragPreview(e) {
    if (!this.draggedData) return

    const preview = this.generatePreviewContent(this.draggedData)
    this.dragPreview.innerHTML = preview
    this.dragPreview.style.display = "block"
    this.updateDragPreview(e)
  }

  updateDragPreview(e) {
    if (this.dragPreview.style.display === "block") {
      this.dragPreview.style.left = e.clientX + 10 + "px"
      this.dragPreview.style.top = e.clientY + 10 + "px"
    }
  }

  hideDragPreview() {
    this.dragPreview.style.display = "none"
  }

  generatePreviewContent(draggedData) {
    const { type, data } = draggedData

    switch (type) {
      case this.DRAG_TYPES.FILE:
        return `📄 ${data.name || "File"}`
      case this.DRAG_TYPES.FOLDER:
        return `📁 ${data.name || "Folder"}`
      case this.DRAG_TYPES.CODE_SNIPPET:
        return `💻 ${data.name || "Code Snippet"}`
      case this.DRAG_TYPES.ASSET:
        const icon = this.getAssetIcon(data.type)
        return `${icon} ${data.name || "Asset"}`
      case this.DRAG_TYPES.GAME_OBJECT:
        return `🎮 ${data.name || "Game Object"}`
      case this.DRAG_TYPES.COMPONENT:
        return `🔧 ${data.name || "Component"}`
      case this.DRAG_TYPES.ENTITY:
        return `👤 ${data.name || "Entity"}`
      default:
        return `📦 ${data.name || "Item"}`
    }
  }

  getAssetIcon(assetType) {
    const icons = {
      sprite: "🖼️",
      sound: "🔊",
      music: "🎵",
      model: "🗿",
      texture: "🎨",
      shader: "✨",
      font: "🔤",
      data: "📊",
    }
    return icons[assetType] || "📦"
  }

  findDropTarget(element) {
    let current = element
    while (current && current !== document.body) {
      if (this.dropZones.has(current)) {
        return current
      }
      current = current.parentElement
    }
    return null
  }

  canDrop(dropZone, draggedData) {
    if (!draggedData) return false

    const typeAccepted = dropZone.acceptedTypes.includes(draggedData.type)
    const validatorPassed = dropZone.validator(draggedData)

    return typeAccepted && validatorPassed
  }

  // File operations
  createFileDropZone(element, onFileDrop) {
    this.registerDropZone(element, {
      acceptedTypes: [this.DRAG_TYPES.FILE, this.DRAG_TYPES.FOLDER],
      onDrop: (e, data) => {
        if (data.type === this.DRAG_TYPES.FILE) {
          onFileDrop(data.data)
        }
      },
      onDragEnter: () => {
        element.style.backgroundColor = "rgba(0, 123, 255, 0.1)"
      },
      onDragLeave: () => {
        element.style.backgroundColor = ""
      },
    })
  }

  // Code snippet operations
  createCodeDropZone(element, onCodeDrop) {
    this.registerDropZone(element, {
      acceptedTypes: [this.DRAG_TYPES.CODE_SNIPPET],
      onDrop: (e, data) => {
        onCodeDrop(data.data)
      },
    })
  }

  // Asset operations
  createAssetDropZone(element, onAssetDrop) {
    this.registerDropZone(element, {
      acceptedTypes: [this.DRAG_TYPES.ASSET],
      onDrop: (e, data) => {
        onAssetDrop(data.data)
      },
    })
  }

  // Game object operations
  createGameObjectDropZone(element, onGameObjectDrop) {
    this.registerDropZone(element, {
      acceptedTypes: [this.DRAG_TYPES.GAME_OBJECT, this.DRAG_TYPES.COMPONENT],
      onDrop: (e, data) => {
        const rect = element.getBoundingClientRect()
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        onGameObjectDrop(data.data, position)
      },
    })
  }

  // Utility methods
  emitEvent(eventName, detail) {
    const event = new CustomEvent(`drag-${eventName}`, { detail })
    document.dispatchEvent(event)
  }

  // External file drop support
  setupExternalFileDropZone(element, onExternalFileDrop) {
    element.addEventListener("dragover", (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    })

    element.addEventListener("drop", (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onExternalFileDrop(files)
      }
    })
  }

  // Cleanup
  destroy() {
    document.removeEventListener("dragstart", this.handleDragStart)
    document.removeEventListener("dragend", this.handleDragEnd)
    document.removeEventListener("dragover", this.handleDragOver)
    document.removeEventListener("drop", this.handleDrop)
    document.removeEventListener("mousedown", this.handleMouseDown)
    document.removeEventListener("mousemove", this.handleMouseMove)
    document.removeEventListener("mouseup", this.handleMouseUp)

    if (this.dragPreview && this.dragPreview.parentNode) {
      this.dragPreview.parentNode.removeChild(this.dragPreview)
    }

    this.dropZones.clear()
  }
}

// Global instance - only create if in browser
let dragAndDropSystem = null
if (typeof window !== "undefined") {
  dragAndDropSystem = new DragAndDropSystem()
}

export { dragAndDropSystem }
export default DragAndDropSystem
