// Import the 3D engine classes
// We're using dynamic import to avoid issues with server-side rendering
let GameEngine3D: any
let Vector3: any
let Quaternion: any
let Matrix4: any
let GameObject3D: any
let Scene3D: any
let Camera3D: any
let Light: any
let Material: any
let Mesh: any
let Physics3D: any

// Flag to track if 3D engine is loaded
let is3DEngineLoaded = false

// Store 3D engine instances
const engine3DInstances = new Map()

/**
 * Load the 3D engine dynamically
 */
export async function load3DEngine() {
  if (typeof window === "undefined") return false

  try {
    // Dynamic import of the 3D engine
    const Engine3D = await import("./saaam-3d-engine")

    // Assign the imported classes
    GameEngine3D = Engine3D.GameEngine3D
    Vector3 = Engine3D.Vector3
    Quaternion = Engine3D.Quaternion
    Matrix4 = Engine3D.Matrix4
    GameObject3D = Engine3D.GameObject3D
    Scene3D = Engine3D.Scene3D
    Camera3D = Engine3D.Camera3D
    Light = Engine3D.Light
    Material = Engine3D.Material
    Mesh = Engine3D.Mesh
    Physics3D = Engine3D.Physics3D

    is3DEngineLoaded = true
    return true
  } catch (error) {
    console.error("Failed to load 3D engine:", error)
    return false
  }
}

/**
 * Initialize a 3D engine instance for a canvas
 * @param canvas The canvas element to render to
 * @param id Optional identifier for the engine instance
 * @returns The 3D engine instance or null if initialization failed
 */
export function initialize3DEngine(canvas: HTMLCanvasElement, id = "default") {
  if (!is3DEngineLoaded) {
    console.warn("3D engine not loaded. Call load3DEngine() first.")
    return null
  }

  try {
    const engine = new GameEngine3D(canvas)
    engine3DInstances.set(id, engine)
    return engine
  } catch (error) {
    console.error("Failed to initialize 3D engine:", error)
    return null
  }
}

/**
 * Get a 3D engine instance by ID
 * @param id The engine instance identifier
 * @returns The 3D engine instance or null if not found
 */
export function get3DEngine(id = "default") {
  return engine3DInstances.get(id) || null
}

/**
 * Create a bridge between 2D and 3D worlds
 * @param engine2D The 2D SAAAM engine instance
 * @param engine3D The 3D engine instance
 * @returns An object with methods to convert between 2D and 3D
 */
export function createEngineBridge(engine2D: any, engine3D: any) {
  return {
    // Convert 2D position to 3D position (z=0 plane)
    position2Dto3D: (x: number, y: number, z = 0) => {
      return new Vector3(x, y, z)
    },

    // Convert 3D position to 2D position (ignore z)
    position3Dto2D: (position: any) => {
      return { x: position.x, y: position.y }
    },

    // Create a 3D object from a 2D object
    create3DFromObject: (obj2D: any, z = 0) => {
      const obj3D = new GameObject3D(obj2D.id || "object")
      obj3D.transform.setPosition(obj2D.x || 0, obj2D.y || 0, z)

      // If the 2D object has width and height, create a plane
      if (obj2D.width && obj2D.height) {
        obj3D.setMesh(Mesh.createPlane(obj2D.width, obj2D.height))
      } else {
        // Default to a unit cube
        obj3D.setMesh(Mesh.createCube(1))
      }

      // If the 2D object has a color, use it
      if (obj2D.color) {
        const color = parseColor(obj2D.color)
        obj3D.setMaterial(Material.basic(color))
      }

      return obj3D
    },

    // Sync a 3D object's position with a 2D object
    syncObject2Dto3D: (obj2D: any, obj3D: any, z = 0) => {
      obj3D.transform.setPosition(obj2D.x || 0, obj2D.y || 0, z)

      // If the 2D object has rotation, apply it to the 3D object's z-axis
      if (obj2D.rotation !== undefined) {
        obj3D.transform.setRotation(0, 0, obj2D.rotation)
      }

      return obj3D
    },
  }
}

/**
 * Parse a CSS color string to RGB array
 * @param color The color string to parse
 * @returns RGB array [r, g, b] with values from 0 to 1
 */
function parseColor(color: string): number[] {
  // Default to white
  const defaultColor = [1, 1, 1]

  if (!color) return defaultColor

  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.substring(1)

    // #RGB format
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16) / 255
      const g = Number.parseInt(hex[1] + hex[1], 16) / 255
      const b = Number.parseInt(hex[2] + hex[2], 16) / 255
      return [r, g, b]
    }

    // #RRGGBB format
    if (hex.length === 6) {
      const r = Number.parseInt(hex.substring(0, 2), 16) / 255
      const g = Number.parseInt(hex.substring(2, 4), 16) / 255
      const b = Number.parseInt(hex.substring(4, 6), 16) / 255
      return [r, g, b]
    }
  }

  // Handle rgb/rgba colors
  if (color.startsWith("rgb")) {
    const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (match) {
      const r = Number.parseInt(match[1], 10) / 255
      const g = Number.parseInt(match[2], 10) / 255
      const b = Number.parseInt(match[3], 10) / 255
      return [r, g, b]
    }
  }

  return defaultColor
}

/**
 * Expose the 3D engine classes to the global SAAAM namespace
 */
export function expose3DToSAAAM() {
  if (!is3DEngineLoaded || typeof window === "undefined") return

  if (!window.SAAAM) window.SAAAM = {}

  // Add 3D namespace to SAAAM
  window.SAAAM.ThreeD = {
    Vector3,
    Quaternion,
    Matrix4,
    GameObject3D,
    Scene3D,
    Camera3D,
    Light,
    Material,
    Mesh,
    Physics3D,

    // Helper functions
    createEngine: (canvas: HTMLCanvasElement, id?: string) => initialize3DEngine(canvas, id),
    getEngine: (id?: string) => get3DEngine(id),
    createBridge: (engine2D: any, engine3D: any) => createEngineBridge(engine2D, engine3D),
  }
}

// Export 3D engine classes if loaded
export function get3DEngineClasses() {
  if (!is3DEngineLoaded) return null

  return {
    GameEngine3D,
    Vector3,
    Quaternion,
    Matrix4,
    GameObject3D,
    Scene3D,
    Camera3D,
    Light,
    Material,
    Mesh,
    Physics3D,
  }
}
