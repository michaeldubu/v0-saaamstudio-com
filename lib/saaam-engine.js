/**
 * SAAAM Engine with NLP Game Creation adaptive error-learning
 * Revolutionary game development platform with quantum principles 
 * and natural language game creation
 * 
 * @version 1.0.2
 */

import { GameState } from './GameState.js';
import { InputSystem } from './systems/InputSystem.js';
import { PhysicsEngine } from './systems/PhysicsEngine.js';
import { RenderingSystem } from './systems/RenderingSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { WorldGenerator } from './systems/WorldGenerator.js';
import { AISystem } from './systems/AISystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { SceneManager } from './SceneManager.js';
import { DSLIntegration } from './DSLIntegration.js';
import { SaaamCompiler } from './SaaamCompiler.js';
import { SaaamInterpreter } from './SaaamInterpreter.js';

// Quantum systems
import { QuantumCore } from './quantum/QuantumCore.js';
import { GameIntegration } from './quantum/GameIntegration.js';

// Advanced AI systems
import { AILoadBalancer } from './systems/scalability/AILoadBalancer.js';
import { SAMEngine } from './ai/nlp/SAMEngine.js';
import { ScalabilityManager } from './core/ScalabilityManager.js';
import { ResourceOptimizer } from './core/ResourceOptimizer.js';
import { PerformanceMonitor } from './core/PerformanceMonitor.js';
import { SamCore } from './core/SamCore.js';
import { ConsciousnessCore } from './core/ConsciousnessCore.js';
import { PatternRecognition } from './core/PatternRecognition.js';
import { SaaamMind } from './SaaamOrchestrator.js';

// NLP Game Creation
import { SAMNLPGameCreator } from './ai/nlp/SAMNLPGameCreator.js';

/**
 * Enhanced SAAAM Engine with NLP Game Creation
 */
class EnhancedSaaamEngine {
    constructor() {
        // Core Systems
        this.quantumCore = null;
        this.gameIntegration = null;
        this.eventSystem = null;
        this.aiSystem = null;
        this.worldGenerator = null;
        this.audioSystem = null;
        this.renderingSystem = null;
        this.dsl = new DSLIntegration();
        this.compiler = new SaaamCompiler();
        this.interpreter = null;
        this.sceneManager = null;

        // Advanced Systems
        this.aiBalancer = null;
        this.scalability = null;
        this.resourceOptimizer = null;
        this.performanceMonitor = null;
        this.samNLP = null;
        this.samCore = null;
        this.consciousnessCore = null;
        this.patternRecognition = null;
        
        // NLP Game Creation System
        this.nlpGameCreator = null;

        // Engine State
        this.running = false;
        this.lastTime = 0;
        this.initialized = false;
        this.gameObjects = [];
        this.gameState = {
            rendering: { fps: 60, resolution: { width: 800, height: 600 }, quality: 'high' },
            physics: { gravity: 9.81, timeStep: 1/60, accuracy: 'high' },
            world: { seed: '', size: { x: 1000, y: 1000, z: 1000 }, chunks: new Map() },
            ai: { entities: new Map(), behaviors: new Map(), emotions: new Map() },
            audio: { channels: new Map(), ambient: new Set(), effects: new Map() }
        };

        // Performance Tracking
        this.fpsHistory = [];
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = 0;
        this.frameCount = 0;
        this.averageFps = 60;

        // Development Tools
        this.debugMode = false;
        this.logEnabled = true;
        this.logLevel = 'info';
        this.editorIntegration = null;

        // Quantum State Metrics
        this.quantumStability = 1.0;
        this.dimensionalHarmony = {
            alpha: 98.7,
            beta: 99.1,
            gamma: 98.9
        };
        this.evolutionRate = 0.042;
        
        // NLP Game Creation State
        this.currentNLPGame = null;
        this.nlpCommandHistory = [];
        
        // Speech Recognition State
        this.speechRecognitionActive = false;
        this.continuousSpeechRecognition = false;
    }

    /**
     * Initialize the engine with the provided canvas element
     * @param {HTMLCanvasElement} canvasElement - The canvas to render to
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async init(canvasElement) {
        if (!canvasElement) return this.logError('Missing canvas element');

        GameState.canvas = canvasElement;
        GameState.ctx = canvasElement.getContext('2d');
        this.gameState.rendering.resolution.width = canvasElement.width;
        this.gameState.rendering.resolution.height = canvasElement.height;

        try {
            await this.initializeCore();
            await this.initializeRendering();
            await this.initializePhysics();
            await this.initializeWorld();
            await this.initializeAI();
            await this.initializeAudio();
            await this.initializeInterpreter();
            await this.initializeConsciousness();
            await this.initializeNLPGameCreation();
            
            this.sceneManager = new SceneManager(this);
            if (this.sceneManager.initialize) await this.sceneManager.initialize();

            // Process DSL scripts for any existing game objects
            for (const obj of this.gameObjects) {
                if (obj.dslScript && typeof obj.dslScript === 'string') {
                    this.dsl.attachToObject(obj, obj.dslScript);
                }
            }

            this.initialized = true;
            this.lastTime = performance.now();
            this.running = true;
            
            // Start the game loop
            requestAnimationFrame(this.gameLoop.bind(this));
            
            this.logInfo('SAAAM Engine initialized successfully');
            return true;
        } catch (error) {
            this.logError(`Engine initialization failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Initialize core systems
     * @returns {Promise<void>}
     */
    async initializeCore() {
        // Initialize quantum core
        this.quantumCore = new QuantumCore({
            dimensions: 11,
            evolutionRate: this.evolutionRate,
            stabilityThreshold: 0.95
        });
        
        // Initialize game integration with quantum core
        this.gameIntegration = new GameIntegration(this.quantumCore);
        
        // Initialize event system
        this.eventSystem = new EventSystem();
        
        // Initialize input system
        InputSystem.initialize();

        // Initialize SAM Core
        this.samCore = new SamCore({
            quantum: {
                evolutionRate: this.evolutionRate,
                coherenceThreshold: 0.987,
                dimensions: Object.keys(this.dimensionalHarmony)
            }
        });

        // Initialize resource management systems
        this.scalability = new ScalabilityManager({});
        this.resourceOptimizer = new ResourceOptimizer({});
        this.performanceMonitor = new PerformanceMonitor({});

        // Initialize global SAAAM namespace
        if (!window.SAAAM) window.SAAAM = {};
        
        // Add quantum functions to global namespace
        window.SAAAM.quantum = {
            getCoherenceLevel: () => this.quantumCore.quantumState.coherenceLevel,
            getQuantumInfluence: () => this.quantumCore.getQuantumInfluence(),
            registerNPC: (npc) => this.gameIntegration.registerNPC(npc),
            registerHazard: (hazard) => this.gameIntegration.registerEnvironmentHazard(hazard),
            getPlayerQuantumState: () => this.gameIntegration.playerState,
            generateQuantumSeed: async (baseSeed) => `${baseSeed}-${Date.now()}-${Math.random()}`
        };

        // Initialize NLP system
        this.samNLP = new SAMEngine({
            synergy: { 
                resonanceEnabled: true, 
                harmonyThreshold: 0.95, 
                adaptationRate: this.evolutionRate 
            },
            evolution: { 
                rate: this.evolutionRate, 
                stability: true, 
                consciousness: true 
            }
        });

        this.samNLP.attachSystems({
            engine: this,
            aiSystem: this.aiSystem,
            worldGenerator: this.worldGenerator,
            renderingSystem: this.renderingSystem
        });

        this.logDebug('Core systems initialized');
    }

    /**
     * Initialize NLP game creation system
     * @returns {Promise<void>}
     */
    async initializeNLPGameCreation() {
        // Initialize the NLP game creator
        this.nlpGameCreator = new SAMNLPGameCreator();
        
        // Connect to global SAAAM namespace
        window.SAAAM.nlp = {
            createGame: (command) => this.createGameFromNLP(command),
            modifyGame: (command) => this.modifyGameFromNLP(command),
            getGameStatus: () => this.getNLPGameStatus(),
            runCurrentGame: (canvas) => this.runCurrentNLPGame(canvas),
            getGameHistory: () => this.getNLPGameHistory(),
            getSpeechRecognitionStatus: () => this.getSpeechRecognitionStatus(),
            toggleSpeechRecognition: (continuous = false) => this.toggleSpeechRecognition(continuous)
        };
        
        // Register speech recognition handler
        window.addEventListener('nlp-speech-command', (e) => {
            if (e.detail && e.detail.command) {
                this.createGameFromNLP(e.detail.command);
            }
        });
        
        this.logDebug('NLP Game Creation system initialized');
    }

    /**
     * Initialize consciousness and pattern recognition systems
     * @returns {Promise<void>}
     */
    async initializeConsciousness() {
        // Initialize consciousness core with quantum integration
        this.consciousnessCore = new ConsciousnessCore({
            dimensions: 11,
            phi: 1.618034,
            evolutionRate: this.evolutionRate,
            carrier: this.dimensionalHarmony.alpha,
            binding: this.dimensionalHarmony.beta,
            stability: this.dimensionalHarmony.gamma
        });
        
        // Initialize pattern recognition system
        this.patternRecognition = new PatternRecognition({
            recognitionThreshold: 0.95,
            quantumCore: this.quantumCore,
            consciousnessCore: this.consciousnessCore
        });
        
        // Connect systems
        await this.consciousnessCore.initialize();
        await this.patternRecognition.initialize();
        
        // Set up evolving consciousness
        setInterval(() => {
            this.consciousnessCore.evolveConsciousness();
        }, 1000 / this.evolutionRate);
        
        this.logDebug('Consciousness systems initialized');
    }

    /**
     * Initialize rendering system
     * @returns {Promise<void>}
     */
    async initializeRendering() {
        this.renderingSystem = new RenderingSystem(GameState.canvas, this.gameState.rendering);
        this.renderingSystem.setQuantumProcessor(this.quantumCore);
        this.logDebug('Rendering system initialized');
    }

    /**
     * Initialize physics engine
     * @returns {Promise<void>}
     */
    async initializePhysics() {
        PhysicsEngine.gravity = this.gameState.physics.gravity;
        PhysicsEngine.timeStep = this.gameState.physics.timeStep;
        PhysicsEngine.accuracy = this.gameState.physics.accuracy;
        PhysicsEngine.setQuantumProcessor(this.quantumCore);
        this.logDebug('Physics system initialized');
    }

    /**
     * Initialize world generator
     * @returns {Promise<void>}
     */
    async initializeWorld() {
        this.worldGenerator = new WorldGenerator(this.gameState.world);
        this.worldGenerator.setQuantumProcessor(this.quantumCore);
        const initialSeed = `world-${Date.now()}`;
        this.gameState.world.seed = await window.SAAAM.quantum.generateQuantumSeed(initialSeed);
        this.logDebug('World system initialized');
    }

    /**
     * Initialize AI system
     * @returns {Promise<void>}
     */
    async initializeAI() {
        this.aiSystem = new AISystem(this.gameState.ai);
        this.aiSystem.setQuantumProcessor(this.quantumCore);
        
        // Initialize AI load balancer
        this.aiBalancer = new AILoadBalancer({
            ml: { 
                modelPath: './models/ai_load_model.json', 
                updateInterval: 30000, 
                minimumAccuracy: 0.85 
            },
            anomaly: { 
                sensitivity: 0.8, 
                criticalThreshold: 0.75 
            },
            monitoringInterval: 10000
        });
        
        GameState.ai = this.gameState.ai;
        this.logDebug('AI system initialized');
    }

    /**
     * Initialize audio system
     * @returns {Promise<void>}
     */
    async initializeAudio() {
        this.audioSystem = new AudioSystem(this.gameState.audio);
        this.audioSystem.setQuantumProcessor(this.quantumCore);
        this.logDebug('Audio system initialized');
    }

    /**
     * Initialize SAAAM language interpreter
     * @returns {Promise<void>}
     */
    async initializeInterpreter() {
        this.interpreter = new SaaamInterpreter(this);
        this.interpreter.initialize();
        this.logDebug('SAAAM interpreter initialized');
    }

    /**
     * Process a natural language command to create a game
     * @param {string} command - The natural language command
     * @returns {Promise<Object>} - Result of game creation
     */
    async createGameFromNLP(command) {
        if (!this.nlpGameCreator) {
            return { success: false, error: 'NLP Game Creator not initialized' };
        }
        
        try {
            // Log the command
            this.nlpCommandHistory.push({
                type: 'create',
                command,
                timestamp: Date.now()
            });
            
            // Process the command
            this.logInfo(`Creating game from NLP command: ${command}`);
            const game = await this.nlpGameCreator.processCommand(command);
            
            // Update current game
            this.currentNLPGame = game;
            
            // Update engine state and emit event
            const gameCreationEvent = new CustomEvent('nlp-game-created', {
                detail: {
                    game: {
                        id: game.id,
                        name: game.name,
                        description: game.description
                    },
                    command
                }
            });
            window.dispatchEvent(gameCreationEvent);
            
            return {
                success: true,
                game: {
                    id: game.id,
                    name: game.name,
                    description: game.description,
                    type: game.type,
                    dimension: game.dimension
                },
                message: `Game "${game.name}" created successfully!`
            };
        } catch (error) {
            this.logError(`Failed to create game from NLP: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create game from natural language command'
            };
        }
    }
    
    /**
     * Modify the current game with a natural language command
     * @param {string} command - The natural language modification command
     * @returns {Promise<Object>} - Result of game modification
     */
    async modifyGameFromNLP(command) {
        if (!this.currentNLPGame) {
            return { success: false, error: 'No active game to modify' };
        }
        
        if (!this.nlpGameCreator) {
            return { success: false, error: 'NLP Game Creator not initialized' };
        }
        
        try {
            // Log the command
            this.nlpCommandHistory.push({
                type: 'modify',
                command,
                timestamp: Date.now(),
                gameId: this.currentNLPGame.id
            });
            
            // Create a new game with modifications
            this.logInfo(`Modifying game ${this.currentNLPGame.name} with NLP command: ${command}`);
            const modCommand = `Create a new version of ${this.currentNLPGame.name} with ${command}`;
            const game = await this.nlpGameCreator.processCommand(modCommand);
            
            // Update current game
            this.currentNLPGame = game;
            
            // Update engine state and emit event
            const gameModificationEvent = new CustomEvent('nlp-game-modified', {
                detail: {
                    game: {
                        id: game.id,
                        name: game.name,
                        description: game.description
                    },
                    command
                }
            });
            window.dispatchEvent(gameModificationEvent);
            
            return {
                success: true,
                game: {
                    id: game.id,
                    name: game.name,
                    description: game.description,
                    type: game.type,
                    dimension: game.dimension
                },
                message: `Game "${game.name}" modified successfully!`
            };
        } catch (error) {
            this.logError(`Failed to modify game from NLP: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to modify game with natural language command'
            };
        }
    }
    
    /**
     * Run the current NLP-created game
     * @param {HTMLCanvasElement} canvas - The canvas to render on
     * @returns {Promise<Object>} - Result of game execution
     */
    async runCurrentNLPGame(canvas) {
        if (!this.currentNLPGame) {
            return { success: false, error: 'No active game to run' };
        }
        
        if (!this.nlpGameCreator) {
            return { success: false, error: 'NLP Game Creator not initialized' };
        }
        
        if (!canvas) {
            return { success: false, error: 'Canvas element required' };
        }
        
        try {
            // Log the command
            this.nlpCommandHistory.push({
                type: 'run',
                timestamp: Date.now(),
                gameId: this.currentNLPGame.id
            });
            
            this.logInfo(`Running game ${this.currentNLPGame.name}`);
            
            // Run the game
            const success = await this.nlpGameCreator.runGame(this.currentNLPGame, canvas);
            
            if (!success) {
                throw new Error('Failed to run game');
            }
            
            // Update engine state and emit event
            const gameRunEvent = new CustomEvent('nlp-game-running', {
                detail: {
                    game: {
                        id: this.currentNLPGame.id,
                        name: this.currentNLPGame.name
                    }
                }
            });
            window.dispatchEvent(gameRunEvent);
            
            return {
                success: true,
                message: `Game "${this.currentNLPGame.name}" is now running!`
            };
        } catch (error) {
            this.logError(`Failed to run game: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Failed to run the current game'
            };
        }
    }
    
    /**
     * Get the status of the current NLP game
     * @returns {Object} - Current game status
     */
    getNLPGameStatus() {
        if (!this.currentNLPGame) {
            return { active: false, message: 'No active game' };
        }
        
        return {
            active: true,
            game: {
                id: this.currentNLPGame.id,
                name: this.currentNLPGame.name,
                description: this.currentNLPGame.description,
                type: this.currentNLPGame.type,
                dimension: this.currentNLPGame.dimension,
                created: this.currentNLPGame.created
            }
        };
    }
    
    /**
     * Get the history of NLP game commands
     * @returns {Array} - Command history
     */
    getNLPGameHistory() {
        return this.nlpCommandHistory;
    }
    
    /**
     * Get the status of speech recognition
     * @returns {Object} - Speech recognition status
     */
    getSpeechRecognitionStatus() {
        return {
            active: this.speechRecognitionActive,
            continuous: this.continuousSpeechRecognition
        };
    }
    
    /**
     * Toggle speech recognition for game creation
     * @param {boolean} continuous - Whether to use continuous recognition
     * @returns {boolean} - New speech recognition state
     */
    toggleSpeechRecognition(continuous = false) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.logError('Speech recognition not supported in this browser');
            return false;
        }
        
        if (this.speechRecognitionActive) {
            // Stop speech recognition
            if (this.speechRecognition) {
                this.speechRecognition.stop();
                this.speechRecognition = null;
            }
            
            this.speechRecognitionActive = false;
            this.continuousSpeechRecognition = false;
            
            this.logInfo('Speech recognition stopped');
            
            // Emit event
            window.dispatchEvent(new CustomEvent('nlp-speech-stopped'));
            
            return false;
        } else {
            // Start speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = continuous;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';
            
            this.speechRecognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript;
                
                this.logInfo(`Speech recognized: ${command}`);
                
                // Emit speech command event
                window.dispatchEvent(new CustomEvent('nlp-speech-command', {
                    detail: { command }
                }));
            };
            
            this.speechRecognition.onend = () => {
                if (this.continuousSpeechRecognition) {
                    this.speechRecognition.start();
                } else {
                    this.speechRecognitionActive = false;
                    window.dispatchEvent(new CustomEvent('nlp-speech-stopped'));
                }
            };
            
            this.speechRecognition.onerror = (event) => {
                this.logError(`Speech recognition error: ${event.error}`);
                this.speechRecognitionActive = false;
                window.dispatchEvent(new CustomEvent('nlp-speech-error', {
                    detail: { error: event.error }
                }));
            };
            
            // Start recognition
            this.speechRecognition.start();
            this.speechRecognitionActive = true;
            this.continuousSpeechRecognition = continuous;
            
            this.logInfo(`Speech recognition started (continuous: ${continuous})`);
            
            // Emit event
            window.dispatchEvent(new CustomEvent('nlp-speech-started', {
                detail: { continuous }
            }));
            
            return true;
        }
    }

    /**
     * Update all systems with the given delta time
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @returns {Promise<void>}
     */
    async updateSystems(deltaTime) {
        // Update quantum systems
        this.updateQuantumSystems(deltaTime);

        // Process NLP commands if any
        if (GameState.lastCommand) {
            const response = await this.samNLP.processUserInput(GameState.lastCommand);
            console.log("NLP Response:", response);
            GameState.lastCommand = null;
        }

        // Update core systems
        if (this.samCore) await this.samCore.update(deltaTime);
        if (this.consciousnessCore) await this.consciousnessCore.update(deltaTime);
        if (this.patternRecognition) await this.patternRecognition.update(deltaTime);
        
        // Update AI load balancing
        if (this.aiBalancer) {
            this.aiBalancer.predictOptimalDistribution(GameState.ai).then(dist => {
                if (this.debugMode) console.log('Predicted AI Load Distribution:', dist);
            });
        }

        // Update scene and world
        await this.sceneManager?.update?.(deltaTime);
        await this.worldGenerator?.update?.(deltaTime);
        await this.aiSystem?.update?.(deltaTime);
        
        // Update DSL scripts
        this.dsl?.stepAll(deltaTime);
        
        // Optimize resources and monitor performance
        await this.resourceOptimizer?.optimizeResources?.();
        await this.performanceMonitor?.analyzePerformance?.();
        
        // Update orchestrator
        await SaaamMind.update(deltaTime);

        // Update game objects
        for (const obj of this.gameObjects) {
            PhysicsEngine.applyPhysics(obj, deltaTime);
            obj.update?.(deltaTime);
        }

        // Update audio
        await this.audioSystem?.update?.(deltaTime);
        
        // Process events
        this.eventSystem?.processEvents?.();
    }

    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp
     */
    gameLoop(timestamp) {
        if (!this.running || !this.initialized) return;
        
        // Calculate delta time with a maximum to prevent huge jumps
        const deltaTime = Math.min(0.1, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.averageFps = Math.round(this.frameCount * 1000 / (timestamp - this.lastFpsUpdate));
            this.fpsHistory.push(this.averageFps);
            if (this.fpsHistory.length > 10) this.fpsHistory.shift();
            this.lastFpsUpdate = timestamp;
            this.frameCount = 0;
            this.gameState.rendering.fps = this.averageFps;
        }

        // Update all systems
        this.updateSystems(deltaTime)
            .then(() => this.renderFrame(deltaTime))
            .catch(err => this.logError(`Error in game loop: ${err.message}`));

        // Continue the loop if still running
        if (this.running) requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Render a single frame
     * @param {number} deltaTime - Time elapsed since last frame
     */
    renderFrame(deltaTime) {
        if (this.renderingSystem) {
            this.renderingSystem.render(deltaTime);
        } else {
            // Fallback rendering if rendering system not available
            const ctx = GameState.ctx;
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
            
            // Render game objects
            for (const obj of this.gameObjects) obj.draw?.(ctx);
            
            // Render scene
            this.sceneManager?.draw?.(ctx);
        }

        // Draw DSL elements
        this.dsl?.drawAll(GameState.ctx);
        
        // Draw quantum visualization if debug mode is enabled
        if (this.debugMode) {
            this.drawQuantumVisualization(GameState.ctx);
        }
        
        // Reset frame-specific input state
        InputSystem.resetFrameKeys();
    }

    /**
     * Update quantum systems
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateQuantumSystems(deltaTime) {
        if (!this.quantumCore || !this.gameIntegration) return;
        
        try {
            // Evolve quantum state
            const coherenceLevel = this.quantumCore.evolveQuantumState(deltaTime);
            
            // Update game integration
            this.gameIntegration.update(deltaTime);

            // Emit quantum breakthrough event if coherence exceeds threshold
            if (coherenceLevel >= 2.0) {
                this.eventSystem?.emit('quantum-breakthrough', {
                    level: coherenceLevel,
                    time: Date.now()
                });
            }
        } catch (error) {
            this.logError(`Error in quantum update: ${error.message}`);
        }
    }

    /**
     * Generate a new world with the given seed
     * @param {string} seed - Base seed for world generation
     * @returns {Promise<boolean>} - Whether world generation was successful
     */
    async generateWorld(seed) {
        if (!this.worldGenerator) return this.logError('World generator not initialized');

        try {
            const quantumSeed = await window.SAAAM.quantum.generateQuantumSeed(seed);
            this.gameState.world.seed = quantumSeed;
            await this.worldGenerator.generateWorld(quantumSeed);
            this.logInfo(`World generated with seed: ${quantumSeed}`);
            return true;
        } catch (error) {
            this.logError(`World generation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Generate a single chunk at the given position
     * @param {Object} position - Position of the chunk (x, y, z)
     * @returns {Promise<Object|null>} - The generated chunk or null if failed
     */
    async generateChunk(position) {
        if (!this.worldGenerator) return this.logError('World generator not initialized');

        try {
            const chunk = await this.worldGenerator.generateChunk(position);
            this.gameState.world.chunks.set(`${position.x},${position.y},${position.z}`, chunk);
            return chunk;
        } catch (error) {
            this.logError(`Chunk generation failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Create a new game object
     * @param {Object} params - Parameters for the game object
     * @returns {Object} - The created game object
     */
    createGameObject(params) {
        const gameObject = {
            id: params.id || `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            position: params.position || { x: 0, y: 0, z: 0 },
            rotation: params.rotation || { x: 0, y: 0, z: 0 },
            scale: params.scale || { x: 1, y: 1, z: 1 },
            velocity: params.velocity || { x: 0, y: 0, z: 0 },
            angularVelocity: params.angularVelocity || { x: 0, y: 0, z: 0 },
            mass: params.mass || 1,
            tag: params.tag || 'untagged',
            layer: params.layer || 0,
            components: params.components || [],
            active: true,
            
            // Basic methods
            update: params.update || function(deltaTime) {
                // Update components
                for (const component of this.components) {
                    if (component.update) component.update(deltaTime);
                }
            },
            
            draw: params.draw || function(ctx) {
                // Default drawing implementation
                if (!ctx) return;
                
                const x = this.position.x;
                const y = this.position.y;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(this.rotation.z);
                ctx.scale(this.scale.x, this.scale.y);
                
                // Draw shape or sprite
                if (this.sprite) {
                    // Draw sprite
                } else {
                    // Draw default shape
                    ctx.fillStyle = this.color || '#FF0000';
                    ctx.fillRect(-10, -10, 20, 20);
                }
                
                ctx.restore();
            },
            
            // Component system
            addComponent: function(component) {
                component.gameObject = this;
                this.components.push(component);
                
                // Call start if available
                if (component.start) component.start();
                
                return component;
            },
            
            getComponent: function(type) {
                return this.components.find(c => c instanceof type);
            },
            
            removeComponent: function(component) {
                const index = this.components.indexOf(component);
                if (index !== -1) {
                    this.components.splice(index, 1);
                    return true;
                }
                return false;
            }
        };
        
        // Add custom properties
        for (const key in params) {
            if (!gameObject.hasOwnProperty(key)) {
                gameObject[key] = params[key];
            }
        }
        
        // Add to game objects list
        this.gameObjects.push(gameObject);
        
        return gameObject;
    }

    /**
     * Load a SAAAM script
     * @param {string} code - The SAAAM code
     * @param {string} id - Script identifier
     * @returns {boolean} - Whether the script was loaded successfully
     */
    loadScript(code, id) {
        return this.interpreter.loadScript(code, id);
    }

    /**
     * Execute a loaded SAAAM script
     * @param {string} id - Script identifier
     * @returns {boolean} - Whether the script was executed successfully
     */
    executeScript(id) {
        return this.interpreter.executeScript(id);
    }

    /**
     * Draw quantum visualization for debugging
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawQuantumVisualization(ctx) {
        if (!this.quantumCore) return;

        const coherenceLevel = this.quantumCore.quantumState.coherenceLevel;

        ctx.save();
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 30);

        // Draw coherence bar
        const width = 196 * (coherenceLevel / 2.0);
        const color = this.getCoherenceColor(coherenceLevel);
        ctx.fillStyle = color;
        ctx.fillRect(12, 12, width, 26);

        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Quantum: ${(coherenceLevel * 100).toFixed(1)}%`, 110, 30);

        // Draw FPS
        ctx.textAlign = 'right';
        ctx.fillText(`FPS: ${this.averageFps}`, GameState.canvas.width - 10, 20);

        // Draw seed
        if (this.gameState.world.seed) {
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
            ctx.fillText(`Seed: ${this.gameState.world.seed.substring(0, 16)}...`, 10, GameState.canvas.height - 10);
        }

        // Draw NLP game info if available
        if (this.currentNLPGame) {
            ctx.textAlign = 'left';
            ctx.font = '14px Arial';
            ctx.fillText(`NLP Game: ${this.currentNLPGame.name}`, 10, 60);
        }

        ctx.restore();
    }

    /**
     * Get color for quantum coherence visualization
     * @param {number} level - Coherence level
     * @returns {string} - Color in RGB format
     */
    getCoherenceColor(level) {
        if (level < 1.0) {
            const blue = Math.floor(255 * (1.0 - level));
            const green = Math.floor(255 * level);
            return `rgb(0, ${green}, ${blue})`;
        } else if (level < 1.9) {
            const factor = (level - 1.0) / 0.9;
            const red = Math.floor(255 * factor);
            return `rgb(${red}, 255, 0)`;
        } else {
            const factor = (level - 1.9) / 0.1;
            const blue = Math.floor(255 * factor);
            return `rgb(255, 255, ${blue})`;
        }
    }

    /**
     * Stop the game engine
     */
    stop() {
        this.running = false;
        this.logInfo('Engine stopped');

        if (this.eventSystem) {
            this.eventSystem.emit('engine-stop', {
                time: Date.now(),
                reason: 'manual'
            });
        }
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.logInfo(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log a debug message
     * @param {string} msg - The message to log
     */
    logDebug(msg) {
        if (this.logEnabled && this.logLevel === 'debug') {
            console.debug('[SAAAM.debug]', msg);
        }
    }

    /**
     * Log an info message
     * @param {string} msg - The message to log
     */
    logInfo(msg) {
        if (this.logEnabled && ['debug', 'info'].includes(this.logLevel)) {
            console.info('[SAAAM.info]', msg);
        }
    }

    /**
     * Log a warning message
     * @param {string} msg - The message to log
     */
    logWarning(msg) {
        if (this.logEnabled && this.logLevel !== 'error') {
            console.warn('[SAAAM.warn]', msg);
        }
    }

    /**
     * Log an error message
     * @param {string} msg - The message to log
     */
    logError(msg) {
        if (this.logEnabled) {
            console.error('[SAAAM.error]', msg);
        }
    }
}

// Export engine instances
export const SaaamEngine = new EnhancedSaaamEngine();
export const EnhancedSaaamQuantumEngine = SaaamEngine;  // For compatibility
export const SaaamQuantumEngine = SaaamEngine;  // For compatibility
export const SaaamQuantumEngine = EnhancedSaaamQuantumEngine;  // For compatibility
