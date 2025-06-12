// Core SAM architecture
/**
 * ConceptMemoryBank - Dynamic concept storage system for SAM
 *
 * This replaces traditional token vocabulary with concepts that
 * evolve through usage patterns and experience.
 */
export class ConceptMemoryBank {
  constructor(options = {}) {
    // Configuration
    this.conceptDim = options.conceptDim || 768
    this.initialSize = options.initialSize || 10000
    this.growthRate = options.growthRate || 1000

    // Concept storage
    this.conceptEmbeddings = new Float32Array(this.initialSize * this.conceptDim)
    this.conceptFrequencies = new Uint32Array(this.initialSize)
    this.conceptTimestamps = new Float64Array(this.initialSize)

    // Metadata storage
    this.conceptMetadata = {}
    this.sourceToConceptMap = {}
    this.relatedConcepts = {}

    // Track next concept ID
    this.nextConceptId = 0

    // Multimodal tracking
    this.modalityConcepts = {
      text: new Set(),
      image: new Set(),
      audio: new Set(),
      multimodal: new Set(),
    }

    // Hive mind sharing
    this.sharedConcepts = new Set()
    this.privateConcepts = new Set()
    this.pendingSyncConcepts = new Set()

    // Creation history
    this.creationHistory = []

    // Initialize with basic concepts
    this._initializeBasicConcepts()
  }

  /**
   * Initialize with basic character concepts
   */
  _initializeBasicConcepts() {
    // Add ASCII characters
    for (let i = 32; i < 127; i++) {
      this.addCharacterConcept(String.fromCharCode(i))
    }

    // Add common word pieces
    const commonPieces = [
      "the",
      "and",
      "of",
      "to",
      "in",
      "is",
      "you",
      "that",
      "it",
      "he",
      "she",
      "was",
      "for",
      "on",
      "are",
      "with",
      "as",
      "they",
      "be",
      "at",
      "this",
      "have",
      "from",
      "or",
      "by",
      "not",
      "what",
      "all",
      "were",
      "we",
      "when",
      "your",
      "can",
      "said",
      "there",
      "use",
      "an",
      "each",
      "which",
      "do",
      "how",
      "their",
      "if",
      "will",
      // Add programming syntax
      "function",
      "const",
      "let",
      "var",
      "return",
      "class",
      "import",
      "export",
      "default",
      "from",
      "async",
      "await",
      "try",
      "catch",
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "break",
      "continue",
    ]

    for (const piece of commonPieces) {
      this.addCharacterConcept(piece)
    }
  }

  /**
   * Add a character sequence as a concept
   */
  addCharacterConcept(charSequence, options = {}) {
    // Check if already exists
    if (this.sourceToConceptMap[charSequence] !== undefined) {
      return this.sourceToConceptMap[charSequence]
    }

    // Ensure we haven't exceeded capacity
    if (this.nextConceptId >= this.initialSize) {
      this.grow()
    }

    const conceptId = this.nextConceptId++
    this.sourceToConceptMap[charSequence] = conceptId

    // Create metadata
    this.conceptMetadata[conceptId] = {
      source: charSequence,
      type: "character_sequence",
      createdAt: Date.now(),
      frequency: 0,
      contexts: {},
      modality: options.modality || "text",
    }

    // Initialize embedding with character-based encoding
    const offset = conceptId * this.conceptDim
    for (let i = 0; i < charSequence.length; i++) {
      const char = charSequence.charCodeAt(i)
      const normChar = char / 128 // Normalize

      // Create a simple character encoding using sine/cosine
      // This is similar to positional encoding in transformers
      const pos = (i % (this.conceptDim / 4)) * 4
      this.conceptEmbeddings[offset + pos] = Math.sin(normChar)
      this.conceptEmbeddings[offset + pos + 1] = Math.cos(normChar)
      this.conceptEmbeddings[offset + pos + 2] = Math.sin(2 * normChar)
      this.conceptEmbeddings[offset + pos + 3] = Math.cos(2 * normChar)
    }

    // Normalize the embedding
    this._normalizeEmbedding(conceptId)

    // Track by modality
    const modality = options.modality || "text"
    this.modalityConcepts[modality].add(conceptId)

    // Track for hive mind sharing
    if (options.private) {
      this.privateConcepts.add(conceptId)
    } else {
      this.sharedConcepts.add(conceptId)
      this.pendingSyncConcepts.add(conceptId)
    }

    // Record creation
    this.creationHistory.push({
      conceptId,
      source: charSequence,
      timestamp: Date.now(),
      modality: modality,
    })

    return conceptId
  }

  /**
   * Add a semantic concept not directly tied to characters
   */
  addSemanticConcept(meaningVector, options = {}) {
    // Ensure we haven't exceeded capacity
    if (this.nextConceptId >= this.initialSize) {
      this.grow()
    }

    const conceptId = this.nextConceptId++

    // Set embedding directly
    const offset = conceptId * this.conceptDim
    for (let i = 0; i < Math.min(meaningVector.length, this.conceptDim); i++) {
      this.conceptEmbeddings[offset + i] = meaningVector[i]
    }

    // Normalize the embedding
    this._normalizeEmbedding(conceptId)

    // Create metadata
    this.conceptMetadata[conceptId] = {
      type: "semantic",
      createdAt: Date.now(),
      frequency: 0,
      contexts: {},
      relatedSources: options.relatedSources || [],
      modality: options.modality || "text",
      ...options.metadata,
    }

    // Track by modality
    const modality = options.modality || "text"
    this.modalityConcepts[modality].add(conceptId)

    // Track for hive mind sharing
    if (options.private) {
      this.privateConcepts.add(conceptId)
    } else {
      this.sharedConcepts.add(conceptId)
      this.pendingSyncConcepts.add(conceptId)
    }

    // Record creation
    this.creationHistory.push({
      conceptId,
      type: "semantic",
      timestamp: Date.now(),
      modality: modality,
    })

    return conceptId
  }

  /**
   * Update usage statistics for a concept
   */
  updateConceptUsage(conceptId, context = null, registerForSync = true) {
    if (conceptId >= this.nextConceptId) return

    // Update frequency and timestamp
    this.conceptFrequencies[conceptId]++
    this.conceptTimestamps[conceptId] = Date.now()

    // Update metadata
    if (this.conceptMetadata[conceptId]) {
      this.conceptMetadata[conceptId].frequency = this.conceptFrequencies[conceptId]

      // Update context tracking if provided
      if (context) {
        const contextKey = typeof context === "string" ? context : "default"
        this.conceptMetadata[conceptId].contexts[contextKey] =
          (this.conceptMetadata[conceptId].contexts[contextKey] || 0) + 1
      }
    }

    // Register for hive sync if applicable
    if (registerForSync && !this.privateConcepts.has(conceptId)) {
      this.pendingSyncConcepts.add(conceptId)
    }
  }

  /**
   * Get the embedding for a concept
   */
  getConceptEmbedding(conceptId) {
    if (conceptId >= this.nextConceptId) return null

    const offset = conceptId * this.conceptDim
    return this.conceptEmbeddings.slice(offset, offset + this.conceptDim)
  }

  /**
   * Find concept ID for a character sequence
   */
  findConceptBySource(charSequence) {
    return this.sourceToConceptMap[charSequence]
  }

  /**
   * Find similar concepts
   */
  findSimilarConcepts(queryVector, options = {}) {
    const topK = options.topK || 5
    const modality = options.modality

    // Normalize query vector
    const normalizedQuery = this._normalizeVector(queryVector)

    // Array to store similarities
    const similarities = []

    // Calculate similarities
    for (let conceptId = 0; conceptId < this.nextConceptId; conceptId++) {
      // Skip if modality filter is applied and doesn't match
      if (modality && !this.modalityConcepts[modality]?.has(conceptId)) {
        continue
      }

      const embedding = this.getConceptEmbedding(conceptId)
      const similarity = this._cosineSimilarity(normalizedQuery, embedding)

      similarities.push([conceptId, similarity])
    }

    // Sort by similarity (descending)
    similarities.sort((a, b) => b[1] - a[1])

    // Return top-k results
    return similarities.slice(0, topK)
  }

  /**
   * Create a merged concept from two existing concepts
   */
  createMergedConcept(conceptId1, conceptId2, options = {}) {
    if (conceptId1 >= this.nextConceptId || conceptId2 >= this.nextConceptId) {
      return null
    }

    // Get source sequences if available
    const source1 = this.conceptMetadata[conceptId1]?.source || ""
    const source2 = this.conceptMetadata[conceptId2]?.source || ""
    const mergedSource = source1 && source2 ? source1 + source2 : null

    // Create merged embedding (average)
    const embedding1 = this.getConceptEmbedding(conceptId1)
    const embedding2 = this.getConceptEmbedding(conceptId2)

    const mergedEmbedding = new Float32Array(this.conceptDim)
    for (let i = 0; i < this.conceptDim; i++) {
      mergedEmbedding[i] = (embedding1[i] + embedding2[i]) / 2
    }

    // Check privacy
    const isPrivate = options.private || this.privateConcepts.has(conceptId1) || this.privateConcepts.has(conceptId2)

    // Check modalities
    const modality1 = this.conceptMetadata[conceptId1]?.modality || "text"
    const modality2 = this.conceptMetadata[conceptId2]?.modality || "text"
    const mergedModality = modality1 !== modality2 ? "multimodal" : modality1

    // Create new concept
    const mergedId = this.addSemanticConcept(mergedEmbedding, {
      private: isPrivate,
      modality: mergedModality,
      metadata: {
        type: "merged",
        parentConcepts: [conceptId1, conceptId2],
        relatedSources: [source1, source2].filter(Boolean),
      },
    })

    // Register source mapping if available
    if (mergedSource) {
      this.sourceToConceptMap[mergedSource] = mergedId
    }

    // Link as related concepts
    if (!this.relatedConcepts[conceptId1]) this.relatedConcepts[conceptId1] = []
    if (!this.relatedConcepts[conceptId2]) this.relatedConcepts[conceptId2] = []

    this.relatedConcepts[conceptId1].push(mergedId)
    this.relatedConcepts[conceptId2].push(mergedId)

    return mergedId
  }

  /**
   * Get concepts ready for sync with hive mind
   */
  getConceptsForSync(limit = 100) {
    const concepts = []
    let count = 0

    for (const conceptId of this.pendingSyncConcepts) {
      if (count >= limit) break

      const metadata = this.conceptMetadata[conceptId]
      const embedding = this.getConceptEmbedding(conceptId)

      concepts.push({
        localId: conceptId,
        source: metadata?.source || "",
        type: metadata?.type || "unknown",
        frequency: this.conceptFrequencies[conceptId],
        embedding: Array.from(embedding),
        createdAt: metadata?.createdAt || Date.now(),
        modality: metadata?.modality || "text",
      })

      count++
    }

    return concepts
  }

  /**
   * Mark concepts as synced
   */
  markConceptsSynced(conceptIds) {
    for (const conceptId of conceptIds) {
      this.pendingSyncConcepts.delete(conceptId)
    }
  }

  /**
   * Grow concept bank capacity
   */
  grow() {
    const newSize = this.initialSize + this.growthRate
    console.log(`Growing concept bank from ${this.initialSize} to ${newSize}`)

    // Create new arrays
    const newEmbeddings = new Float32Array(newSize * this.conceptDim)
    const newFrequencies = new Uint32Array(newSize)
    const newTimestamps = new Float64Array(newSize)

    // Copy existing data
    newEmbeddings.set(this.conceptEmbeddings)
    newFrequencies.set(this.conceptFrequencies)
    newTimestamps.set(this.conceptTimestamps)

    // Replace arrays
    this.conceptEmbeddings = newEmbeddings
    this.conceptFrequencies = newFrequencies
    this.conceptTimestamps = newTimestamps

    // Update size
    this.initialSize = newSize

    return true
  }

  /**
   * Get statistics about concept usage
   */
  getConceptStats() {
    // Count concept types
    let charConcepts = 0
    let mergedConcepts = 0
    let semanticConcepts = 0

    for (const id in this.conceptMetadata) {
      const type = this.conceptMetadata[id].type
      if (type === "character_sequence") charConcepts++
      else if (type === "merged") mergedConcepts++
      else if (type === "semantic") semanticConcepts++
    }

    // Get modality counts
    const modalityCounts = {}
    for (const modality in this.modalityConcepts) {
      modalityCounts[modality] = this.modalityConcepts[modality].size
    }

    // Find top concepts by frequency
    const topConcepts = []
    const ids = Object.keys(this.conceptMetadata).map(Number)

    if (ids.length > 0) {
      // Sort by frequency
      ids.sort((a, b) => this.conceptFrequencies[b] - this.conceptFrequencies[a])

      // Take top 10
      for (let i = 0; i < Math.min(10, ids.length); i++) {
        const id = ids[i]
        topConcepts.push([id, this.conceptMetadata[id]?.source || "N/A", this.conceptFrequencies[id]])
      }
    }

    return {
      totalConcepts: this.nextConceptId,
      characterConcepts: charConcepts,
      mergedConcepts: mergedConcepts,
      semanticConcepts: semanticConcepts,
      topConcepts: topConcepts,
      growthEvents: this.creationHistory.length,
      hiveShared: this.sharedConcepts.size,
      hivePrivate: this.privateConcepts.size,
      hivePending: this.pendingSyncConcepts.size,
      modalityCounts: modalityCounts,
    }
  }

  /**
   * Load vocabulary from an array of strings
   */
  loadVocabulary(words) {
    let count = 0
    for (const word of words) {
      if (word && !this.sourceToConceptMap[word]) {
        this.addCharacterConcept(word)
        count++
      }
    }
    return count
  }

  /**
   * Helper: Normalize a vector to unit length
   */
  _normalizeVector(vector) {
    // Calculate magnitude
    let magnitude = 0
    for (let i = 0; i < vector.length; i++) {
      magnitude += vector[i] * vector[i]
    }
    magnitude = Math.sqrt(magnitude)

    // Return normalized vector
    if (magnitude === 0) return vector

    const normalized = new Float32Array(vector.length)
    for (let i = 0; i < vector.length; i++) {
      normalized[i] = vector[i] / magnitude
    }
    return normalized
  }

  /**
   * Helper: Normalize a concept embedding in-place
   */
  _normalizeEmbedding(conceptId) {
    const offset = conceptId * this.conceptDim

    // Calculate magnitude
    let magnitude = 0
    for (let i = 0; i < this.conceptDim; i++) {
      magnitude += this.conceptEmbeddings[offset + i] * this.conceptEmbeddings[offset + i]
    }
    magnitude = Math.sqrt(magnitude)

    // Normalize
    if (magnitude === 0) return

    for (let i = 0; i < this.conceptDim; i++) {
      this.conceptEmbeddings[offset + i] /= magnitude
    }
  }

  /**
   * Helper: Calculate cosine similarity between vectors
   */
  _cosineSimilarity(vec1, vec2) {
    // Ensure vectors are normalized
    const normalized1 = this._normalizeVector(vec1)
    const normalized2 = this._normalizeVector(vec2)

    // Calculate dot product
    let dotProduct = 0
    for (let i = 0; i < Math.min(normalized1.length, normalized2.length); i++) {
      dotProduct += normalized1[i] * normalized2[i]
    }

    return dotProduct
  }
}

// Ensure proper export;
