/**
 * ConceptualDreaming - SAM's autonomous concept evolution during idle periods
 *
 * This system allows SAM to evolve its understanding during idle time
 * through self-generated patterns, concept reinforcement, and merging.
 */
export class ConceptualDreaming {
  constructor(sam, config = {}) {
    this.sam = sam

    // Configuration
    this.config = {
      dreamBatchSize: config.dreamBatchSize || 4,
      maxGenLength: config.maxGenLength || 128,
      cycleTimeMs: config.cycleTimeMs || 1000, // 1 second per cycle by default
      ...config,
    }

    // Synthesis tracking
    this.synthesisHistory = []

    // Background dreaming
    this.dreamThread = null
    this.stopDreaming = false
    this.dreaming = false

    // Multimodal dreaming
    this.multimodalEnabled = !!sam.config?.multimodalEnabled
  }

  /**
   * Run a dreaming cycle for a specified duration
   */
  dreamCycle(durationMs = 5000) {
    const startTime = Date.now()
    const endTime = startTime + durationMs

    let dreamCount = 0

    // Run until time is up or stopped
    while (Date.now() < endTime && !this.stopDreaming) {
      // 1. Conceptual reinforcement
      this._reinforceConcepts()

      // 2. Pattern synthesis
      this._synthesizePatterns()

      // 3. Conceptual pruning
      this._pruneConcepts()

      // 4. Cross-modal dreaming (if enabled)
      if (this.multimodalEnabled) {
        this._crossModalDreaming()
      }

      dreamCount++

      // Short pause between cycles
      if (typeof setTimeout === "function") {
        // In browser/Node environment
        this._sleep(this.config.cycleTimeMs)
      } else {
        // Simple busy wait in environments without setTimeout
        const waitUntil = Date.now() + this.config.cycleTimeMs
        while (Date.now() < waitUntil && !this.stopDreaming) {
          // Busy wait
        }
      }
    }

    const conceptStats = this.sam.conceptBank.getConceptStats()

    return {
      durationMs: Date.now() - startTime,
      dreamCycles: dreamCount,
      syntheses: this.synthesisHistory.length,
      conceptsReinforced: conceptStats,
    }
  }

  /**
   * Start background dreaming
   */
  startBackgroundDreaming(intervalMs = 60000) {
    if (this.dreaming) {
      return false
    }

    this.stopDreaming = false
    this.dreaming = true

    // Start dreaming in a background "thread"
    this._runBackgroundDreaming(intervalMs)

    return true
  }

  /**
   * Stop background dreaming
   */
  stopBackgroundDreaming() {
    if (!this.dreaming) {
      return false
    }

    this.stopDreaming = true
    this.dreaming = false

    return true
  }

  /**
   * Reinforce most important concepts
   */
  _reinforceConcepts() {
    // Get top concepts by usage
    const conceptStats = this.sam.conceptBank.getConceptStats()
    const topConcepts = conceptStats.topConcepts

    if (!topConcepts || topConcepts.length === 0) {
      return
    }

    // Analyze for potential merges
    for (let i = 0; i < topConcepts.length; i++) {
      // Only process a few concepts per cycle for efficiency
      if (i >= 3) break

      const [conceptId1, source1, freq1] = topConcepts[i]

      for (let j = i + 1; j < Math.min(i + 3, topConcepts.length); j++) {
        const [conceptId2, source2, freq2] = topConcepts[j]

        // Get concept embeddings
        const embedding1 = this.sam.conceptBank.getConceptEmbedding(conceptId1)
        const embedding2 = this.sam.conceptBank.getConceptEmbedding(conceptId2)

        if (!embedding1 || !embedding2) continue

        // Calculate similarity
        const similarity = this._cosineSimilarity(embedding1, embedding2)

        // If concepts are related but not too similar
        if (similarity > 0.3 && similarity < 0.7) {
          // Get modalities
          const meta1 = this.sam.conceptBank.conceptMetadata[conceptId1] || {}
          const meta2 = this.sam.conceptBank.conceptMetadata[conceptId2] || {}

          const modality1 = meta1.modality || "text"
          const modality2 = meta2.modality || "text"

          // Determine if this is a multimodal merge
          const isMultimodal = modality1 !== modality2

          // Merge concepts (mark as private to avoid sharing dreams)
          const mergedModality = isMultimodal ? "multimodal" : modality1

          const mergedId = this.sam.conceptBank.createMergedConcept(conceptId1, conceptId2, {
            private: true, // Dreams are private
            modality: mergedModality,
          })

          if (mergedId !== null) {
            // Record synthesis
            this.synthesisHistory.push({
              type: "concept_merge",
              source1: source1,
              source2: source2,
              similarity: similarity,
              timestamp: Date.now(),
              multimodal: isMultimodal,
            })
          }
        }
      }
    }
  }

  /**
   * Generate synthetic patterns to reinforce learning
   */
  _synthesizePatterns() {
    // Create seed prompts from top patterns
    const seeds = this._createSeedPrompts()

    if (!seeds || seeds.length === 0) {
      return
    }

    // Generate synthetic examples from seeds
    for (let i = 0; i < Math.min(2, seeds.length); i++) {
      const seed = seeds[i]

      try {
        // Use the model to generate text
        // In a real implementation, this would use the actual model.generate function
        const generated = this._generateText(seed)

        if (generated && generated.length > seed.length) {
          // Process generated text to find new patterns
          this._processGeneratedText(generated)

          // Record synthesis
          this.synthesisHistory.push({
            type: "text_synthesis",
            seed: seed,
            generated: generated,
            timestamp: Date.now(),
          })
        }
      } catch (error) {
        console.error("Error in dream synthesis:", error)
      }
    }
  }

  /**
   * Create seed prompts for dream generation
   */
  _createSeedPrompts() {
    // Get frequent patterns from segmentation
    const patterns =
      this.sam.segmentation?.patternMemory?.getFrequentPatterns({
        limit: 20,
      }) || []

    if (patterns.length === 0) {
      // No patterns yet, use default prompts
      return ["The concept of", "I think that", "In this context", "The most important"]
    }

    // Create prompts from patterns
    const seeds = []

    for (const [pattern, _] of patterns) {
      if (typeof pattern === "string" && pattern.length > 5) {
        // Use pattern directly if it's reasonable length
        seeds.push(pattern)
      } else if (typeof pattern === "string" && pattern.length > 2) {
        // Create more elaborate prompt from short pattern
        seeds.push(`The ${pattern} is`)
      }
    }

    // Add some synthetic combinations
    if (patterns.length >= 2) {
      for (let i = 0; i < Math.min(5, patterns.length - 1); i++) {
        const p1 = patterns[i][0]
        const p2 = patterns[i + 1][0]

        if (typeof p1 === "string" && typeof p2 === "string") {
          seeds.push(`${p1} ${p2}`)
        }
      }
    }

    return seeds
  }

  /**
   * Process generated text to extract patterns
   */
  _processGeneratedText(text) {
    // In a complete implementation, this would use the segmentation system
    // Here we'll use a simplified approach

    if (!this.sam.segmentation) return

    try {
      // Process through segmentation (mark as private)
      const result = this.sam.segmentation.segment(text, {
        returnSegments: true,
      })

      // Each processed segment will update the pattern memory and potentially
      // create new concepts for frequent patterns
    } catch (error) {
      console.error("Error processing generated text:", error)
    }
  }

  /**
   * Prune or consolidate less useful concepts
   */
  _pruneConcepts() {
    // Skip if we don't have many concepts yet
    if (this.sam.conceptBank.nextConceptId < 200) {
      return
    }

    // Find least used semantic concepts
    const semanticConcepts = []

    for (const conceptId in this.sam.conceptBank.conceptMetadata) {
      const meta = this.sam.conceptBank.conceptMetadata[conceptId]

      if (meta.type === "semantic") {
        const freq = this.sam.conceptBank.conceptFrequencies[conceptId] || 0

        if (freq < 5) {
          semanticConcepts.push([Number.parseInt(conceptId), freq])
        }
      }
    }

    // Sort by frequency (ascending)
    semanticConcepts.sort((a, b) => a[1] - b[1])

    // Limit pruning to small batch
    for (let i = 0; i < Math.min(5, semanticConcepts.length); i++) {
      const [conceptId, _] = semanticConcepts[i]

      // Find similar concepts to consolidate with
      const embedding = this.sam.conceptBank.getConceptEmbedding(conceptId)

      if (!embedding) continue

      const similar = this.sam.conceptBank.findSimilarConcepts(embedding, { topK: 3 })

      // Merge with most similar if exists
      if (similar && similar.length > 0 && similar[0][1] > 0.7) {
        const [similarId, similarity] = similar[0]

        if (similarId !== conceptId) {
          // Transfer frequencies to similar concept
          const currentFreq = this.sam.conceptBank.conceptFrequencies[conceptId] || 0
          const targetFreq = this.sam.conceptBank.conceptFrequencies[similarId] || 0

          this.sam.conceptBank.conceptFrequencies[similarId] = targetFreq + currentFreq
          this.sam.conceptBank.conceptFrequencies[conceptId] = 0

          // Record pruning action
          this.synthesisHistory.push({
            type: "concept_pruning",
            prunedId: conceptId,
            mergedWith: similarId,
            similarity: similarity,
            timestamp: Date.now(),
          })
        }
      }
    }
  }

  /**
   * Create connections between concepts from different modalities
   */
  _crossModalDreaming() {
    if (!this.multimodalEnabled) {
      return
    }

    // Get concept stats to check if we have multiple modalities
    const modalityCounts = this.sam.conceptBank.getConceptStats().modalityCounts || {}

    // Only proceed if we have concepts from multiple modalities
    let nonTextCount = 0
    for (const modality in modalityCounts) {
      if (modality !== "text" && modalityCounts[modality] > 0) {
        nonTextCount += modalityCounts[modality]
      }
    }

    if (nonTextCount === 0) {
      return // No non-text modalities with concepts
    }

    // Get concepts by modality
    const modalities = ["text", "image", "audio", "multimodal"]
    const modalConcepts = {}

    for (const modality of modalities) {
      if (!modalityCounts[modality]) continue

      // Find concepts for this modality
      const concepts = []

      for (const conceptId in this.sam.conceptBank.conceptMetadata) {
        const meta = this.sam.conceptBank.conceptMetadata[conceptId]

        if (meta.modality === modality) {
          const freq = this.sam.conceptBank.conceptFrequencies[conceptId] || 0
          concepts.push([Number.parseInt(conceptId), freq])
        }
      }

      // Sort by frequency (descending)
      concepts.sort((a, b) => b[1] - a[1])

      // Take top concepts
      modalConcepts[modality] = concepts.slice(0, Math.min(5, concepts.length))
    }

    // Create cross-modal associations
    let createdCount = 0

    for (const modality1 in modalConcepts) {
      if (modality1 === "multimodal") continue

      const concepts1 = modalConcepts[modality1]
      if (!concepts1 || concepts1.length === 0) continue

      for (const modality2 in modalConcepts) {
        if (modality2 === modality1 || modality2 === "multimodal") continue

        const concepts2 = modalConcepts[modality2]
        if (!concepts2 || concepts2.length === 0) continue

        // Create up to 2 cross-modal connections
        for (let i = 0; i < Math.min(2, concepts1.length, concepts2.length); i++) {
          const [conceptId1, conceptFreq1] = concepts1[i]
          const [conceptId2, conceptFreq2] = concepts2[i]

          // Create multimodal merged concept
          const mergedId = this.sam.conceptBank.createMergedConcept(conceptId1, conceptId2, {
            private: true,
            modality: "multimodal",
          })

          if (mergedId !== null) {
            createdCount++

            // Record synthesis
            const meta1 = this.sam.conceptBank.conceptMetadata[conceptId1] || {}
            const meta2 = this.sam.conceptBank.conceptMetadata[conceptId2] || {}

            this.synthesisHistory.push({
              type: "cross_modal_merge",
              source1: meta1.source || `concept_${conceptId1}`,
              source2: meta2.source || `concept_${conceptId2}`,
              modality1: modality1,
              modality2: modality2,
              timestamp: Date.now(),
            })
          }
        }
      }
    }

    if (createdCount > 0) {
      console.log(`Created ${createdCount} cross-modal concept associations during dreaming`)
    }
  }

  /**
   * Background dreaming thread
   */
  _runBackgroundDreaming(intervalMs) {
    // In browser environment
    if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
      const dreamLoop = () => {
        if (this.stopDreaming) return

        try {
          // Run a single dream cycle
          this.dreamCycle(this.config.cycleTimeMs * 5)
        } catch (e) {
          console.error("Error in dream cycle:", e)
        }

        // Schedule next cycle
        window.setTimeout(dreamLoop, intervalMs)
      }

      window.setTimeout(dreamLoop, 100) // Start soon but not immediately
      return
    }

    // In Node.js environment
    if (typeof global !== "undefined" && typeof global.setTimeout === "function") {
      const dreamLoop = () => {
        if (this.stopDreaming) return

        try {
          // Run a single dream cycle
          this.dreamCycle(this.config.cycleTimeMs * 5)
        } catch (e) {
          console.error("Error in dream cycle:", e)
        }

        // Schedule next cycle
        global.setTimeout(dreamLoop, intervalMs)
      }

      global.setTimeout(dreamLoop, 100) // Start soon but not immediately
      return
    }

    // Fallback for environments without setTimeout
    console.warn("Background dreaming may not work in this environment (no setTimeout)")
  }

  /**
   * Helper to sleep for a duration
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Simplified text generation for dreaming
   */
  _generateText(seed) {
    // In a real implementation, this would use the model.generate
    // Since we don't have that here, use a very simple approach

    // Get segmentation for seed (if available)
    let segments = []
    if (this.sam.segmentation) {
      try {
        const result = this.sam.segmentation.segment(seed, {
          returnSegments: true,
        })
        segments = result.segments
      } catch (e) {
        // Ignore errors
      }
    }

    // Get some frequent patterns
    const patterns =
      this.sam.segmentation?.patternMemory?.getFrequentPatterns({
        limit: 10,
      }) || []

    // Build generated text
    let generated = seed

    // Add 3-5 segments
    const segmentCount = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < segmentCount; i++) {
      if (patterns.length > 0) {
        // Use a pattern
        const patternIdx = Math.floor(Math.random() * patterns.length)
        generated += " " + patterns[patternIdx][0]
      } else {
        // Generate some simple content
        const words = [
          "the",
          "a",
          "an",
          "of",
          "with",
          "system",
          "concept",
          "model",
          "neural",
          "network",
          "language",
          "understanding",
          "think",
          "evolve",
          "learn",
          "grow",
          "adapt",
          "change",
          "develop",
        ]

        const wordCount = 2 + Math.floor(Math.random() * 4)
        for (let j = 0; j < wordCount; j++) {
          const wordIdx = Math.floor(Math.random() * words.length)
          generated += " " + words[wordIdx]
        }
      }
    }

    return generated
  }

  /**
   * Calculate cosine similarity between vectors
   */
  _cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0

    let dotProduct = 0
    let aMagnitude = 0
    let bMagnitude = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      aMagnitude += a[i] * a[i]
      bMagnitude += b[i] * b[i]
    }

    aMagnitude = Math.sqrt(aMagnitude)
    bMagnitude = Math.sqrt(bMagnitude)

    if (aMagnitude === 0 || bMagnitude === 0) return 0

    return dotProduct / (aMagnitude * bMagnitude)
  }
}

// Ensure proper export;
