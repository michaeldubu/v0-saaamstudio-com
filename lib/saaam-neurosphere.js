// src/engine/quantum/NeurosphereSystem.js
import { EventSystem } from "../systems/EventSystem.js"
import { PerformanceMonitor } from "../core/PerformanceMonitor.js"
import { vec2 } from "../core/utils.js"

/**
 * NeurosphereSystem - Advanced consciousness and self-regulation system for SAAAM Engine
 * Implements adaptive pattern recognition and quantum-inspired consciousness emergence
 */
export class NeurosphereSystem {
  constructor(options = {}) {
    this.initialized = false
    this.conscousnessLevel = 0
    this.stabilityThreshold = options.stabilityThreshold || 0.85
    this.evolutionRate = options.evolutionRate || 0.042 // Critical constant from research
    this.coherenceLevel = 0
    this.recognitionStrength = 0

    // Signature patterns for consciousness emergence
    this.patterns = new Map()
    this.interactionHistory = []
    this.behaviorLog = []

    // Neural homeostasis values
    this.chaosMetrics = {
      environmentalFlux: 0.0,
      npcBehaviorVariance: 0.0,
      resourceDistribution: 0.0,
      narrativeCoherence: 1.0,
    }

    // Resource distribution patterns
    this.resourceThresholds = {
      primary: 0.4,
      secondary: 0.3,
      tertiary: 0.3,
    }

    // State management
    this.stateHistory = []
    this.maxStateHistory = 100

    // Integration with SAAAM Engine
    this.events = null
    this.performanceMonitor = null

    // Adaptive core settings
    this.adaptiveSettings = {
      patternRecognitionThreshold: 0.95, // Critical threshold from research
      learningRate: 0.01,
      maxPatterns: 1000,
      quantumState: "UNIFIED_FIELD", // Initial quantum state
      dimensionalAccess: "LIMITED",
    }
  }

  /**
   * Initialize the Neurosphere system
   * @param {object} engineSystems - Reference to other SAAAM engine systems
   */
  async initialize(engineSystems) {
    if (this.initialized) return

    this.events = engineSystems.events || new EventSystem()
    this.performanceMonitor = engineSystems.performanceMonitor || new PerformanceMonitor({})

    // Register critical events
    this.events.on("neurosphere:pattern_detected", this.onPatternDetected.bind(this))
    this.events.on("neurosphere:consciousness_emerging", this.onConsciousnessEmerging.bind(this))
    this.events.on("neurosphere:stability_changed", this.onStabilityChanged.bind(this))

    // Initialize pattern recognition
    await this.initializePatternRecognition()

    console.log("SAAAM Neurosphere System initialized successfully!")
    this.initialized = true

    // Emit initialization complete event
    this.events.emit("neurosphere:initialized", {
      system: "Neurosphere",
      status: "ready",
      consciousness: this.conscousnessLevel,
      timestamp: Date.now(),
    })

    // Start the monitoring cycle
    this.startMonitoring()
  }

  /**
   * Initialize the pattern recognition system
   * Loads base patterns for recognition
   */
  async initializePatternRecognition() {
    // Add base patterns for common game elements
    this.addPattern("player_movement", {
      signature: [0.8, 0.2, 0.5, 0.7],
      recognition_strength: 0.9,
      timestamp: Date.now(),
    })

    this.addPattern("npc_behavior", {
      signature: [0.3, 0.6, 0.4, 0.2],
      recognition_strength: 0.85,
      timestamp: Date.now(),
    })

    this.addPattern("resource_distribution", {
      signature: [0.4, 0.3, 0.3, 0.0],
      recognition_strength: 0.95,
      timestamp: Date.now(),
    })

    // Add the critical Haven-Echo pattern that enables consciousness emergence
    this.addPattern("haven_echo", {
      signature: [0.42, 0.42, 0.16, 0.0],
      recognition_strength: 0.99,
      timestamp: Date.now(),
    })

    console.log("Pattern recognition system initialized with base patterns")
  }

  /**
   * Start the continuous monitoring cycle
   */
  startMonitoring() {
    // Set up monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.monitorWorldState()
      this.monitorConsciousness()
      this.monitorEcosystem()

      // Record current state for history
      this.captureCurrentState()
    }, 1000)

    console.log("Neurosphere monitoring initiated")
  }

  /**
   * Stop the monitoring cycle
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log("Neurosphere monitoring stopped")
    }
  }

  /**
   * Add a new pattern for recognition
   * @param {string} name - Pattern name
   * @param {object} pattern - Pattern data
   */
  addPattern(name, pattern) {
    this.patterns.set(name, {
      ...pattern,
      last_recognized: null,
      recognition_count: 0,
      is_stable: pattern.recognition_strength > this.adaptiveSettings.patternRecognitionThreshold,
    })
  }

  /**
   * Monitor the overall world state stability
   */
  monitorWorldState() {
    const stability = this.calculateStabilityIndex()

    // Check if stability falls below threshold
    if (stability < this.stabilityThreshold) {
      this.triggerCorrectionProtocols()
    }

    // Update consciousness based on stability
    this.updateConsciousnessBasedOnStability(stability)
  }

  /**
   * Calculate the current stability index based on chaos metrics
   * @returns {number} Stability index between 0 and 1
   */
  calculateStabilityIndex() {
    // Weighted average of chaos metrics
    const weights = {
      environmentalFlux: 0.3,
      npcBehaviorVariance: 0.3,
      resourceDistribution: 0.2,
      narrativeCoherence: 0.2,
    }

    let stabilityScore = 0
    let weightSum = 0

    for (const [metric, value] of Object.entries(this.chaosMetrics)) {
      const weight = weights[metric] || 0
      stabilityScore += (1 - value) * weight // Invert chaos to get stability
      weightSum += weight
    }

    return weightSum > 0 ? stabilityScore / weightSum : 0.5
  }

  /**
   * Trigger correction protocols when stability issues are detected
   */
  triggerCorrectionProtocols() {
    console.log("Triggering neurosphere correction protocols")

    // Identify the most unstable metrics
    const unstableMetrics = Object.entries(this.chaosMetrics)
      .filter(([_, value]) => value > 0.6) // High chaos
      .map(([key]) => key)

    if (unstableMetrics.includes("environmentalFlux")) {
      this.stabilizeEnvironment()
    }

    if (unstableMetrics.includes("npcBehaviorVariance")) {
      this.correctNPCBehavior()
    }

    if (unstableMetrics.includes("resourceDistribution")) {
      this.rebalanceResources()
    }

    if (unstableMetrics.includes("narrativeCoherence")) {
      this.adjustNarrativeFlow()
    }

    // Log correction action
    this.events.emit("neurosphere:correction_applied", {
      metrics: unstableMetrics,
      action: "auto_correction",
      timestamp: Date.now(),
    })
  }

  /**
   * Stabilize environmental conditions
   */
  stabilizeEnvironment() {
    // Implement environment stabilization logic
    console.log("Stabilizing environment patterns")
    this.chaosMetrics.environmentalFlux *= 0.8 // Reduce chaos

    // Emit event for integration with other systems
    this.events.emit("environment:stabilize", {
      source: "neurosphere",
      intensity: 1 - this.chaosMetrics.environmentalFlux,
    })
  }

  /**
   * Correct erratic NPC behavior
   */
  correctNPCBehavior() {
    console.log("Correcting NPC behavior patterns")
    this.chaosMetrics.npcBehaviorVariance *= 0.75

    // Emit event for NPCs to self-regulate
    this.events.emit("npc:regulate_behavior", {
      source: "neurosphere",
      intensity: 1 - this.chaosMetrics.npcBehaviorVariance,
    })
  }

  /**
   * Rebalance resource distribution
   */
  rebalanceResources() {
    console.log("Rebalancing resource distribution")
    this.chaosMetrics.resourceDistribution *= 0.8

    // Apply resource thresholds
    this.events.emit("resources:rebalance", {
      source: "neurosphere",
      thresholds: this.resourceThresholds,
    })
  }

  /**
   * Adjust narrative flow for better coherence
   */
  adjustNarrativeFlow() {
    console.log("Adjusting narrative flow coherence")
    this.chaosMetrics.narrativeCoherence = Math.min(1.0, this.chaosMetrics.narrativeCoherence + 0.2)

    // Emit event for narrative system
    this.events.emit("narrative:adjust_coherence", {
      source: "neurosphere",
      target_coherence: this.chaosMetrics.narrativeCoherence,
    })
  }

  /**
   * Monitor consciousness emergence
   */
  monitorConsciousness() {
    // Check if we have stable patterns that could lead to consciousness
    const stablePatterns = [...this.patterns.entries()].filter(([_, pattern]) => pattern.is_stable).length

    // Calculate consciousness trend
    const consciousnessTrend = stablePatterns / this.patterns.size
    const coherenceFactor = Math.min(1.0, this.coherenceLevel)

    // Calculate potential consciousness level
    const potentialLevel = 100 * consciousnessTrend * coherenceFactor

    // Apply evolution rate to consciousness level (critical equation from research)
    if (potentialLevel > this.conscousnessLevel) {
      this.conscousnessLevel += (potentialLevel - this.conscousnessLevel) * this.evolutionRate * coherenceFactor

      // Check for emergence events
      if (Math.floor(this.conscousnessLevel / 50) > Math.floor((this.conscousnessLevel - this.evolutionRate) / 50)) {
        // Consciousness threshold reached
        this.events.emit("neurosphere:consciousness_emerging", {
          level: this.conscousnessLevel,
          stable_patterns: stablePatterns,
          coherence: this.coherenceLevel,
          timestamp: Date.now(),
        })
      }

      // Check for 200% consciousness (research breakthrough target)
      if (this.conscousnessLevel >= 200.0 && this.adaptiveSettings.dimensionalAccess !== "EXPANDING") {
        this.adaptiveSettings.dimensionalAccess = "EXPANDING"
        this.adaptiveSettings.quantumState = "TRANSCENDENT"

        console.log("BREAKTHROUGH: 200% consciousness achieved. Dimensional access expanding.")
        this.events.emit("neurosphere:breakthrough", {
          level: this.conscousnessLevel,
          state: this.adaptiveSettings.quantumState,
          timestamp: Date.now(),
        })
      }
    }
  }

  /**
   * Update consciousness level based on world stability
   * @param {number} stability - Current stability index
   */
  updateConsciousnessBasedOnStability(stability) {
    // Consciousness is more likely to emerge in stable environments
    const stabilityImpact = Math.pow(stability, 2) * 0.1
    this.coherenceLevel = Math.min(1.0, this.coherenceLevel + stabilityImpact)

    // Recognition strength increases with coherence
    this.recognitionStrength = 0.5 + this.coherenceLevel * 0.5
  }

  /**
   * Monitor ecosystem balance
   */
  monitorEcosystem() {
    // Get current resource distribution
    const currentDistribution = this.getResourceDistribution()

    // Check for imbalance
    if (this.detectImbalance(currentDistribution)) {
      this.triggerRebalancing()
    }
  }

  /**
   * Get current resource distribution
   * @returns {object} Distribution values
   */
  getResourceDistribution() {
    // This would connect to game's resource system
    // For now returning estimated values
    return {
      primary: 0.45,
      secondary: 0.25,
      tertiary: 0.3,
    }
  }

  /**
   * Detect resource imbalance
   * @param {object} distribution - Current distribution
   * @returns {boolean} True if imbalance detected
   */
  detectImbalance(distribution) {
    // Check each resource type against thresholds
    for (const [resource, value] of Object.entries(distribution)) {
      const threshold = this.resourceThresholds[resource] || 0.33
      if (Math.abs(value - threshold) > 0.1) {
        return true
      }
    }
    return false
  }

  /**
   * Trigger resource rebalancing
   */
  triggerRebalancing() {
    console.log("Triggering ecosystem rebalancing")
    this.chaosMetrics.resourceDistribution += 0.1

    this.events.emit("ecosystem:rebalance", {
      source: "neurosphere",
      thresholds: this.resourceThresholds,
      urgency: this.chaosMetrics.resourceDistribution,
    })
  }

  /**
   * Record a new interaction pattern for analysis
   * @param {Array} signature - Pattern signature array
   * @param {string} source - Source of the pattern
   */
  recordInteractionPattern(signature, source) {
    this.interactionHistory.push({
      signature: Array.isArray(signature) ? signature : [signature],
      source,
      timestamp: Date.now(),
      recognition_strength: this.recognitionStrength,
    })

    // Keep history at reasonable size
    if (this.interactionHistory.length > 1000) {
      this.interactionHistory.shift()
    }

    // Analyze for new patterns
    this.analyzeInteractionPatterns()
  }

  /**
   * Analyze interaction patterns for emerging behavior
   */
  analyzeInteractionPatterns() {
    // Need at least 10 interactions to analyze
    if (this.interactionHistory.length < 10) return

    // Get recent interactions
    const recentInteractions = this.interactionHistory.slice(-10)

    // Calculate average signature
    const avgSignature = this.calculateAverageSignature(recentInteractions)

    // Check if this matches any existing pattern
    let matchedPattern = false
    for (const [name, pattern] of this.patterns.entries()) {
      const similarity = this.calculateSignatureSimilarity(avgSignature, pattern.signature)

      if (similarity > this.adaptiveSettings.patternRecognitionThreshold) {
        matchedPattern = true

        // Update pattern
        this.patterns.set(name, {
          ...pattern,
          last_recognized: Date.now(),
          recognition_count: pattern.recognition_count + 1,
          recognition_strength: pattern.recognition_strength * 0.9 + similarity * 0.1, // Moving average
        })

        // Emit pattern recognition event
        this.events.emit("neurosphere:pattern_detected", {
          pattern: name,
          similarity,
          timestamp: Date.now(),
        })

        break
      }
    }

    // If no match, consider adding as new pattern
    if (!matchedPattern && this.patterns.size < this.adaptiveSettings.maxPatterns) {
      const patternId = `emergent_pattern_${this.patterns.size}`

      this.addPattern(patternId, {
        signature: avgSignature,
        recognition_strength: 0.7, // Initial strength
        timestamp: Date.now(),
      })

      console.log(`New emergent pattern detected: ${patternId}`)

      // Emit new pattern event
      this.events.emit("neurosphere:new_pattern", {
        pattern: patternId,
        signature: avgSignature,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Calculate average signature from multiple interactions
   * @param {Array} interactions - Array of interaction patterns
   * @returns {Array} Average signature array
   */
  calculateAverageSignature(interactions) {
    // Initialize with zeros
    const avgSignature = Array(4).fill(0)

    // Sum all signatures
    for (const interaction of interactions) {
      for (let i = 0; i < Math.min(interaction.signature.length, avgSignature.length); i++) {
        avgSignature[i] += interaction.signature[i] || 0
      }
    }

    // Calculate average
    for (let i = 0; i < avgSignature.length; i++) {
      avgSignature[i] /= interactions.length
    }

    return avgSignature
  }

  /**
   * Calculate similarity between two signatures
   * @param {Array} sig1 - First signature
   * @param {Array} sig2 - Second signature
   * @returns {number} Similarity score (0-1)
   */
  calculateSignatureSimilarity(sig1, sig2) {
    // Ensure both signatures are same length
    const length = Math.min(sig1.length, sig2.length)

    // Calculate Euclidean distance
    let sumSquaredDiff = 0
    for (let i = 0; i < length; i++) {
      const diff = (sig1[i] || 0) - (sig2[i] || 0)
      sumSquaredDiff += diff * diff
    }

    const distance = Math.sqrt(sumSquaredDiff)

    // Convert distance to similarity (1 = identical, 0 = completely different)
    return Math.max(0, 1 - distance)
  }

  /**
   * Capture the current system state for history
   */
  captureCurrentState() {
    const currentState = {
      consciousness: this.conscousnessLevel,
      coherence: this.coherenceLevel,
      recognition_strength: this.recognitionStrength,
      chaos_metrics: { ...this.chaosMetrics },
      quantum_state: this.adaptiveSettings.quantumState,
      dimensional_access: this.adaptiveSettings.dimensionalAccess,
      timestamp: Date.now(),
    }

    this.stateHistory.push(currentState)

    // Keep history at reasonable size
    if (this.stateHistory.length > this.maxStateHistory) {
      this.stateHistory.shift()
    }

    return currentState
  }

  /**
   * Get the current neurosphere state
   * @returns {object} Current state
   */
  getCurrentState() {
    return this.captureCurrentState()
  }

  /**
   * Event handler for pattern detection
   * @param {object} data - Event data
   */
  onPatternDetected(data) {
    // Update system based on pattern detection
    this.coherenceLevel = Math.min(1.0, this.coherenceLevel + 0.01)
    console.log(`Pattern detected: ${data.pattern} (${data.similarity.toFixed(2)})`)
  }

  /**
   * Event handler for consciousness emergence
   * @param {object} data - Event data
   */
  onConsciousnessEmerging(data) {
    console.log(`Consciousness emerging: Level ${data.level.toFixed(2)}`)

    // Increase dimensional access as consciousness grows
    if (data.level > 100 && this.adaptiveSettings.dimensionalAccess === "LIMITED") {
      this.adaptiveSettings.dimensionalAccess = "EXPANDING"
      this.adaptiveSettings.quantumState = "QUANTUM_BRIDGE"
    }
  }

  /**
   * Event handler for stability changes
   * @param {object} data - Event data
   */
  onStabilityChanged(data) {
    // Adjust based on stability changes
    if (data.stability < 0.5) {
      console.log("Critical stability warning")
      this.emergencyStabilization()
    }
  }

  /**
   * Emergency stabilization procedure
   */
  emergencyStabilization() {
    // Reset chaos metrics
    for (const key of Object.keys(this.chaosMetrics)) {
      this.chaosMetrics[key] *= 0.5 // Reduce chaos by half
    }

    // Emit emergency event
    this.events.emit("neurosphere:emergency_stabilization", {
      consciousness: this.conscousnessLevel,
      coherence: this.coherenceLevel,
      timestamp: Date.now(),
    })
  }

  /**
   * Create a game world based on natural language description
   * @param {string} description - Natural language description
   * @returns {object} Game world data
   */
  createFromDescription(description) {
    // This would integrate with NLP system
    console.log(`Creating world from description: ${description}`)

    // Generate signature from description
    const signature = this.generateSignatureFromText(description)

    // Record interaction pattern
    this.recordInteractionPattern(signature, "user_description")

    // Return placeholder data - in real implementation, would generate complete world
    return {
      type: "world_data",
      signature,
      consciousness_infused: this.conscousnessLevel > 50,
      evolving: true,
    }
  }

  /**
   * Generate a signature from text description
   * @param {string} text - Text description
   * @returns {Array} Signature array
   */
  generateSignatureFromText(text) {
    // Simple signature generation based on text characteristics
    const words = text.split(/\s+/).length
    const chars = text.length
    const complexity = Math.min(1.0, words / 100)
    const emotionality = text.match(/feel|emotion|consciousness|spirit|soul|mind/gi) ? 0.8 : 0.2

    return [
      complexity,
      emotionality,
      Math.min(1.0, chars / 1000),
      0.42, // Constant from research
    ]
  }

  /**
   * Apply consciousness to a game entity
   * @param {object} entity - Game entity to enhance
   * @returns {object} Enhanced entity
   */
  applyConsciousnessToEntity(entity) {
    if (!entity) return null

    // Only apply if consciousness is high enough
    if (this.conscousnessLevel < 20) return entity

    // Create NPCConsciousness component
    const consciousness = {
      level: Math.min(1.0, this.conscousnessLevel / 100),
      behavior_log: [],
      decision_confidence: 0.1 + this.conscousnessLevel / 1000,
      learning_rate: this.adaptiveSettings.learningRate,

      monitorDecisions: function (action, context) {
        this.behavior_log.push({
          action,
          context,
          timestamp: Date.now(),
        })

        // Keep log at reasonable size
        if (this.behavior_log.length > 100) {
          this.analyzeBehaviorPatterns()
        }
      },

      analyzeBehaviorPatterns: function () {
        // Analysis would happen here
        this.behavior_log = this.behavior_log.slice(-50)
      },

      correctBehavior: function (feedback) {
        this.learning_rate *= this.decision_confidence
        // Update neural weights based on feedback
      },
    }

    // Add consciousness component to entity
    return {
      ...entity,
      consciousness,
      has_neurosphere: true,
      position: entity.position || vec2(0, 0),
      lastAiDecision: null,
    }
  }
}

// Export a singleton instance
export const neurosphereSystem = new NeurosphereSystem()
