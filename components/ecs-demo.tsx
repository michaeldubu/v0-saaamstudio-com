"use client"

import { useState, useEffect, useRef } from "react"
import {
  World,
  TransformComponent,
  SpriteRendererComponent,
  RigidbodyComponent,
  PhysicsSystem,
  RenderingSystem,
} from "@/lib/component-pool"

export default function ECSDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<World | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [entityCount, setEntityCount] = useState(0)
  const [fps, setFps] = useState(0)

  // Initialize ECS world
  useEffect(() => {
    const world = new World()
    worldRef.current = world

    // Register components
    world.registerComponent(TransformComponent)
    world.registerComponent(SpriteRendererComponent)
    world.registerComponent(RigidbodyComponent)

    // Register systems
    const physicsSystem = new PhysicsSystem(world)
    world.registerSystem(physicsSystem)

    const renderingSystem = new RenderingSystem(world)
    world.registerSystem(renderingSystem)

    // Initialize world
    world.initialize()

    return () => {
      world.dispose()
    }
  }, [])

  // Setup rendering
  useEffect(() => {
    if (!canvasRef.current || !worldRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const world = worldRef.current

    if (!ctx) return

    // Create a simple renderer
    const renderer = {
      beginBatch: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      },
      drawSprite: (
        sprite: any,
        x: number,
        y: number,
        width: number,
        height: number,
        rotation: number,
        color: any,
        options: any,
      ) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.fillStyle = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a})`
        ctx.fillRect(-width / 2, -height / 2, width, height)
        ctx.restore()
      },
      flushBatch: () => {
        // Nothing to do for this simple renderer
      },
    }

    // Set renderer for the rendering system
    const renderingSystem = world.systems.find((s) => s instanceof RenderingSystem) as RenderingSystem
    if (renderingSystem) {
      renderingSystem.setRenderer(renderer)
    }

    // Create some entities
    for (let i = 0; i < 10; i++) {
      createRandomEntity(world)
    }

    setEntityCount(10)
  }, [canvasRef.current, worldRef.current])

  // Animation loop
  useEffect(() => {
    if (!isRunning || !worldRef.current) return

    let lastTime = performance.now()
    let frameCount = 0
    let lastFpsUpdate = lastTime

    const animate = (time: number) => {
      if (!worldRef.current) return

      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      // Update FPS counter
      frameCount++
      if (time - lastFpsUpdate > 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsUpdate)))
        frameCount = 0
        lastFpsUpdate = time
      }

      // Update world
      worldRef.current.update(deltaTime)

      animationRef.current = requestAnimationFrame(animate)
    }

    const animationRef = { current: requestAnimationFrame(animate) }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning])

  // Create a random entity
  const createRandomEntity = (world: World) => {
    const entityId = world.createEntity(`Entity_${Math.floor(Math.random() * 1000)}`)

    // Add transform component
    world.addComponent(entityId, TransformComponent, {
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0,
        z: Math.random() * Math.PI * 2,
      },
      scale: {
        x: Math.random() * 0.5 + 0.5,
        y: Math.random() * 0.5 + 0.5,
        z: 1,
      },
    })

    // Add sprite renderer component
    world.addComponent(entityId, SpriteRendererComponent, {
      width: 40,
      height: 40,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: 1,
      },
    })

    // Add rigidbody component
    world.addComponent(entityId, RigidbodyComponent, {
      velocity: {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
      },
    })

    return entityId
  }

  // Add more entities
  const handleAddEntities = () => {
    if (!worldRef.current) return

    for (let i = 0; i < 10; i++) {
      createRandomEntity(worldRef.current)
    }

    setEntityCount((prev) => prev + 10)
  }

  // Toggle simulation
  const toggleSimulation = () => {
    setIsRunning((prev) => !prev)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">Entity Component System Demo</h1>

      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          onClick={toggleSimulation}
        >
          {isRunning ? "Stop Simulation" : "Start Simulation"}
        </button>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={handleAddEntities}>
          Add 10 Entities
        </button>
      </div>

      <div className="flex space-x-4 mb-4 text-sm">
        <div>Entities: {entityCount}</div>
        <div>FPS: {fps}</div>
      </div>

      <div className="flex-1 bg-black flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={600} className="border border-gray-700" />
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>This demo shows the Entity Component System architecture in action.</p>
        <p>Each entity has Transform, SpriteRenderer, and Rigidbody components.</p>
        <p>The Physics system updates positions based on velocities, and the Rendering system draws the entities.</p>
      </div>
    </div>
  )
}
