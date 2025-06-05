// src/core/Entity.js

import { generateId } from "../utils/UUID"

/**
 * Entity class for the Entity Component System architecture
 * Represents a game object that can have components attached to it
 */
export class Entity {
  /**
   * Create a new entity
   * @param {string} [name='Entity'] - Entity name
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.tag='default'] - Entity tag for categorization
   * @param {boolean} [options.active=true] - Whether entity is active
   * @param {number} [options.layer=0] - Rendering/collision layer
   */
  constructor(name = "Entity", options = {}) {
    // Core properties
    this.id = generateId()
    this.name = name
    this.tag = options.tag || "default"
    this.active = options.active !== undefined ? options.active : true
    this.layer = options.layer || 0

    // Component storage
    this._components = new Map()
    this._componentsByType = new Map()

    // Parent world reference (set when added to world)
    this._world = null

    // Renderer component cache for quick access
    this._renderableComponent = null

    // Transform component cache for quick access
    this._transformComponent = null

    // Script component cache for quick access
    this._scriptComponent = null

    // Physics component cache for quick access
    this._physicsComponent = null

    // Entity flags
    this._flags = {
      pendingDestroy: false,
      transformDirty: true,
    }
  }

  /**
   * Add a component to the entity
   * @param {Component} component - Component to add
   * @returns {Component} The added component
   * @throws {Error} If component of same type already exists
   */
  addComponent(component) {
    // Check if component of same type already exists
    if (this.hasComponent(component.constructor)) {
      throw new Error(`Entity already has a component of type ${component.constructor.name}`)
    }

    // Set component's entity reference
    component._entity = this

    // Add to component maps
    this._components.set(component.id, component)
    this._componentsByType.set(component.constructor, component)

    // Update component caches
    this._updateComponentCaches(component)

    // Notify component it was attached
    component.onAttach(this)

    // Notify world if needed
    if (this._world) {
      this._world._notifyComponentChange(this)
    }

    return component
  }

  /**
   * Remove a component from the entity
   * @param {Component|Function|string} componentOrType - Component, component type, or component ID
   * @returns {boolean} True if component was removed
   */
  removeComponent(componentOrType) {
    let component

    if (typeof componentOrType === "string") {
      // Remove by component ID
      component = this._components.get(componentOrType)
      if (!component) return false
    } else if (typeof componentOrType === "function") {
      // Remove by component type
      component = this._componentsByType.get(componentOrType)
      if (!component) return false
    } else {
      // Remove component instance
      component = componentOrType
      if (!this._components.has(component.id)) return false
    }

    // Remove from component maps
    this._components.delete(component.id)
    this._componentsByType.delete(component.constructor)

    // Update component caches
    this._updateComponentCachesRemove(component)

    // Notify component it was detached
    component.onDetach()
    component._entity = null

    // Notify world if needed
    if (this._world) {
      this._world._notifyComponentChange(this)
    }

    return true
  }

  /**
   * Get a component by type
   * @param {Function} componentType - Component type to get
   * @returns {Component|null} Component or null if not found
   */
  getComponent(componentType) {
    return this._componentsByType.get(componentType) || null
  }

  /**
   * Get a component by ID
   * @param {string} id - Component ID
   * @returns {Component|null} Component or null if not found
   */
  getComponentById(id) {
    return this._components.get(id) || null
  }

  /**
   * Check if entity has component of specified type
   * @param {Function} componentType - Component type to check
   * @returns {boolean} True if entity has component of type
   */
  hasComponent(componentType) {
    return this._componentsByType.has(componentType)
  }

  /**
   * Get all components
   * @returns {Array<Component>} Array of all components
   */
  getComponents() {
    return Array.from(this._components.values())
  }

  /**
   * Update entity and all its components
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Skip if inactive
    if (!this.active) return

    // Update all components
    for (const component of this._components.values()) {
      if (component.enabled) {
        component.update(deltaTime)
      }
    }
  }

  /**
   * Render the entity using its renderable component
   * @param {CanvasRenderingContext2D} ctx - Rendering context
   */
  render(ctx) {
    // Skip if inactive or invisible
    if (!this.active) return

    // Use renderable component if available
    if (this._renderableComponent && this._renderableComponent.enabled) {
      this._renderableComponent.render(ctx)
    }
  }

  /**
   * Set the active state of the entity
   * @param {boolean} state - New active state
   */
  setActive(state) {
    this.active = state
  }

  /**
   * Mark entity for destruction
   */
  destroy() {
    this._flags.pendingDestroy = true

    // Remove from world
    if (this._world) {
      this._world.removeEntity(this)
    }
  }

  /**
   * Create a serialized representation of this entity
   * @returns {Object} Serialized entity
   */
  serialize() {
    // Serialize all components
    const components = []
    for (const component of this._components.values()) {
      components.push(component.serialize())
    }

    return {
      id: this.id,
      name: this.name,
      tag: this.tag,
      active: this.active,
      layer: this.layer,
      components: components,
    }
  }

  /**
   * Restore from serialized data
   * @param {Object} data - Serialized entity data
   * @param {ComponentRegistry} componentRegistry - Registry to get component types
   */
  deserialize(data, componentRegistry) {
    // Restore basic properties
    this.id = data.id
    this.name = data.name
    this.tag = data.tag
    this.active = data.active
    this.layer = data.layer

    // Clear existing components
    this._destroyAllComponents()

    // Restore components
    for (const componentData of data.components) {
      const componentType = componentRegistry.getComponentType(componentData.type)

      if (componentType) {
        const component = new componentType()
        component.deserialize(componentData)
        this.addComponent(component)
      } else {
        console.warn(`Unknown component type "${componentData.type}" when deserializing entity "${this.name}"`)
      }
    }
  }

  /**
   * Update component caches when adding component
   * @param {Component} component - Added component
   * @private
   */
  _updateComponentCaches(component) {
    // Update transform component cache
    if (component.type === "TransformComponent") {
      this._transformComponent = component
      this._flags.transformDirty = true
    }
    // Update renderable component cache
    else if (component.type === "RenderableComponent") {
      this._renderableComponent = component
    }
    // Update script component cache
    else if (component.type === "ScriptComponent") {
      this._scriptComponent = component
    }
    // Update physics component cache
    else if (component.type === "PhysicsComponent") {
      this._physicsComponent = component
    }
  }

  /**
   * Update component caches when removing component
   * @param {Component} component - Removed component
   * @private
   */
  _updateComponentCachesRemove(component) {
    // Clear transform component cache
    if (component.type === "TransformComponent") {
      this._transformComponent = null
      this._flags.transformDirty = true
    }
    // Clear renderable component cache
    else if (component.type === "RenderableComponent") {
      this._renderableComponent = null
    }
    // Clear script component cache
    else if (component.type === "ScriptComponent") {
      this._scriptComponent = null
    }
    // Clear physics component cache
    else if (component.type === "PhysicsComponent") {
      this._physicsComponent = null
    }
  }

  /**
   * Destroy all components
   * @private
   */
  _destroyAllComponents() {
    // Make a copy of component IDs to avoid modification during iteration
    const componentIds = Array.from(this._components.keys())

    // Remove each component
    for (const id of componentIds) {
      this.removeComponent(id)
    }

    // Clear component maps
    this._components.clear()
    this._componentsByType.clear()

    // Clear caches
    this._renderableComponent = null
    this._transformComponent = null
    this._scriptComponent = null
    this._physicsComponent = null

    // Reset flags
    this._flags.transformDirty = true
  }
}
