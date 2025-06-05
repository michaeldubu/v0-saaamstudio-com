/**
 * Popup-compatible SAAAM System Initializer
 * Simplified version that works in popup windows
 */

// Simple system status tracking
const systemStatus = {
  initialized: false,
  systems: {
    runtime: false,
    compiler: false,
    interpreter: false,
    basic3d: false,
  },
}

// Basic SAAAM API for popup compatibility
export function initializePopupSAAM() {
  if (typeof window === "undefined") return false

  try {
    // Create a minimal SAAAM object for popup compatibility
    window.SAAAM = {
      // Basic drawing functions
      drawRectangle: (x: number, y: number, width: number, height: number, color: string) => {
        // Will be implemented by runtime
      },
      drawCircle: (x: number, y: number, radius: number, color: string) => {
        // Will be implemented by runtime
      },
      drawText: (text: string, x: number, y: number, color: string, font?: string) => {
        // Will be implemented by runtime
      },
      drawLine: (x1: number, y1: number, x2: number, y2: number, color: string) => {
        // Will be implemented by runtime
      },

      // Input functions
      keyboardCheck: (keyCode: number) => false,
      keyboardCheckPressed: (keyCode: number) => false,
      mousePressed: () => false,
      mouseX: () => 0,
      mouseY: () => 0,

      // Lifecycle functions
      registerCreate: (fn: Function) => {},
      registerStep: (fn: Function) => {},
      registerDraw: (fn: Function) => {},

      // Constants
      vk: {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
        space: 32,
        enter: 13,
        escape: 27,
        a: 65,
        s: 83,
        d: 68,
        w: 87,
      },

      // Utility functions
      random: (min: number, max: number) => Math.random() * (max - min) + min,
      randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      distance: (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),

      // System status
      getSystemStatus: () => ({ ...systemStatus }),
    }

    systemStatus.systems.runtime = true
    systemStatus.initialized = true

    // Dispatch initialization event
    window.dispatchEvent(
      new CustomEvent("saaam-popup-initialized", {
        detail: { systems: systemStatus.systems },
      }),
    )

    console.log("SAAAM Popup systems initialized")
    return true
  } catch (error) {
    console.error("Failed to initialize SAAAM popup systems:", error)
    return false
  }
}

export function getSaaamPopupStatus() {
  return { ...systemStatus }
}

// Auto-initialize when loaded
if (typeof window !== "undefined") {
  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePopupSAAM)
  } else {
    initializePopupSAAM()
  }
}
