import { saaamIntegrationManager } from "./saaam-integration-manager.ts"

class SAAAMEngine {
  constructor() {
    this.createGameFromDescription = null
    this.lintCode = null
    this.getCodeCompletions = null
    this.createPhysicsWorld = null
    this.createEntity = null
    this.getSystemStatus = null
    this.integrationManager = null
  }

  async initialize() {
    // Initialize integration manager
    await saaamIntegrationManager.initialize()

    // Expose integration manager methods
    this.createGameFromDescription = saaamIntegrationManager.createGameFromNaturalLanguage.bind(saaamIntegrationManager)
    this.lintCode = saaamIntegrationManager.lintCode.bind(saaamIntegrationManager)
    this.getCodeCompletions = saaamIntegrationManager.getCodeCompletions.bind(saaamIntegrationManager)
    this.createPhysicsWorld = saaamIntegrationManager.createPhysicsWorld.bind(saaamIntegrationManager)
    this.createEntity = saaamIntegrationManager.createEntity.bind(saaamIntegrationManager)
    this.getSystemStatus = saaamIntegrationManager.getSystemStatus.bind(saaamIntegrationManager)

    // Expose integration manager
    this.integrationManager = saaamIntegrationManager
  }

  // Add other engine methods here
}

export default SAAAMEngine
