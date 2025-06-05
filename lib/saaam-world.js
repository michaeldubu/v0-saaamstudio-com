// src/core/World.js

import { EventEmitter } from "../utils/EventEmitter"
import { generateId } from "../utils/UUID"
import { SceneGraph } from "./SceneGraph"

/**
 * World is the central registry for all entities, components, and systems.
 * It manages the scene graph, systems execution, and game state.
 */
export class World {
  constructor() {
    // Basic properties
    this.id = generateId()
    this.name = "SaaamWorld"
    this.running = false
    this.timeScale = 1.0

    // Core containers
    this.entities = new Map()
    this.systems = new Map()
    this.sceneGraph = new SceneGraph(this)

    // Event system for cross-system communication
    this.events = new EventEmitter()

    // Scene management
    this.activeScene = null
    this.scenes = new Map()

    // Runtime caches for performance
    this._entityCache = []
    this._componentCaches = new Map()
    this._systemExecutionOrder = []

    // Debug flags
    this.debug = {
      showColliders: false,
      logSystemTime: false,
      pausePhysics: false,
    }
  }

  /**
   * Initialize the world and prepare for execution
   */
  initialize() {
    console.log(`[SAAAM World] Initializing world '${this.name}'`)

    // Initialize all registered systems
    for (const [id, system] of this.systems) {
      system.initialize()
    }

    // Sort systems by priority for correct execution order
    this._buildSystemExecutionOrder()

    // Emit initialization event
    this.events.emit("world.initialized", this)

    return this
  }

  /**
   * Update the world for the current frame
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (!this.running) return

    // Scale deltaTime by timeScale
    const scaledDeltaTime = deltaTime * this.timeScale

    // Update all systems in correct order
    for (const systemId of this._systemExecutionOrder) {
      const system = this.systems.get(systemId)

      // Skip inactive systems
      if (!system.active) continue

      // Measure performance if debug enabled
      let startTime
      if (this.debug.logSystemTime) {
        startTime = performance.now()
      }

      // Update the system
      system.update(scaledDeltaTime)

      // Log system performance if debug enabled
      if (this.debug.logSystemTime) {
        const elapsedTime = performance.now() - startTime
        console.log(`[SAAAM World] System '${system.name}' took ${elapsedTime.toFixed(2)}ms`)
      }
    }

    // Emit update event after all systems are updated
    this.events.emit("world.update", {
      world: this,
      deltaTime: scaledDeltaTime,
    })
  }

  /**
   * Create a new entity in the world
   * @param {string} [name] - Optional name for the entity
   * @returns {Entity} The newly created entity
   */
  createEntity(name = "Entity") {
    const entity = new Entity(name)

    // Register entity in the world
    this.entities.set(entity.id, entity)
    entity._world = this

    // Add to scene graph
    this.sceneGraph.addNode(entity)

    // Update cache
    this._entityCache.push(entity)

    // Emit entity creation event
    this.events.emit("entity.created", {
      world: this,
      entity: entity,
    })

    return entity
  }

  /**
   * Remove an entity from the world
   * @param {Entity|string} entityOrId - Entity or entity ID to remove
   * @returns {boolean} True if entity was removed, false otherwise
   */
  removeEntity(entityOrId) {
    const id = typeof entityOrId === "string" ? entityOrId : entityOrId.id
    const entity = this.entities.get(id)

    if (!entity) return false

    // Emit entity will be destroyed event before removal
    this.events.emit("entity.destroying", {
      world: this,
      entity: entity,
    })

    // Remove from all systems
    for (const [_, system] of this.systems) {
      system.removeEntity(entity)
    }

    // Remove from scene graph
    this.sceneGraph.removeNode(entity)

    // Remove all components and trigger their cleanup
    entity._destroyAllComponents()

    // Unregister entity from world
    this.entities.delete(id)

    // Update cache
    this._entityCache = this._entityCache.filter((e) => e.id !== id)

    // Emit entity destroyed event
    this.events.emit("entity.destroyed", {
      world: this,
      entityId: id,
    })

    return true
  }

  /**
   * Register a system in the world
   * @param {System} system - System to register
   * @param {number} [priority=0] - Execution priority (lower executes first)
   * @returns {System} The registered system
   */
  registerSystem(system, priority = 0) {
    system._world = this
    system.priority = priority
    this.systems.set(system.id, system)

    // Rebuild execution order when a new system is added
    this._buildSystemExecutionOrder()

    // Emit system registration event
    this.events.emit("system.registered", {
      world: this,
      system: system,
    })

    return system
  }

  /**
   * Unregister a system from the world
   * @param {System|string} systemOrId - System or system ID to remove
   * @returns {boolean} True if system was removed, false otherwise
   */
  unregisterSystem(systemOrId) {
    const id = typeof systemOrId === "string" ? systemOrId : systemOrId.id
    const system = this.systems.get(id)

    if (!system) return false

    // Let the system clean up
    system.cleanup()

    // Remove system
    this.systems.delete(id)

    // Rebuild execution order
    this._buildSystemExecutionOrder()

    // Emit system unregistered event
    this.events.emit("system.unregistered", {
      world: this,
      systemId: id,
    })

    return true
  }

  /**
   * Get all entities that have all of the specified component types
   * @param {Array<typeof Component>} componentTypes - Component types to filter by
   * @returns {Array<Entity>} Array of entities with all component types
   */
  getEntitiesWith(...componentTypes) {
    if (componentTypes.length === 0) {
      return [...this._entityCache]
    }

    // Create key for component type combination
    const key = componentTypes
      .map((t) => t.name)
      .sort()
      .join("|")

    // Check if we have a cached result
    if (!this._componentCaches.has(key)) {
      // Create new cache for this component combination
      this._componentCaches.set(
        key,
        this._entityCache.filter((entity) => {
          return componentTypes.every((type) => entity.hasComponent(type))
        }),
      )
    }

    return [...this._componentCaches.get(key)]
  }

  /**
   * Find an entity by name
   * @param {string} name - Name to search for
   * @returns {Entity|null} Found entity or null
   */
  findEntityByName(name) {
    for (const entity of this._entityCache) {
      if (entity.name === name) {
        return entity
      }
    }
    return null
  }

  /**
   * Start execution of the world
   */
  start() {
    if (this.running) return

    this.running = true
    this.events.emit("world.started", this)
  }

  /**
   * Pause execution of the world
   */
  pause() {
    if (!this.running) return

    this.running = false
    this.events.emit("world.paused", this)
  }

  /**
   * Create a snapshot of the world's state
   * @returns {Object} Serialized world state
   */
  serialize() {
    // Serialize entities
    const entities = []
    for (const entity of this._entityCache) {
      entities.push(entity.serialize())
    }

    return {
      id: this.id,
      name: this.name,
      entities: entities,
      sceneGraph: this.sceneGraph.serialize(),
      timeScale: this.timeScale,
      activeScene: this.activeScene ? this.activeScene.id : null,
    }
  }

  /**
   * Restore world state from a snapshot
   * @param {Object} data - Serialized world state
   */
  deserialize(data) {
    this.id = data.id
    this.name = data.name
    this.timeScale = data.timeScale

    // Clear existing entities
    this.clear()

    // Deserialize scene graph first
    this.sceneGraph.deserialize(data.sceneGraph)

    // Deserialize entities
    for (const entityData of data.entities) {
      const entity = this.createEntity(entityData.name)
      entity.deserialize(entityData)
    }

    // Restore active scene if needed
    if (data.activeScene && this.scenes.has(data.activeScene)) {
      this.activeScene = this.scenes.get(data.activeScene)
    }

    // Rebuild system state
    this._rebuildSystemState()

    return this
  }

  /**
   * Clear all entities from the world
   */
  clear() {
    // Destroy all entities
    for (const id of Array.from(this.entities.keys())) {
      this.removeEntity(id)
    }

    // Reset scene graph
    this.sceneGraph.clear()

    // Clear caches
    this._entityCache = []
    this._componentCaches.clear()

    this.events.emit("world.cleared", this)
  }

  /**
   * Build the system execution order based on priority
   * @private
   */
  _buildSystemExecutionOrder() {
    const systemEntries = Array.from(this.systems.entries())

    // Sort systems by priority (lower first)
    systemEntries.sort((a, b) => a[1].priority - b[1].priority)

    // Extract system IDs in the correct order
    this._systemExecutionOrder = systemEntries.map((entry) => entry[0])
  }

  /**
   * Rebuild system state after entities change
   * @private
   */
  _rebuildSystemState() {
    // Clear all system entity lists
    for (const [_, system] of this.systems) {
      system.clearEntities()
    }

    // Re-add all entities to appropriate systems
    for (const entity of this._entityCache) {
      this._updateEntitySystem(entity)
    }

    // Invalidate component caches
    this._componentCaches.clear()
  }

  /**
   * Update entity's system membership when components change
   * @param {Entity} entity - Entity to update
   * @private
   */
  _updateEntitySystem(entity) {
    for (const [_, system] of this.systems) {
      // Check if entity matches system's component requirements
      if (system.matchesEntity(entity)) {
        system.addEntity(entity)
      } else {
        system.removeEntity(entity)
      }
    }

    // Invalidate component caches
    this._componentCaches.clear()
  }

  /**
   * Notify the world that an entity's components have changed
   * @param {Entity} entity - Entity that changed
   * @private
   */
  _notifyComponentChange(entity) {
    // Update entity in systems
    this._updateEntitySystem(entity)

    // Emit component changed event
    this.events.emit("entity.componentsChanged", {
      world: this,
      entity: entity,
    })
  }
}
