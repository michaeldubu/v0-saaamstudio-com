/**
 * SAM.dev - Main Entry Point
 * Self-Adaptive Model for Dynamic UI Generation
 */

import { ConceptMemoryBank } from "./concept_bank.js"
import { DynamicSegmentation } from "./segmentation.js"
import { ThoughtState } from "./thought_state.js"
import { ConceptualDreaming } from "./dream_engine.js"

/**
 * Main SAM class that orchestrates all components
 */
export class SAM {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      conceptDim: 768,
      thoughtDim: 1024,
      initialCharDim: 256,
      initialHiddenDim: 768,
      maxSegmentLength: 16,
      minSegmentFrequency: 5,
      multimodalEnabled: true,
      ...config,
    }

    // Initialize core components
    this.conceptBank = new ConceptMemoryBank({
      conceptDim: this.config.conceptDim,
      initialSize: 10000,
      growthRate: 1000,
    })

    this.segmentation = new DynamicSegmentation(this.config, this.conceptBank)

    this.thoughtState = new ThoughtState({
      conceptDim: this.config.conceptDim,
      thoughtDim: this.config.thoughtDim,
      maxThoughtDepth: 8,
      superpositionStates: 4,
    })

    this.dreamEngine = new ConceptualDreaming(this, {
      dreamBatchSize: 4,
      maxGenLength: 128,
      cycleTimeMs: 1000,
    })

    // State tracking
    this.initialized = false
    this.processing = false
    this.stats = {
      totalProcessed: 0,
      conceptsCreated: 0,
      dreamCycles: 0,
    }
  }

  /**
   * Initialize SAM with optional vocabulary
   */
  async initialize(vocabulary = null) {
    if (this.initialized) {
      return true
    }

    console.log("Initializing SAM.dev...")

    // Load vocabulary if provided
    if (vocabulary && Array.isArray(vocabulary)) {
      const loaded = this.conceptBank.loadVocabulary(vocabulary)
      console.log(`Loaded ${loaded} vocabulary concepts`)
    }

    // Initialize thought state
    this.thoughtState.reset(1)

    this.initialized = true
    console.log("SAM.dev initialized successfully")

    return true
  }

  /**
   * Process text input and return concept analysis
   */
  async processText(text, options = {}) {
    if (!this.initialized) {
      await this.initialize()
    }

    if (this.processing) {
      console.warn("SAM is already processing. Please wait...")
      return null
    }

    this.processing = true

    try {
      // Segment text into concepts
      const conceptIds = this.segmentation.segment(text, {
        modality: options.modality || "text",
      })

      // Get concept embeddings
      const conceptEmbeddings = []
      for (const conceptId of conceptIds) {
        if (Array.isArray(conceptId)) {
          // Handle character-level concepts
          const charEmbeddings = conceptId.map((id) => this.conceptBank.getConceptEmbedding(id)).filter(Boolean)
          if (charEmbeddings.length > 0) {
            conceptEmbeddings.push(charEmbeddings)
          }
        } else {
          const embedding = this.conceptBank.getConceptEmbedding(conceptId)
          if (embedding) {
            conceptEmbeddings.push([embedding])
          }
        }
      }

      // Update thought state
      if (conceptEmbeddings.length > 0) {
        this.thoughtState.update(conceptEmbeddings, {
          modality: options.modality || "text",
        })
      }

      // Update stats
      this.stats.totalProcessed++

      // Return analysis
      const result = {
        originalText: text,
        conceptIds: conceptIds,
        conceptCount: conceptIds.length,
        thoughtDepth: this.thoughtState.thoughtDepth,
        segmentationStats: this.segmentation.getSegmentationStats(),
        conceptStats: this.conceptBank.getConceptStats(),
      }

      return result
    } catch (error) {
      console.error("Error processing text:", error)
      return {
        error: error.message,
        originalText: text,
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * Generate text based on current thought state
   */
  async generateText(prompt = "", options = {}) {
    if (!this.initialized) {
      await this.initialize()
    }

    // Process prompt first if provided
    if (prompt) {
      await this.processText(prompt, options)
    }

    // Get thought context
    const thoughtContext = this.thoughtState.getThoughtContext()

    // Project back to concept space
    const conceptProjection = this.thoughtState.projectToConceptSpace()

    // Simple generation based on frequent patterns
    const patterns = this.segmentation.patternMemory.getFrequentPatterns({
      limit: 10,
      modality: options.modality || "text",
    })

    let generated = prompt

    // Add patterns to generate text
    for (let i = 0; i < Math.min(3, patterns.length); i++) {
      const [pattern, frequency] = patterns[i]
      if (typeof pattern === "string" && pattern.length > 1) {
        generated += " " + pattern
      }
    }

    return {
      generated: generated,
      thoughtDepth: this.thoughtState.thoughtDepth,
      patternsUsed: patterns.slice(0, 3),
    }
  }

  /**
   * Start dreaming process
   */
  startDreaming(durationMs = 10000) {
    if (!this.initialized) {
      console.warn("SAM must be initialized before dreaming")
      return false
    }

    console.log(`Starting dream cycle for ${durationMs}ms...`)

    const dreamResult = this.dreamEngine.dreamCycle(durationMs)

    this.stats.dreamCycles += dreamResult.dreamCycles

    console.log("Dream cycle completed:", dreamResult)

    return dreamResult
  }

  /**
   * Get current SAM statistics
   */
  getStats() {
    return {
      ...this.stats,
      conceptStats: this.conceptBank.getConceptStats(),
      segmentationStats: this.segmentation.getSegmentationStats(),
      thoughtDepth: this.thoughtState.thoughtDepth,
      initialized: this.initialized,
      processing: this.processing,
    }
  }

  /**
   * Reset SAM to initial state
   */
  reset() {
    this.thoughtState.reset(1)
    this.segmentation.segmentCache.clear()
    this.stats = {
      totalProcessed: 0,
      conceptsCreated: 0,
      dreamCycles: 0,
    }

    console.log("SAM reset to initial state")
  }
}

// Create global SAM instance for demo
let globalSAM = null

/**
 * Get or create the global SAM instance
 */
export function getSAM() {
  if (!globalSAM) {
    globalSAM = new SAM({
      conceptDim: 768,
      thoughtDim: 1024,
      multimodalEnabled: true,
    })
  }
  return globalSAM
}

/**
 * Demo function for testing SAM
 */
export async function runDemo() {
  console.log("=== SAM.dev Demo ===")

  const sam = getSAM()

  // Initialize
  await sam.initialize([
    "hello",
    "world",
    "the",
    "quick",
    "brown",
    "fox",
    "jumps",
    "over",
    "lazy",
    "dog",
    "artificial",
    "intelligence",
    "machine",
    "learning",
    "neural",
    "network",
    "concept",
    "thought",
    "dream",
    "evolve",
    "adapt",
    "understand",
  ])

  // Process some text
  console.log("\n1. Processing text...")
  const result1 = await sam.processText("Hello world, this is SAM learning to understand concepts.")
  console.log("Result:", result1)

  // Process more text
  console.log("\n2. Processing more text...")
  const result2 = await sam.processText("Neural networks can learn and adapt through experience.")
  console.log("Result:", result2)

  // Generate text
  console.log("\n3. Generating text...")
  const generated = await sam.generateText("The concept of")
  console.log("Generated:", generated)

  // Run dream cycle
  console.log("\n4. Running dream cycle...")
  const dreamResult = sam.startDreaming(5000)
  console.log("Dream result:", dreamResult)

  // Show final stats
  console.log("\n5. Final statistics:")
  const stats = sam.getStats()
  console.log("Stats:", stats)

  return {
    sam,
    results: [result1, result2],
    generated,
    dreamResult,
    stats,
  }
}

// Auto-run demo if this is the main module
if (typeof window !== "undefined") {
  // Browser environment
  window.SAM = SAM
  window.getSAM = getSAM
  window.runDemo = runDemo

  // Auto-run demo after a short delay
  setTimeout(() => {
    runDemo()
      .then((result) => {
        console.log("Demo completed successfully!")
        window.demoResult = result
      })
      .catch((error) => {
        console.error("Demo failed:", error)
      })
  }, 1000)
}
