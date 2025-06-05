// src/core/SceneGraph.js or however setup on v0

import { generateId } from "../utils/UUID"
import { Matrix4 } from "../utils/Matrix4"

/**
 * A node in the scene graph
 */
class SceneNode {
  constructor(entity) {
    this.id = entity ? entity.id : generateId()
    this.entity = entity
    this.parent = null
    this.children = []

    // Local transform matrix
    this.localMatrix = new Matrix4()

    // World transform matrix (cached)
    this.worldMatrix = new Matrix4()

    // Transform is dirty and needs recalculation
    this.dirty = true
  }

  /**
   * Add a child node
   * @param {SceneNode} child - Child node to add
   */
  addChild(child) {
    if (child.parent) {
      child.parent.removeChild(child)
    }

    child.parent = this
    this.children.push(child)

    // Mark the child and all its descendants as dirty
    child.setDirty()
  }

  /**
   * Remove a child node
   * @param {SceneNode} child - Child node to remove
   * @returns {boolean} True if child was removed
   */
  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null
      return true
    }
    return false
  }

  /**
   * Find a child node by entity ID
   * @param {string} id - Entity ID to search for
   * @returns {SceneNode|null} Found node or null
   */
  findChild(id) {
    // Check direct children first
    for (const child of this.children) {
      if (child.id === id) {
        return child
      }
    }

    // Recursively check deeper children
    for (const child of this.children) {
      const found = child.findChild(id)
      if (found) {
        return found
      }
    }

    return null
  }

  /**
   * Mark this node and all its children as dirty
   */
  setDirty() {
    this.dirty = true

    for (const child of this.children) {
      child.setDirty()
    }
  }

  /**
   * Update world transform matrix if dirty
   * @param {Matrix4} [parentWorldMatrix] - Parent's world transform matrix
   */
  updateWorldMatrix(parentWorldMatrix = null) {
    if (this.dirty || parentWorldMatrix) {
      if (parentWorldMatrix) {
        // Multiply local by parent matrix
        this.worldMatrix.multiplyMatrices(parentWorldMatrix, this.localMatrix)
      } else {
        // Root node, just copy local to world
        this.worldMatrix.copy(this.localMatrix)
      }

      this.dirty = false

      // Update children
      for (const child of this.children) {
        child.updateWorldMatrix(this.worldMatrix)
      }
    }
  }

  /**
   * Get position in world space
   * @returns {Vector3} World position
   */
  getWorldPosition() {
    // Ensure world matrix is up to date
    if (this.dirty) {
      this.updateWorldMatrix(this.parent ? this.parent.worldMatrix : null)
    }

    return this.worldMatrix.getTranslation()
  }

  /**
   * Set local position
   * @param {Vector3} position - New local position
   */
  setLocalPosition(position) {
    this.localMatrix.setTranslation(position)
    this.setDirty()
  }

  /**
   * Set local rotation in euler angles (degrees)
   * @param {Vector3} rotation - New local rotation
   */
  setLocalRotation(rotation) {
    // Convert to radians
    const radX = (rotation.x * Math.PI) / 180
    const radY = (rotation.y * Math.PI) / 180
    const radZ = (rotation.z * Math.PI) / 180

    this.localMatrix.setRotationFromEuler(radX, radY, radZ)
    this.setDirty()
  }

  /**
   * Set local scale
   * @param {Vector3} scale - New local scale
   */
  setLocalScale(scale) {
    this.localMatrix.setScale(scale)
    this.setDirty()
  }

  /**
   * Apply a transform component to this node
   * @param {TransformComponent} transform - Transform component to apply
   */
  applyTransform(transform) {
    // Create a new matrix from transform component values
    const matrix = new Matrix4()

    matrix.compose(transform.position, transform.rotation, transform.scale)

    this.localMatrix.copy(matrix)
    this.setDirty()
  }

  /**
   * Create a serialized representation of this node
   * @returns {Object} Serialized node data
   */
  serialize() {
    return {
      id: this.id,
      entityId: this.entity ? this.entity.id : null,
      localMatrix: this.localMatrix.toArray(),
      children: this.children.map((child) => child.serialize()),
    }
  }

  /**
   * Restore node state from serialized data
   * @param {Object} data - Serialized node data
   * @param {SceneGraph} sceneGraph - Scene graph for entity lookup
   */
  deserialize(data, sceneGraph) {
    this.id = data.id

    // Restore entity reference if available
    if (data.entityId && sceneGraph.world) {
      this.entity = sceneGraph.world.entities.get(data.entityId) || null
    }

    // Restore local matrix
    this.localMatrix.fromArray(data.localMatrix)

    // Mark as dirty to ensure world matrix update
    this.dirty = true

    // Restore children recursively
    for (const childData of data.children) {
      const child = new SceneNode()
      child.deserialize(childData, sceneGraph)
      this.addChild(child)
    }
  }
}

/**
 * SceneGraph manages entity hierarchy and transformations
 */
export class SceneGraph {
  constructor(world) {
    this.world = world
    this.root = new SceneNode() // Root node has no entity
    this.nodes = new Map() // All nodes by entity ID
  }

  /**
   * Add a node for an entity
   * @param {Entity} entity - Entity to add to the graph
   * @param {Entity} [parent] - Optional parent entity
   * @returns {SceneNode} The created node
   */
  addNode(entity, parent = null) {
    // Create new node
    const node = new SceneNode(entity)

    // Store in node map
    this.nodes.set(entity.id, node)

    // Add to parent
    if (parent && this.nodes.has(parent.id)) {
      this.nodes.get(parent.id).addChild(node)
    } else {
      // No parent or parent not found, add to root
      this.root.addChild(node)
    }

    return node
  }

  /**
   * Remove a node for an entity
   * @param {Entity} entity - Entity to remove from the graph
   * @returns {boolean} True if node was removed
   */
  removeNode(entity) {
    const node = this.nodes.get(entity.id)
    if (!node) return false

    // Reparent children to node's parent
    const parentNode = node.parent || this.root

    for (const child of [...node.children]) {
      node.removeChild(child)
      parentNode.addChild(child)
    }

    // Remove from parent
    if (node.parent) {
      node.parent.removeChild(node)
    } else {
      this.root.removeChild(node)
    }

    // Remove from node map
    this.nodes.delete(entity.id)

    return true
  }

  /**
   * Set parent-child relationship between entities
   * @param {Entity} child - Child entity
   * @param {Entity} parent - Parent entity
   * @returns {boolean} True if successful
   */
  setParent(child, parent) {
    const childNode = this.nodes.get(child.id)
    const parentNode = this.nodes.get(parent.id)

    if (!childNode || !parentNode) return false

    // Remove from current parent
    if (childNode.parent) {
      childNode.parent.removeChild(childNode)
    } else {
      this.root.removeChild(childNode)
    }

    // Add to new parent
    parentNode.addChild(childNode)

    return true
  }

  /**
   * Remove parent-child relationship
   * @param {Entity} child - Child entity to detach
   * @returns {boolean} True if successful
   */
  clearParent(child) {
    const childNode = this.nodes.get(child.id)
    if (!childNode) return false

    // Remove from current parent
    if (childNode.parent) {
      childNode.parent.removeChild(childNode)
    } else {
      this.root.removeChild(childNode)
    }

    // Add to root
    this.root.addChild(childNode)

    return true
  }

  /**
   * Get a node by entity ID
   * @param {string} entityId - Entity ID
   * @returns {SceneNode|null} Found node or null
   */
  getNode(entityId) {
    return this.nodes.get(entityId) || null
  }

  /**
   * Notify the scene graph that a transform component has changed
   * @param {Entity} entity - Entity with changed transform
   * @param {TransformComponent} transform - Transform component
   */
  updateTransform(entity, transform) {
    const node = this.nodes.get(entity.id)
    if (!node) return

    // Apply transform to node
    node.applyTransform(transform)
  }

  /**
   * Update all world matrices in the graph
   */
  updateWorldMatrices() {
    // Start update from the root
    this.root.updateWorldMatrix()
  }

  /**
   * Get world position for an entity
   * @param {Entity} entity - Entity to get position for
   * @returns {Vector3|null} World position or null if entity not found
   */
  getWorldPosition(entity) {
    const node = this.nodes.get(entity.id)
    if (!node) return null

    return node.getWorldPosition()
  }

  /**
   * Serialize the scene graph
   * @returns {Object} Serialized scene graph
   */
  serialize() {
    return {
      root: this.root.serialize(),
    }
  }

  /**
   * Deserialize the scene graph
   * @param {Object} data - Serialized scene graph
   */
  deserialize(data) {
    // Clear existing data
    this.clear()

    // Recreate root node
    this.root = new SceneNode()
    this.root.deserialize(data.root, this)

    // Rebuild node map
    this._rebuildNodeMap(this.root)
  }

  /**
   * Clear the scene graph
   */
  clear() {
    this.root = new SceneNode()
    this.nodes.clear()
  }

  /**
   * Rebuild node map after deserialization
   * @param {SceneNode} node - Current node to process
   * @private
   */
  _rebuildNodeMap(node) {
    // Add to map if node has an entity
    if (node.entity) {
      this.nodes.set(node.entity.id, node)
    }

    // Process children
    for (const child of node.children) {
      this._rebuildNodeMap(child)
    }
  }
}
