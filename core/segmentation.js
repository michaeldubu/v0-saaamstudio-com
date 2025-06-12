/**
 * DynamicSegmentation - Character to concept transformation system
 *
 * Replaces traditional tokenization with an adaptive boundary detection
 * system that evolves through usage.
 */
export class DynamicSegmentation {
  constructor(config, conceptBank) {
    // Dependencies
    this.conceptBank = conceptBank

    // Configuration
    this.config = {
      initialCharDim: config.initialCharDim || 256,
      initialHiddenDim: config.initialHiddenDim || 768,
      maxSegmentLength: config.maxSegmentLength || 16,
      minSegmentFrequency: config.minSegmentFrequency || 5,
      ...config,
    }

    // Character embeddings
    this.charEmbeddings = this._createCharEmbeddings()

    // Boundary detection model
    this.boundaryDetector = this._createBoundaryDetector()

    // Pattern recognition system
    this.patternMemory = new PatternMemory({
      capacity: config.patternMemoryCapacity || 10000,
      minFrequency: config.minSegmentFrequency || 5,
    })

    // Segment recognition cache
    this.segmentCache = new Map()

    // Multimodal components
    this.modalityDetectors = {
      image: this._createModalityDetector(),
      audio: this._createModalityDetector(),
    }

    // Current modality
    this.currentModality = "text"

    // Personalization flags
    this.privateContext = null
    this.inPrivateContext = false

    // Statistics
    this.totalSegmentations = 0
    this.cacheHits = 0
  }

  /**
   * Process raw character input into concept IDs
   */
  segment(charSequence, options = {}) {
    const returnSegments = options.returnSegments || false
    const modality = options.modality || this.currentModality

    // Update modality if specified
    if (modality && modality !== this.currentModality) {
      this.setModality(modality)
    }

    // For single strings, try cache first
    if (typeof charSequence === "string" && !returnSegments) {
      const cacheKey = charSequence
      if (this.segmentCache.has(cacheKey)) {
        this.cacheHits++
        return this.segmentCache.get(cacheKey)
      }
    }

    // Increment counter
    this.totalSegmentations++

    // Convert to character arrays
    const chars =
      typeof charSequence === "string"
        ? Array.from(charSequence).map((c) => c.charCodeAt(0) % this.config.initialCharDim)
        : charSequence

    // Convert characters to embeddings
    const charEmbeds = this._embedChars(chars)

    // Detect segment boundaries
    const boundaryProbs = this._detectBoundaries(charEmbeds, modality)

    // Extract segments using boundaries
    const { segments, conceptIds } = this._extractSegments(chars, charEmbeds, boundaryProbs)

    // Add to cache if single sequence
    if (typeof charSequence === "string" && !returnSegments) {
      this.segmentCache.set(charSequence, conceptIds)
    }

    if (returnSegments) {
      return { conceptIds, segments }
    } else {
      return conceptIds
    }
  }

  /**
   * Set current modality being processed
   */
  setModality(modality) {
    if (["text", "image", "audio", "multimodal"].includes(modality)) {
      this.currentModality = modality
      return true
    }
    return false
  }

  /**
   * Set current context as private (not shared with hive mind)
   */
  setPrivateContext(contextName) {
    this.privateContext = contextName
    this.inPrivateContext = true
  }

  /**
   * Clear private context flag
   */
  clearPrivateContext() {
    this.privateContext = null
    this.inPrivateContext = false
  }

  /**
   * Extract segments from a character sequence
   */
  _extractSegments(chars, charEmbeds, boundaryProbs) {
    // Potential boundaries (start, significant boundaries, end)
    const boundaries = [0]

    // Find significant boundaries (probability > 0.5)
    for (let i = 0; i < boundaryProbs.length; i++) {
      if (boundaryProbs[i] > 0.5) {
        boundaries.push(i)
      }
    }

    // Always add the end boundary
    if (boundaries[boundaries.length - 1] !== chars.length) {
      boundaries.push(chars.length)
    }

    const segments = []
    const conceptIds = []

    // Extract segments between boundaries
    for (let i = 0; i < boundaries.length - 1; i++) {
      const start = boundaries[i]
      const end = boundaries[i + 1]

      // Check if segment is too long
      if (end - start > this.config.maxSegmentLength) {
        // If segment is too long, split further
        for (let j = start; j < end; j += this.config.maxSegmentLength) {
          const subEnd = Math.min(j + this.config.maxSegmentLength, end)
          const subSegment = chars.slice(j, subEnd)
          segments.push(subSegment)

          // Get concept for segment
          const embedSlice = this._sliceEmbeddings(charEmbeds, j, subEnd)
          const conceptId = this._getConceptForSegment(subSegment, embedSlice)
          conceptIds.push(conceptId)
        }
      } else {
        // Extract normal segment
        const segment = chars.slice(start, end)
        segments.push(segment)

        // Get concept for segment
        const embedSlice = this._sliceEmbeddings(charEmbeds, start, end)
        const conceptId = this._getConceptForSegment(segment, embedSlice)
        conceptIds.push(conceptId)
      }
    }

    return { segments, conceptIds }
  }

  /**
   * Get or create concept ID for a character segment
   */
  _getConceptForSegment(charSegment, segmentEmbeds) {
    // Convert to string for lookup
    const segmentStr = charSegment.map((c) => String.fromCharCode(c)).join("")

    // Try to find existing concept
    const conceptId = this.conceptBank.findConceptBySource(segmentStr)

    if (conceptId !== undefined) {
      // Update usage statistics
      this.conceptBank.updateConceptUsage(conceptId, this.privateContext)

      // Add to pattern memory
      this.patternMemory.addPattern(segmentStr, {
        context: this.privateContext,
        private: this.inPrivateContext,
        modality: this.currentModality,
      })

      return conceptId
    }

    // Calculate segment meaning
    const segmentMeaning = this._calculateSegmentMeaning(segmentEmbeds)

    // Check frequency in pattern memory
    const patternFreq = this.patternMemory.getPatternFrequency(segmentStr)

    if (patternFreq >= this.config.minSegmentFrequency) {
      // Create new concept for frequent segment
      const newConceptId = this.conceptBank.addCharacterConcept(segmentStr, {
        private: this.inPrivateContext,
        modality: this.currentModality,
      })

      return newConceptId
    } else {
      // For infrequent segments, use character-by-character processing
      const charConcepts = []
      for (const c of charSegment) {
        const charStr = String.fromCharCode(c)
        let charConcept = this.conceptBank.findConceptBySource(charStr)
        if (charConcept === undefined) {
          charConcept = this.conceptBank.addCharacterConcept(charStr)
        }
        charConcepts.push(charConcept)
      }

      // Add to pattern memory
      this.patternMemory.addPattern(segmentStr, {
        context: this.privateContext,
        private: this.inPrivateContext,
        modality: this.currentModality,
      })

      return charConcepts
    }
  }

  /**
   * Calculate meaning representation for a segment
   */
  _calculateSegmentMeaning(embeddingSlice) {
    // Simple average pooling for now
    // In a full implementation, this would use transformers
    const result = new Float32Array(this.config.initialHiddenDim)

    if (embeddingSlice.length === 0) {
      return result
    }

    // Average pooling across sequence
    for (let i = 0; i < embeddingSlice.length; i++) {
      for (let j = 0; j < this.config.initialHiddenDim; j++) {
        result[j] += embeddingSlice[i][j]
      }
    }

    // Normalize
    for (let j = 0; j < this.config.initialHiddenDim; j++) {
      result[j] /= embeddingSlice.length
    }

    return result
  }

  /**
   * Embed characters into vectors
   */
  _embedChars(chars) {
    // In a full implementation, this would use the actual embedding lookup
    // Here we use a simplified version
    return chars.map((c) => {
      const charVec = new Float32Array(this.config.initialHiddenDim)

      // Simple character encoding using sine/cosine
      for (let i = 0; i < Math.min(8, this.config.initialHiddenDim / 4); i++) {
        const normChar = c / 128 // Normalize
        const pos = i * 4
        charVec[pos] = Math.sin(normChar)
        charVec[pos + 1] = Math.cos(normChar)
        charVec[pos + 2] = Math.sin(2 * normChar)
        charVec[pos + 3] = Math.cos(2 * normChar)
      }

      return charVec
    })
  }

  /**
   * Detect segment boundaries
   */
  _detectBoundaries(charEmbeds, modality) {
    // In a full implementation, this would use convolutions + transformers
    // Here we use a simplified version for demonstration
    const boundaryProbs = []

    for (let i = 0; i < charEmbeds.length - 1; i++) {
      // Calculate simple boundary score based on embedding differences
      let similarity = 0
      for (let j = 0; j < this.config.initialHiddenDim; j++) {
        similarity += charEmbeds[i][j] * charEmbeds[i + 1][j]
      }

      // Normalize to [0,1]
      similarity = (similarity + 1) / 2

      // Low similarity = high boundary probability
      let boundaryProb = 1 - similarity

      // Boost boundary probability at whitespace
      if (i < charEmbeds.length - 1 && charEmbeds[i][0] === 32) {
        boundaryProb = 0.9
      }

      boundaryProbs.push(boundaryProb)
    }

    return boundaryProbs
  }

  /**
   * Slice embeddings for a segment
   */
  _sliceEmbeddings(embeddings, start, end) {
    return embeddings.slice(start, end)
  }

  /**
   * Create character embeddings
   */
  _createCharEmbeddings() {
    // In a real implementation, this would be a learned embedding matrix
    return {
      lookup: (char) => {
        const vec = new Float32Array(this.config.initialHiddenDim)

        // Simple character encoding
        const normChar = char / 128 // Normalize
        for (let i = 0; i < Math.min(8, this.config.initialHiddenDim / 4); i++) {
          const pos = i * 4
          vec[pos] = Math.sin(normChar)
          vec[pos + 1] = Math.cos(normChar)
          vec[pos + 2] = Math.sin(2 * normChar)
          vec[pos + 3] = Math.cos(2 * normChar)
        }

        return vec
      },
    }
  }

  /**
   * Create boundary detector model
   */
  _createBoundaryDetector() {
    // In a real implementation, this would be neural nets
    return {
      detect: (embeddings) => {
        const boundaryProbs = []

        for (let i = 0; i < embeddings.length - 1; i++) {
          // Calculate simple boundary score based on embedding differences
          let similarity = 0
          for (let j = 0; j < embeddings[i].length; j++) {
            similarity += embeddings[i][j] * embeddings[i + 1][j]
          }

          // Normalize to [0,1]
          similarity = (similarity + 1) / 2

          // Low similarity = high boundary probability
          boundaryProbs.push(1 - similarity)
        }

        return boundaryProbs
      },
    }
  }

  /**
   * Create modality detector model
   */
  _createModalityDetector() {
    // In a real implementation, this would be specialized neural nets
    return {
      detect: (embeddings) => {
        // Simplified version just delegates to main detector
        return this.boundaryDetector.detect(embeddings)
      },
    }
  }

  /**
   * Get statistics about segmentation performance
   */
  getSegmentationStats() {
    return {
      totalSegmentations: this.totalSegmentations,
      cacheHits: this.cacheHits,
      cacheHitRate: this.cacheHits / Math.max(1, this.totalSegmentations),
      cachedSegments: this.segmentCache.size,
      frequentPatterns: this.patternMemory.getFrequentPatterns().length,
      currentModality: this.currentModality,
    }
  }
}

/**
 * Pattern Memory system for tracking recurring patterns
 */
class PatternMemory {
  constructor(options = {}) {
    this.capacity = options.capacity || 10000
    this.minFrequency = options.minFrequency || 5

    // Pattern storage
    this.patterns = new Map()
    this.timestamps = new Map()
    this.patternUtilities = new Map()

    // Context-specific patterns
    this.contextPatterns = new Map()

    // Modality tracking
    this.modalityPatterns = {
      text: new Set(),
      image: new Set(),
      audio: new Set(),
      multimodal: new Set(),
    }

    // Hive mind tracking
    this.sharedPatterns = new Set()
    this.privatePatterns = new Set()
    this.pendingSyncPatterns = new Set()
  }

  /**
   * Add a pattern to memory
   */
  addPattern(pattern, options = {}) {
    const context = options.context
    const isPrivate = options.private || false
    const modality = options.modality || "text"

    // Convert pattern to string if needed
    const patternKey = pattern.toString()

    // Update pattern frequency
    const currentFreq = this.patterns.get(patternKey) || 0
    this.patterns.set(patternKey, currentFreq + 1)

    // Update timestamp
    this.timestamps.set(patternKey, Date.now())

    // Update utility score - frequency weighted by recency
    const recency = 1.0 // Most recent gets full weight
    if (this.patternUtilities.has(patternKey)) {
      const currentUtility = this.patternUtilities.get(patternKey)
      this.patternUtilities.set(patternKey, 0.9 * currentUtility + 0.1 * (currentFreq + 1) * recency)
    } else {
      this.patternUtilities.set(patternKey, (currentFreq + 1) * recency)
    }

    // Check if we need to prune patterns
    if (this.patterns.size > this.capacity) {
      this._prunePatterns()
    }

    // Update context-specific pattern if provided
    if (context) {
      const contextKey = context.toString()
      if (!this.contextPatterns.has(contextKey)) {
        this.contextPatterns.set(contextKey, new Map())
      }

      const contextMap = this.contextPatterns.get(contextKey)
      const contextFreq = contextMap.get(patternKey) || 0
      contextMap.set(patternKey, contextFreq + 1)
    }

    // Update hive mind tracking
    if (isPrivate) {
      this.privatePatterns.add(patternKey)
      this.sharedPatterns.delete(patternKey)
    } else {
      this.sharedPatterns.add(patternKey)
      this.privatePatterns.delete(patternKey)
      this.pendingSyncPatterns.add(patternKey)
    }

    // Track modality
    this.modalityPatterns[modality].add(patternKey)
  }

  /**
   * Get frequency of a specific pattern
   */
  getPatternFrequency(pattern) {
    const patternKey = pattern.toString()
    return this.patterns.get(patternKey) || 0
  }

  /**
   * Get most frequent patterns
   */
  getFrequentPatterns(options = {}) {
    const limit = options.limit || 100
    const includePrivate = options.includePrivate ?? true
    const modality = options.modality

    // Filter patterns by frequency and privacy
    const frequent = []

    for (const [pattern, freq] of this.patterns.entries()) {
      // Skip if frequency is too low
      if (freq < this.minFrequency) continue

      // Skip if private and not including private
      if (!includePrivate && this.privatePatterns.has(pattern)) continue

      // Skip if modality filter is applied and pattern isn't in that modality
      if (modality && !this.modalityPatterns[modality].has(pattern)) continue

      frequent.push([pattern, freq])
    }

    // Sort by frequency (descending)
    frequent.sort((a, b) => b[1] - a[1])

    // Return up to limit
    return frequent.slice(0, limit)
  }

  /**
   * Get patterns associated with a specific context
   */
  getContextPatterns(context, options = {}) {
    const limit = options.limit || 20
    const modality = options.modality

    const contextKey = context.toString()
    if (!this.contextPatterns.has(contextKey)) {
      return []
    }

    const contextMap = this.contextPatterns.get(contextKey)
    const patterns = []

    for (const [pattern, freq] of contextMap.entries()) {
      // Skip if modality filter is applied and pattern isn't in that modality
      if (modality && !this.modalityPatterns[modality].has(pattern)) continue

      patterns.push([pattern, freq])
    }

    // Sort by frequency (descending)
    patterns.sort((a, b) => b[1] - a[1])

    // Return up to limit
    return patterns.slice(0, limit)
  }

  /**
   * Get patterns for sync with hive mind
   */
  getPatternsForSync(limit = 100) {
    const patternsToSync = []
    let count = 0

    for (const pattern of this.pendingSyncPatterns) {
      if (count >= limit) break
      if (!this.patterns.has(pattern) || this.privatePatterns.has(pattern)) continue

      // Find pattern modality
      let patternModality = "text"
      for (const [modality, patterns] of Object.entries(this.modalityPatterns)) {
        if (patterns.has(pattern)) {
          patternModality = modality
          break
        }
      }

      patternsToSync.push({
        pattern: pattern,
        frequency: this.patterns.get(pattern),
        utility: this.patternUtilities.get(pattern) || 0,
        timestamp: this.timestamps.get(pattern) || Date.now(),
        modality: patternModality,
      })

      count++
    }

    return patternsToSync
  }

  /**
   * Merge two patterns
   */
  mergePatterns(pattern1, pattern2, options = {}) {
    const isPrivate = options.private || false
    const modality = options.modality || null

    const patternKey1 = pattern1.toString()
    const patternKey2 = pattern2.toString()

    // Skip if either pattern doesn't exist
    if (!this.patterns.has(patternKey1) || !this.patterns.has(patternKey2)) {
      return null
    }

    // Create compound pattern
    const compoundPattern = patternKey1 + patternKey2

    // Get minimum frequency of components
    const freq1 = this.patterns.get(patternKey1)
    const freq2 = this.patterns.get(patternKey2)
    const frequency = Math.min(freq1, freq2)

    // Only add if significant
    if (frequency >= this.minFrequency / 2) {
      this.patterns.set(compoundPattern, frequency)
      this.timestamps.set(compoundPattern, Date.now())

      // Utility starts as average of components
      const utility1 = this.patternUtilities.get(patternKey1) || 0
      const utility2 = this.patternUtilities.get(patternKey2) || 0
      this.patternUtilities.set(compoundPattern, (utility1 + utility2) / 2)

      // Update hive mind tracking
      if (isPrivate || this.privatePatterns.has(patternKey1) || this.privatePatterns.has(patternKey2)) {
        this.privatePatterns.add(compoundPattern)
      } else {
        this.sharedPatterns.add(compoundPattern)
        this.pendingSyncPatterns.add(compoundPattern)
      }

      // Determine modality of merged pattern
      let pattern1Modality = "text"
      let pattern2Modality = "text"

      for (const [modality, patterns] of Object.entries(this.modalityPatterns)) {
        if (patterns.has(patternKey1)) pattern1Modality = modality
        if (patterns.has(patternKey2)) pattern2Modality = modality
      }

      let mergedModality
      if (modality) {
        mergedModality = modality
      } else if (pattern1Modality !== pattern2Modality) {
        mergedModality = "multimodal"
      } else {
        mergedModality = pattern1Modality
      }

      // Track modality
      this.modalityPatterns[mergedModality].add(compoundPattern)

      return compoundPattern
    }

    return null
  }

  /**
   * Prune least useful patterns to stay within capacity
   */
  _prunePatterns() {
    // If we're not over capacity, do nothing
    if (this.patterns.size <= this.capacity) {
      return
    }

    // Find least useful patterns
    const patternsArray = Array.from(this.patterns.keys())

    // Sort by utility (ascending)
    patternsArray.sort((a, b) => {
      const utilityA = this.patternUtilities.get(a) || 0
      const utilityB = this.patternUtilities.get(b) || 0
      return utilityA - utilityB
    })

    // Remove patterns until we're back under capacity
    const pruneCutoff = patternsArray.length - this.capacity
    for (let i = 0; i < pruneCutoff; i++) {
      const pattern = patternsArray[i]

      // Remove from all tracking
      this.patterns.delete(pattern)
      this.timestamps.delete(pattern)
      this.patternUtilities.delete(pattern)
      this.sharedPatterns.delete(pattern)
      this.privatePatterns.delete(pattern)
      this.pendingSyncPatterns.delete(pattern)

      // Remove from modality tracking
      for (const patterns of Object.values(this.modalityPatterns)) {
        patterns.delete(pattern)
      }

      // Remove from context patterns
      for (const contextMap of this.contextPatterns.values()) {
        contextMap.delete(pattern)
      }
    }
  }
}

// Ensure proper exports
export { PatternMemory }
