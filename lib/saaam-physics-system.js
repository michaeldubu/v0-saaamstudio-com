// ============================================================================
// Advanced Physics System
// ============================================================================

/**
 * Physics - Main physics engine class with multiple backends
 */
class Physics {
  constructor(options = {}) {
    this.options = {
      backend: "box2d", // 'box2d', 'rapier', 'cannon', etc.
      gravity: { x: 0, y: -9.81 },
      substeps: 3,
      fixedTimestep: 1 / 60,
      velocityIterations: 8,
      positionIterations: 3,
      debug: false,
      ...options,
    }

    this.backend = null
    this.world = null
    this.bodies = new Map()
    this.joints = new Map()
    this.shapes = new Map()
    this.contactListener = null
    this.debug = {
      enabled: this.options.debug,
      renderer: null,
      colors: {
        shape: "#39FF14",
        joint: "#FF3D00",
        contact: "#FFFF00",
        aabb: "#00FFFF",
      },
    }

    this.accumulator = 0
    this.lastTimestamp = 0
  }

  /**
   * Initialize the physics engine
   */
  async initialize() {
    try {
      // Create the appropriate backend
      this.backend = await this._createBackend()

      // Create world
      this.world = this.backend.createWorld({
        gravity: this.options.gravity,
      })

      // Set up contact listener
      this.contactListener = this.backend.createContactListener()
      this.world.setContactListener(this.contactListener)

      // Set up debug renderer if enabled
      if (this.debug.enabled) {
        this.debug.renderer = this.backend.createDebugRenderer(this.world)
      }

      return true
    } catch (error) {
      console.error("Failed to initialize physics:", error)
      return false
    }
  }

  /**
   * Update physics simulation
   */
  update(deltaTime) {
    if (!this.world) return

    if (this.options.fixedTimestep) {
      // Fixed timestep simulation
      this.accumulator += deltaTime

      while (this.accumulator >= this.options.fixedTimestep) {
        this._step(this.options.fixedTimestep)
        this.accumulator -= this.options.fixedTimestep
      }

      // Interpolation alpha for rendering
      const alpha = this.accumulator / this.options.fixedTimestep

      // Update body transforms for rendering interpolation
      for (const body of this.bodies.values()) {
        body.updateTransform(alpha)
      }
    } else {
      // Variable timestep simulation
      this._step(deltaTime)
    }
  }

  /**
   * Step the physics simulation forward
   * @private
   */
  _step(deltaTime) {
    this.world.step(deltaTime, this.options.velocityIterations, this.options.positionIterations)

    // Dispatch events for contacts
    this._processContacts()
  }

  /**
   * Process contacts and dispatch events
   * @private
   */
  _processContacts() {
    if (!this.contactListener) return

    // Process begin contacts
    for (const contact of this.contactListener.beginContacts) {
      const bodyA = this.bodies.get(contact.bodyA)
      const bodyB = this.bodies.get(contact.bodyB)

      if (bodyA && bodyB) {
        // Dispatch event to both bodies
        bodyA.dispatchEvent("collisionStart", { other: bodyB, contact })
        bodyB.dispatchEvent("collisionStart", { other: bodyA, contact })
      }
    }

    // Process end contacts
    for (const contact of this.contactListener.endContacts) {
      const bodyA = this.bodies.get(contact.bodyA)
      const bodyB = this.bodies.get(contact.bodyB)

      if (bodyA && bodyB) {
        // Dispatch event to both bodies
        bodyA.dispatchEvent("collisionEnd", { other: bodyB, contact })
        bodyB.dispatchEvent("collisionEnd", { other: bodyA, contact })
      }
    }

    // Clear contacts for next step
    this.contactListener.clear()
  }

  /**
   * Create a physics body
   */
  createBody(options) {
    if (!this.world) return null

    const bodyDef = {
      type: options.type || "dynamic", // 'dynamic', 'static', 'kinematic'
      position: options.position || { x: 0, y: 0 },
      angle: options.angle || 0,
      linearVelocity: options.linearVelocity || { x: 0, y: 0 },
      angularVelocity: options.angularVelocity || 0,
      linearDamping: options.linearDamping !== undefined ? options.linearDamping : 0.1,
      angularDamping: options.angularDamping !== undefined ? options.angularDamping : 0.1,
      allowSleep: options.allowSleep !== undefined ? options.allowSleep : true,
      awake: options.awake !== undefined ? options.awake : true,
      fixedRotation: options.fixedRotation !== undefined ? options.fixedRotation : false,
      bullet: options.bullet !== undefined ? options.bullet : false,
      userData: options.userData || {},
    }

    // Create body
    const body = this.backend.createBody(this.world, bodyDef)

    // Create fixture for each shape
    if (options.shapes) {
      for (const shapeOptions of options.shapes) {
        this._createFixture(body, shapeOptions)
      }
    }

    // Store body
    this.bodies.set(body.id, body)

    return body
  }

  /**
   * Create a physics fixture
   * @private
   */
  _createFixture(body, options) {
    const shape = this._createShape(options)

    const fixtureDef = {
      shape,
      density: options.density !== undefined ? options.density : 1,
      friction: options.friction !== undefined ? options.friction : 0.3,
      restitution: options.restitution !== undefined ? options.restitution : 0.2,
      isSensor: options.isSensor !== undefined ? options.isSensor : false,
      filterCategoryBits: options.filterCategoryBits !== undefined ? options.filterCategoryBits : 0x0001,
      filterMaskBits: options.filterMaskBits !== undefined ? options.filterMaskBits : 0xffff,
      filterGroupIndex: options.filterGroupIndex !== undefined ? options.filterGroupIndex : 0,
      userData: options.userData || {},
    }

    // Create fixture
    const fixture = this.backend.createFixture(body, fixtureDef)

    return fixture
  }

  /**
   * Create a physics shape
   * @private
   */
  _createShape(options) {
    let shape

    switch (options.type) {
      case "circle":
        shape = this.backend.createCircleShape({
          radius: options.radius,
          position: options.position || { x: 0, y: 0 },
        })
        break

      case "box":
        shape = this.backend.createBoxShape({
          width: options.width,
          height: options.height,
          position: options.position || { x: 0, y: 0 },
          angle: options.angle || 0,
        })
        break

      case "polygon":
        shape = this.backend.createPolygonShape({
          vertices: options.vertices,
        })
        break

      case "edge":
        shape = this.backend.createEdgeShape({
          vertex1: options.vertex1,
          vertex2: options.vertex2,
        })
        break

      case "chain":
        shape = this.backend.createChainShape({
          vertices: options.vertices,
          loop: options.loop || false,
        })
        break

      default:
        throw new Error(`Unknown shape type: ${options.type}`)
    }

    // Store shape
    this.shapes.set(shape.id, shape)

    return shape
  }

  /**
   * Create a physics joint
   */
  createJoint(options) {
    if (!this.world) return null

    const bodyA = typeof options.bodyA === "string" ? this.bodies.get(options.bodyA) : options.bodyA
    const bodyB = typeof options.bodyB === "string" ? this.bodies.get(options.bodyB) : options.bodyB

    if (!bodyA || !bodyB) {
      throw new Error("Joint creation failed: Invalid bodies")
    }

    let joint

    switch (options.type) {
      case "revolute":
        joint = this.backend.createRevoluteJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          collideConnected: options.collideConnected || false,
          enableLimit: options.enableLimit || false,
          lowerAngle: options.lowerAngle || 0,
          upperAngle: options.upperAngle || 0,
          enableMotor: options.enableMotor || false,
          motorSpeed: options.motorSpeed || 0,
          maxMotorTorque: options.maxMotorTorque || 0,
          userData: options.userData || {},
        })
        break

      case "distance":
        joint = this.backend.createDistanceJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          collideConnected: options.collideConnected || false,
          length: options.length,
          frequencyHz: options.frequencyHz || 0,
          dampingRatio: options.dampingRatio || 0,
          userData: options.userData || {},
        })
        break

      case "prismatic":
        joint = this.backend.createPrismaticJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          axis: options.axis || { x: 1, y: 0 },
          collideConnected: options.collideConnected || false,
          enableLimit: options.enableLimit || false,
          lowerTranslation: options.lowerTranslation || 0,
          upperTranslation: options.upperTranslation || 0,
          enableMotor: options.enableMotor || false,
          motorSpeed: options.motorSpeed || 0,
          maxMotorForce: options.maxMotorForce || 0,
          userData: options.userData || {},
        })
        break

      case "pulley":
        joint = this.backend.createPulleyJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          groundAnchorA: options.groundAnchorA || { x: 0, y: 0 },
          groundAnchorB: options.groundAnchorB || { x: 0, y: 0 },
          ratio: options.ratio || 1,
          collideConnected: options.collideConnected || false,
          userData: options.userData || {},
        })
        break

      case "gear":
        const joint1 = typeof options.joint1 === "string" ? this.joints.get(options.joint1) : options.joint1
        const joint2 = typeof options.joint2 === "string" ? this.joints.get(options.joint2) : options.joint2

        if (!joint1 || !joint2) {
          throw new Error("Gear joint creation failed: Invalid joints")
        }

        joint = this.backend.createGearJoint(this.world, {
          bodyA,
          bodyB,
          joint1,
          joint2,
          ratio: options.ratio || 1,
          collideConnected: options.collideConnected || false,
          userData: options.userData || {},
        })
        break

      case "wheel":
        joint = this.backend.createWheelJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          axis: options.axis || { x: 0, y: 1 },
          collideConnected: options.collideConnected || false,
          frequencyHz: options.frequencyHz || 2,
          dampingRatio: options.dampingRatio || 0.7,
          enableMotor: options.enableMotor || false,
          motorSpeed: options.motorSpeed || 0,
          maxMotorTorque: options.maxMotorTorque || 0,
          userData: options.userData || {},
        })
        break

      case "weld":
        joint = this.backend.createWeldJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          referenceAngle: options.referenceAngle || 0,
          collideConnected: options.collideConnected || false,
          frequencyHz: options.frequencyHz || 0,
          dampingRatio: options.dampingRatio || 0,
          userData: options.userData || {},
        })
        break

      case "rope":
        joint = this.backend.createRopeJoint(this.world, {
          bodyA,
          bodyB,
          anchorA: options.anchorA || { x: 0, y: 0 },
          anchorB: options.anchorB || { x: 0, y: 0 },
          maxLength: options.maxLength,
          collideConnected: options.collideConnected || false,
          userData: options.userData || {},
        })
        break

      case "motor":
        joint = this.backend.createMotorJoint(this.world, {
          bodyA,
          bodyB,
          linearOffset: options.linearOffset || { x: 0, y: 0 },
          angularOffset: options.angularOffset || 0,
          maxForce: options.maxForce || 1,
          maxTorque: options.maxTorque || 1,
          correctionFactor: options.correctionFactor || 0.3,
          collideConnected: options.collideConnected || false,
          userData: options.userData || {},
        })
        break

      case "mouse":
        joint = this.backend.createMouseJoint(this.world, {
          bodyA,
          bodyB,
          target: options.target || { x: 0, y: 0 },
          maxForce: options.maxForce || 1000,
          frequencyHz: options.frequencyHz || 5,
          dampingRatio: options.dampingRatio || 0.7,
          collideConnected: options.collideConnected || false,
          userData: options.userData || {},
        })
        break

      default:
        throw new Error(`Unknown joint type: ${options.type}`)
    }

    // Store joint
    this.joints.set(joint.id, joint)

    return joint
  }

  /**
   * Destroy a physics body
   */
  destroyBody(body) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    // Remove from world
    this.world.destroyBody(bodyObj)

    // Remove from map
    this.bodies.delete(bodyObj.id)

    return true
  }

  /**
   * Destroy a physics joint
   */
  destroyJoint(joint) {
    const jointObj = typeof joint === "string" ? this.joints.get(joint) : joint

    if (!jointObj) return false

    // Remove from world
    this.world.destroyJoint(jointObj)

    // Remove from map
    this.joints.delete(jointObj.id)

    return true
  }

  /**
   * Apply force to a body
   */
  applyForce(body, force, point) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.applyForce(force, point)
    return true
  }

  /**
   * Apply impulse to a body
   */
  applyImpulse(body, impulse, point) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.applyImpulse(impulse, point)
    return true
  }

  /**
   * Apply torque to a body
   */
  applyTorque(body, torque) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.applyTorque(torque)
    return true
  }

  /**
   * Set body position
   */
  setPosition(body, position) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.setPosition(position)
    return true
  }

  /**
   * Get body position
   */
  getPosition(body) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return null

    return bodyObj.getPosition()
  }

  /**
   * Set body angle
   */
  setAngle(body, angle) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.setAngle(angle)
    return true
  }

  /**
   * Get body angle
   */
  getAngle(body) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return null

    return bodyObj.getAngle()
  }

  /**
   * Set body linear velocity
   */
  setLinearVelocity(body, velocity) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.setLinearVelocity(velocity)
    return true
  }

  /**
   * Get body linear velocity
   */
  getLinearVelocity(body) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return null

    return bodyObj.getLinearVelocity()
  }

  /**
   * Set body angular velocity
   */
  setAngularVelocity(body, velocity) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return false

    bodyObj.setAngularVelocity(velocity)
    return true
  }

  /**
   * Get body angular velocity
   */
  getAngularVelocity(body) {
    const bodyObj = typeof body === "string" ? this.bodies.get(body) : body

    if (!bodyObj) return null

    return bodyObj.getAngularVelocity()
  }

  /**
   * Perform a ray cast
   */
  rayCast(point1, point2, callback) {
    return this.world.rayCast(point1, point2, callback)
  }

  /**
   * Query for bodies in an area
   */
  queryAABB(aabb, callback) {
    return this.world.queryAABB(aabb, callback)
  }

  /**
   * Query for bodies in a circle
   */
  queryCircle(center, radius, callback) {
    // Create AABB for initial broad phase
    const aabb = {
      lowerBound: { x: center.x - radius, y: center.y - radius },
      upperBound: { x: center.x + radius, y: center.y + radius },
    }

    // Then filter by actual distance
    return this.world.queryAABB(aabb, (fixture) => {
      const body = fixture.getBody()
      const position = body.getPosition()
      const dx = position.x - center.x
      const dy = position.y - center.y
      const distSq = dx * dx + dy * dy

      if (distSq <= radius * radius) {
        return callback(fixture)
      }

      return true
    })
  }

  /**
   * Render debug visualization
   */
  renderDebug(renderer) {
    if (!this.debug.enabled || !this.debug.renderer) return

    this.debug.renderer.render(renderer)
  }

  /**
   * Create the appropriate backend
   * @private
   */
  async _createBackend() {
    switch (this.options.backend) {
      case "box2d":
        return new Box2DBackend()
      case "rapier":
        return new RapierBackend()
      default:
        throw new Error(`Unsupported physics backend: ${this.options.backend}`)
    }
  }
}

/**
 * Box2D physics backend
 */
class Box2DBackend {
  constructor() {
    this.box2d = null
    this.bodyIdCounter = 0
    this.jointIdCounter = 0
    this.shapeIdCounter = 0
  }

  /**
   * Initialize Box2D
   */
  async initialize() {
    // In a real implementation, this would load Box2D WebAssembly module
    // For this example, we'll just simulate its existence
    this.box2d = {
      b2Vec2: (x, y) => ({ x, y }),
      b2World: (gravity) => new B2World(gravity),
      // ... other Box2D classes and functions
    }

    return true
  }

  /**
   * Create a Box2D world
   */
  createWorld(options) {
    const gravity = new this.box2d.b2Vec2(options.gravity.x, options.gravity.y)
    const world = new this.box2d.b2World(gravity)

    return {
      box2dWorld: world,
      step: (timeStep, velocityIterations, positionIterations) => {
        world.Step(timeStep, velocityIterations, positionIterations)
        world.ClearForces()
      },
      setContactListener: (listener) => {
        world.SetContactListener(listener.box2dListener)
      },
      destroyBody: (body) => {
        world.DestroyBody(body.box2dBody)
      },
      destroyJoint: (joint) => {
        world.DestroyJoint(joint.box2dJoint)
      },
      rayCast: (point1, point2, callback) => {
        // ...implementation
      },
      queryAABB: (aabb, callback) => {
        // ...implementation
      },
    }
  }

  /**
   * Create a Box2D contact listener
   */
  createContactListener() {
    const listener = {
      beginContacts: [],
      endContacts: [],
      clear: () => {
        listener.beginContacts = []
        listener.endContacts = []
      },
      box2dListener: {
        BeginContact: (contact) => {
          const bodyA = contact.GetFixtureA().GetBody().userData.id
          const bodyB = contact.GetFixtureB().GetBody().userData.id

          listener.beginContacts.push({
            bodyA,
            bodyB,
            box2dContact: contact,
          })
        },
        EndContact: (contact) => {
          const bodyA = contact.GetFixtureA().GetBody().userData.id
          const bodyB = contact.GetFixtureB().GetBody().userData.id

          listener.endContacts.push({
            bodyA,
            bodyB,
            box2dContact: contact,
          })
        },
        PreSolve: (contact, oldManifold) => {
          // Pre-solve handler
        },
        PostSolve: (contact, impulse) => {
          // Post-solve handler
        },
      },
    }

    return listener
  }

  /**
   * Create a Box2D body
   */
  createBody(world, options) {
    const bodyDef = {
      type: this._getBodyType(options.type),
      position: { x: options.position.x, y: options.position.y },
      angle: options.angle,
      linearVelocity: { x: options.linearVelocity.x, y: options.linearVelocity.y },
      angularVelocity: options.angularVelocity,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      allowSleep: options.allowSleep,
      awake: options.awake,
      fixedRotation: options.fixedRotation,
      bullet: options.bullet,
      userData: { ...options.userData },
    }

    // Generate ID
    const id = `body_${++this.bodyIdCounter}`
    bodyDef.userData.id = id

    // Create Box2D body
    const box2dBody = world.box2dWorld.CreateBody(bodyDef)

    // Create wrapper
    const body = {
      id,
      box2dBody,
      fixtures: [],
      type: options.type,
      eventListeners: {},

      // Wrapper methods
      getPosition: () => {
        const pos = box2dBody.GetPosition()
        return { x: pos.x, y: pos.y }
      },

      setPosition: (position) => {
        box2dBody.SetPosition(new this.box2d.b2Vec2(position.x, position.y))
        box2dBody.SetAwake(true)
      },

      getAngle: () => {
        return box2dBody.GetAngle()
      },

      setAngle: (angle) => {
        box2dBody.SetAngle(angle)
        box2dBody.SetAwake(true)
      },

      getLinearVelocity: () => {
        const vel = box2dBody.GetLinearVelocity()
        return { x: vel.x, y: vel.y }
      },

      setLinearVelocity: (velocity) => {
        box2dBody.SetLinearVelocity(new this.box2d.b2Vec2(velocity.x, velocity.y))
      },

      getAngularVelocity: () => {
        return box2dBody.GetAngularVelocity()
      },

      setAngularVelocity: (velocity) => {
        box2dBody.SetAngularVelocity(velocity)
      },

      applyForce: (force, point) => {
        const worldPoint = point || box2dBody.GetWorldCenter()
        box2dBody.ApplyForce(new this.box2d.b2Vec2(force.x, force.y), new this.box2d.b2Vec2(worldPoint.x, worldPoint.y))
      },

      applyImpulse: (impulse, point) => {
        const worldPoint = point || box2dBody.GetWorldCenter()
        box2dBody.ApplyLinearImpulse(
          new this.box2d.b2Vec2(impulse.x, impulse.y),
          new this.box2d.b2Vec2(worldPoint.x, worldPoint.y),
        )
      },

      applyTorque: (torque) => {
        box2dBody.ApplyTorque(torque)
      },

      addEventListener: (event, callback) => {
        if (!body.eventListeners[event]) {
          body.eventListeners[event] = []
        }
        body.eventListeners[event].push(callback)
      },

      removeEventListener: (event, callback) => {
        if (!body.eventListeners[event]) return

        const index = body.eventListeners[event].indexOf(callback)
        if (index !== -1) {
          body.eventListeners[event].splice(index, 1)
        }
      },

      dispatchEvent: (event, data) => {
        if (!body.eventListeners[event]) return

        for (const callback of body.eventListeners[event]) {
          callback(data)
        }
      },

      updateTransform: (alpha) => {
        // For interpolation in fixed timestep
        // In a real implementation, this would store previous and current state
        // and interpolate between them for rendering
      },
    }

    return body
  }

  /**
   * Create a Box2D shape
   */
  createCircleShape(options) {
    const id = `shape_${++this.shapeIdCounter}`

    // Create Box2D circle shape
    const shape = new this.box2d.b2CircleShape()
    shape.m_radius = options.radius

    if (options.position) {
      shape.m_p.Set(options.position.x, options.position.y)
    }

    return {
      id,
      box2dShape: shape,
      type: "circle",
      radius: options.radius,
      position: options.position,
    }
  }

  createBoxShape(options) {
    const id = `shape_${++this.shapeIdCounter}`

    // Create Box2D polygon shape for a box
    const shape = new this.box2d.b2PolygonShape()
    shape.SetAsBox(options.width / 2, options.height / 2)

    // Handle position and rotation if provided
    if (options.position || options.angle) {
      const center = new this.box2d.b2Vec2(
        options.position ? options.position.x : 0,
        options.position ? options.position.y : 0,
      )
      shape.SetAsBox(options.width / 2, options.height / 2, center, options.angle || 0)
    }

    return {
      id,
      box2dShape: shape,
      type: "box",
      width: options.width,
      height: options.height,
      position: options.position,
      angle: options.angle,
    }
  }

  createPolygonShape(options) {
    const id = `shape_${++this.shapeIdCounter}`

    // Create Box2D polygon shape
    const shape = new this.box2d.b2PolygonShape()

    // Convert vertices to Box2D format
    const vertices = options.vertices.map((v) => new this.box2d.b2Vec2(v.x, v.y))
    shape.Set(vertices, vertices.length)

    return {
      id,
      box2dShape: shape,
      type: "polygon",
      vertices: options.vertices,
    }
  }

  createEdgeShape(options) {
    const id = `shape_${++this.shapeIdCounter}`

    // Create Box2D edge shape
    const shape = new this.box2d.b2EdgeShape()
    shape.Set(
      new this.box2d.b2Vec2(options.vertex1.x, options.vertex1.y),
      new this.box2d.b2Vec2(options.vertex2.x, options.vertex2.y),
    )

    return {
      id,
      box2dShape: shape,
      type: "edge",
      vertex1: options.vertex1,
      vertex2: options.vertex2,
    }
  }

  createChainShape(options) {
    const id = `shape_${++this.shapeIdCounter}`

    // Create Box2D chain shape
    const shape = new this.box2d.b2ChainShape()

    // Convert vertices to Box2D format
    const vertices = options.vertices.map((v) => new this.box2d.b2Vec2(v.x, v.y))

    if (options.loop) {
      shape.CreateLoop(vertices, vertices.length)
    } else {
      shape.CreateChain(vertices, vertices.length)
    }

    return {
      id,
      box2dShape: shape,
      type: "chain",
      vertices: options.vertices,
      loop: options.loop,
    }
  }

  /**
   * Create a Box2D fixture
   */
  createFixture(body, options) {
    const fixtureDef = {
      shape: options.shape.box2dShape,
      density: options.density,
      friction: options.friction,
      restitution: options.restitution,
      isSensor: options.isSensor,
      filter: {
        categoryBits: options.filterCategoryBits,
        maskBits: options.filterMaskBits,
        groupIndex: options.filterGroupIndex,
      },
      userData: { ...options.userData },
    }

    // Create fixture
    const box2dFixture = body.box2dBody.CreateFixture(fixtureDef)

    // Store fixture in body
    const fixture = {
      box2dFixture,
      shape: options.shape,
      getBody: () => body,
    }

    body.fixtures.push(fixture)

    return fixture
  }

  /**
   * Create various Box2D joints
   */
  createRevoluteJoint(world, options) {
    const id = `joint_${++this.jointIdCounter}`

    const jointDef = new this.box2d.b2RevoluteJointDef()

    jointDef.Initialize(
      options.bodyA.box2dBody,
      options.bodyB.box2dBody,
      new this.box2d.b2Vec2(options.anchorA.x, options.anchorA.y),
    )

    jointDef.collideConnected = options.collideConnected
    jointDef.enableLimit = options.enableLimit
    jointDef.lowerAngle = options.lowerAngle
    jointDef.upperAngle = options.upperAngle
    jointDef.enableMotor = options.enableMotor
    jointDef.motorSpeed = options.motorSpeed
    jointDef.maxMotorTorque = options.maxMotorTorque
    jointDef.userData = { id, ...options.userData }

    const box2dJoint = world.box2dWorld.CreateJoint(jointDef)

    return {
      id,
      box2dJoint,
      type: "revolute",
      bodyA: options.bodyA,
      bodyB: options.bodyB,

      getAnchorA: () => {
        const anchor = box2dJoint.GetAnchorA()
        return { x: anchor.x, y: anchor.y }
      },

      getAnchorB: () => {
        const anchor = box2dJoint.GetAnchorB()
        return { x: anchor.x, y: anchor.y }
      },

      getReactionForce: (inv_dt) => {
        const force = box2dJoint.GetReactionForce(inv_dt)
        return { x: force.x, y: force.y }
      },

      getReactionTorque: (inv_dt) => {
        return box2dJoint.GetReactionTorque(inv_dt)
      },

      getJointAngle: () => {
        return box2dJoint.GetJointAngle()
      },

      getJointSpeed: () => {
        return box2dJoint.GetJointSpeed()
      },

      isLimitEnabled: () => {
        return box2dJoint.IsLimitEnabled()
      },

      enableLimit: (enable) => {
        box2dJoint.EnableLimit(enable)
      },

      getLowerLimit: () => {
        return box2dJoint.GetLowerLimit()
      },

      getUpperLimit: () => {
        return box2dJoint.GetUpperLimit()
      },

      setLimits: (lower, upper) => {
        box2dJoint.SetLimits(lower, upper)
      },

      isMotorEnabled: () => {
        return box2dJoint.IsMotorEnabled()
      },

      enableMotor: (enable) => {
        box2dJoint.EnableMotor(enable)
      },

      setMotorSpeed: (speed) => {
        box2dJoint.SetMotorSpeed(speed)
      },

      getMotorSpeed: () => {
        return box2dJoint.GetMotorSpeed()
      },

      setMaxMotorTorque: (torque) => {
        box2dJoint.SetMaxMotorTorque(torque)
      },

      getMotorTorque: (inv_dt) => {
        return box2dJoint.GetMotorTorque(inv_dt)
      },
    }
  }

  // Other joint creation methods would be implemented here...

  /**
   * Create a debug renderer
   */
  createDebugRenderer(world) {
    return {
      render: (renderer) => {
        // In a real implementation, this would render debug visualization
        // of all physics bodies, joints, and contacts
      },
    }
  }

  /**
   * Get Box2D body type
   * @private
   */
  _getBodyType(type) {
    switch (type) {
      case "dynamic":
        return this.box2d.b2_dynamicBody
      case "static":
        return this.box2d.b2_staticBody
      case "kinematic":
        return this.box2d.b2_kinematicBody
      default:
        return this.box2d.b2_dynamicBody
    }
  }
}

/**
 * Rapier physics backend
 */
class RapierBackend {
  constructor() {
    this.rapier = null
    this.bodyIdCounter = 0
    this.jointIdCounter = 0
    this.shapeIdCounter = 0
  }

  /**
   * Initialize Rapier
   */
  async initialize() {
    // In a real implementation, this would load the Rapier WebAssembly module
    // For this example, we'll just simulate its existence
    this.rapier = {
      // Simulated Rapier API
    }

    return true
  }

  // Rapier-specific implementation would go here...
}

// Example of a B2World class for the Box2D simulation
class B2World {
  constructor(gravity) {
    this.gravity = gravity
    this.bodies = []
    this.joints = []
    this.contactListener = null
  }

  Step(timeStep, velocityIterations, positionIterations) {
    // Simulate Box2D step
  }

  ClearForces() {
    // Simulate clearing forces
  }

  SetContactListener(listener) {
    this.contactListener = listener
  }

  CreateBody(bodyDef) {
    // Simulate creating a Box2D body
    const body = {
      userData: bodyDef.userData,
      fixtures: [],
      GetPosition: () => bodyDef.position,
      SetPosition: (pos) => {
        bodyDef.position = pos
      },
      GetAngle: () => bodyDef.angle,
      SetAngle: (angle) => {
        bodyDef.angle = angle
      },
      GetLinearVelocity: () => bodyDef.linearVelocity,
      SetLinearVelocity: (vel) => {
        bodyDef.linearVelocity = vel
      },
      GetAngularVelocity: () => bodyDef.angularVelocity,
      SetAngularVelocity: (vel) => {
        bodyDef.angularVelocity = vel
      },
      ApplyForce: (force, point) => {},
      ApplyLinearImpulse: (impulse, point) => {},
      ApplyTorque: (torque) => {},
      GetWorldCenter: () => bodyDef.position,
      SetAwake: (awake) => {},
      CreateFixture: (fixtureDef) => {
        const fixture = {
          shape: fixtureDef.shape,
          density: fixtureDef.density,
          friction: fixtureDef.friction,
          restitution: fixtureDef.restitution,
          isSensor: fixtureDef.isSensor,
          filter: fixtureDef.filter,
          userData: fixtureDef.userData,
          GetBody: () => body,
        }
        body.fixtures.push(fixture)
        return fixture
      },
    }

    this.bodies.push(body)
    return body
  }

  DestroyBody(body) {
    const index = this.bodies.indexOf(body)
    if (index !== -1) {
      this.bodies.splice(index, 1)
    }
  }

  CreateJoint(jointDef) {
    // Simulate creating a Box2D joint
    const joint = {
      userData: jointDef.userData,
      GetAnchorA: () => jointDef.anchorA || { x: 0, y: 0 },
      GetAnchorB: () => jointDef.anchorB || { x: 0, y: 0 },
      GetReactionForce: () => ({ x: 0, y: 0 }),
      GetReactionTorque: () => 0,
      GetJointAngle: () => 0,
      GetJointSpeed: () => 0,
      IsLimitEnabled: () => jointDef.enableLimit || false,
      EnableLimit: () => {},
      GetLowerLimit: () => jointDef.lowerAngle || 0,
      GetUpperLimit: () => jointDef.upperAngle || 0,
      SetLimits: () => {},
      IsMotorEnabled: () => jointDef.enableMotor || false,
      EnableMotor: () => {},
      SetMotorSpeed: () => {},
      GetMotorSpeed: () => jointDef.motorSpeed || 0,
      SetMaxMotorTorque: () => {},
      GetMotorTorque: () => 0,
    }

    this.joints.push(joint)
    return joint
  }

  DestroyJoint(joint) {
    const index = this.joints.indexOf(joint)
    if (index !== -1) {
      this.joints.splice(index, 1)
    }
  }
}
