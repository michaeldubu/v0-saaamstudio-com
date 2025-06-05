// src/ecs/components/ScriptComponent.js or however setup on v0

import { Component } from "../../core/Component"
import { SaaamInterpreter } from "../../engine/Interpreter"
import { generateId } from "../../utils/UUID"

/**
 * ScriptComponent allows attaching SAAAM scripts to entities
 * and handles the execution of script functions in the ECS context
 */
export class ScriptComponent extends Component {
  /**
   * Create a new script component
   * @param {Object} options - Component configuration
   * @param {string} [options.scriptContent] - SAAAM script content
   * @param {string} [options.scriptPath] - Path to SAAAM script file
   * @param {Object} [options.initialVariables] - Initial variable values
   * @param {boolean} [options.enabled=true] - Whether the script is enabled
   */
  constructor(options = {}) {
    super("ScriptComponent")

    // Store options
    this.scriptContent = options.scriptContent || ""
    this.scriptPath = options.scriptPath || ""
    this.initialVariables = options.initialVariables || {}
    this.enabled = options.enabled !== undefined ? options.enabled : true

    // Internal state
    this._compiled = false
    this._loading = false
    this._error = null
    this._interpreter = null
    this._callbacks = {
      create: null,
      step: null,
      draw: null,
      destroy: null,
      onCollision: null,
      onTrigger: null,
      // ...more callbacks as needed
    }

    // Tracking variables
    this._compilationId = generateId()

    // Bind methods
    this.compile = this.compile.bind(this)
    this.runCallback = this.runCallback.bind(this)
    this.hasCallback = this.hasCallback.bind(this)
  }

  /**
   * Called when component is attached to an entity
   * @param {Entity} entity - The entity this component is attached to
   */
  onAttach(entity) {
    super.onAttach(entity)

    // Load script from path if specified
    if (this.scriptPath && !this.scriptContent) {
      this._loadScriptFromPath()
    }
    // Otherwise compile inline script if available
    else if (this.scriptContent) {
      this.compile()
    }
  }

  /**
   * Called when component is detached from an entity
   */
  onDetach() {
    // Run destroy callback if exists
    if (this.hasCallback("destroy")) {
      try {
        this.runCallback("destroy", [])
      } catch (error) {
        console.error("[ScriptComponent] Error in destroy callback:", error)
      }
    }

    super.onDetach()
  }

  /**
   * Set script content and compile
   * @param {string} content - SAAAM script content
   */
  setScriptContent(content) {
    this.scriptContent = content
    this.scriptPath = "" // Clear path when setting content directly

    // Recompile
    return this.compile()
  }

  /**
   * Load and set script from path
   * @param {string} path - Path to SAAAM script file
   */
  async setScriptPath(path) {
    this.scriptPath = path
    this.scriptContent = "" // Clear content when setting path

    // Load and compile
    return this._loadScriptFromPath()
  }

  /**
   * Compile the script content
   * @returns {Promise<boolean>} Success state
   */
  async compile() {
    // Skip if already compiling same content
    if (this._loading) return false

    // Skip if no content
    if (!this.scriptContent) {
      this._error = new Error("No script content to compile")
      this._compiled = false
      return false
    }

    // Mark as loading
    this._loading = true

    try {
      // Create a new unique compilation ID
      this._compilationId = generateId()

      // Create interpreter instance
      this._interpreter = new SaaamInterpreter()

      // Compile script
      const result = await this._interpreter.compile(this.scriptContent)

      if (result.success) {
        // Extract callbacks from compiled script
        this._extractCallbacks()

        // Set initial variables
        this._setInitialVariables()

        // Mark as compiled
        this._compiled = true
        this._error = null

        // Emit successful compilation event
        if (this.entity && this.entity.world) {
          this.entity.world.events.emit("script.compiled", {
            entity: this.entity,
            component: this,
            success: true,
          })
        }

        return true
      } else {
        // Store error
        this._error = new Error(result.error || "Unknown compilation error")
        this._compiled = false

        // Emit failed compilation event
        if (this.entity && this.entity.world) {
          this.entity.world.events.emit("script.compiled", {
            entity: this.entity,
            component: this,
            success: false,
            error: this._error,
          })
        }

        console.error("[ScriptComponent] Compilation error:", this._error)
        return false
      }
    } catch (error) {
      // Handle unexpected errors
      this._error = error
      this._compiled = false

      // Emit failed compilation event
      if (this.entity && this.entity.world) {
        this.entity.world.events.emit("script.compiled", {
          entity: this.entity,
          component: this,
          success: false,
          error: this._error,
        })
      }

      console.error("[ScriptComponent] Unexpected compilation error:", error)
      return false
    } finally {
      // Mark as no longer loading
      this._loading = false
    }
  }

  /**
   * Check if a callback function exists
   * @param {string} name - Callback name
   * @returns {boolean} True if callback exists
   */
  hasCallback(name) {
    return !!this._callbacks[name]
  }

  /**
   * Run a callback function
   * @param {string} name - Callback name
   * @param {Array} args - Arguments to pass
   * @param {Object} [context] - Execution context (this value)
   * @returns {*} Callback result
   */
  runCallback(name, args = [], context = null) {
    // Skip if not compiled
    if (!this._compiled) return null

    // Skip if callback doesn't exist
    if (!this.hasCallback(name)) return null

    // Skip if disabled
    if (!this.enabled) return null

    // Store current entity in interpreter for nested calls
    this._interpreter._currentEntity = this.entity

    try {
      // Run callback with provided context and arguments
      if (context) {
        return this._callbacks[name].apply(context, args)
      } else {
        return this._callbacks[name](...args)
      }
    } catch (error) {
      console.error(`[ScriptComponent] Error running ${name} callback:`, error)
      return null
    } finally {
      // Clear current entity reference
      this._interpreter._currentEntity = null
    }
  }

  /**
   * Get the last compilation error
   * @returns {Error|null} Compilation error
   */
  getError() {
    return this._error
  }

  /**
   * Check if the script is successfully compiled
   * @returns {boolean} Compilation state
   */
  isCompiled() {
    return this._compiled
  }

  /**
   * Create a serialized representation of this component
   * @returns {Object} Serialized component data
   */
  serialize() {
    return {
      type: this.type,
      id: this.id,
      enabled: this.enabled,
      scriptContent: this.scriptContent,
      scriptPath: this.scriptPath,
      initialVariables: { ...this.initialVariables },
    }
  }

  /**
   * Restore component state from serialized data
   * @param {Object} data - Serialized component data
   */
  deserialize(data) {
    this.id = data.id
    this.enabled = data.enabled
    this.scriptContent = data.scriptContent
    this.scriptPath = data.scriptPath
    this.initialVariables = { ...data.initialVariables }

    // Recompile
    this.compile()
  }

  /**
   * Load script from path
   * @private
   */
  async _loadScriptFromPath() {
    if (!this.scriptPath) {
      this._error = new Error("No script path specified")
      return false
    }

    // Mark as loading
    this._loading = true

    try {
      // Fetch script content
      const response = await fetch(this.scriptPath)

      if (!response.ok) {
        throw new Error(`Failed to load script from ${this.scriptPath}: ${response.statusText}`)
      }

      // Get script content
      this.scriptContent = await response.text()

      // Compile loaded content
      return await this.compile()
    } catch (error) {
      this._error = error
      this._compiled = false

      console.error("[ScriptComponent] Error loading script:", error)
      return false
    } finally {
      // Mark as no longer loading
      this._loading = false
    }
  }

  /**
   * Extract callback functions from the compiled script
   * @private
   */
  _extractCallbacks() {
    // Get script namespace from interpreter
    const scriptNamespace = this._interpreter.getScriptNamespace()

    // Extract callbacks based on known function names
    for (const callbackName of Object.keys(this._callbacks)) {
      if (typeof scriptNamespace[callbackName] === "function") {
        this._callbacks[callbackName] = scriptNamespace[callbackName]
      } else {
        this._callbacks[callbackName] = null
      }
    }
  }

  /**
   * Set initial variables in the script
   * @private
   */
  _setInitialVariables() {
    if (!this._interpreter || Object.keys(this.initialVariables).length === 0) {
      return
    }

    // Get script namespace from interpreter
    const scriptNamespace = this._interpreter.getScriptNamespace()

    // Set each initial variable
    for (const [key, value] of Object.entries(this.initialVariables)) {
      scriptNamespace[key] = value
    }
  }
}

// Register component type
Component.register("ScriptComponent", ScriptComponent)
