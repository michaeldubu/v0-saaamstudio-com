"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { SaaamTutorialStyles } from "./saaam-tutorial-styles"

export default function SaaamTutorial() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    introduction: true,
    basics: false,
    moving: false,
    collectibles: false,
    visual: false,
    states: false,
    advanced: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-auto p-4 md:p-6">
      <SaaamTutorialStyles />
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 md:mb-6">SAAAM Language Tutorial</h1>

      {/* Introduction Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("introduction")}>
          {expandedSections.introduction ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Introduction to SAAAM</h2>
        </div>

        {expandedSections.introduction && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>
              Welcome to SAAAM (Simple and Accessible Architecture for Awesome Mechanics), a domain-specific language
              designed specifically for game development. SAAAM makes it easy for both beginners and experienced
              developers to create engaging 2D games with an intuitive syntax and powerful built-in features.
            </p>
            <p>
              This tutorial will guide you through the basics of SAAAM, starting with simple concepts and progressing to
              more complex game mechanics. By the end, you'll have the knowledge to create your own games using the
              SAAAM language and engine.
            </p>
          </div>
        )}
      </div>

      {/* Basics Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("basics")}>
          {expandedSections.basics ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Your First SAAAM Program</h2>
        </div>

        {expandedSections.basics && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>Let's start with the classic "Hello, World!" example to get familiar with SAAAM:</p>

            <pre className="bg-gray-800 p-2 md:p-4 rounded-md overflow-x-auto text-sm md:text-base">
              <code className="text-green-400 saaam-tutorial-code">
                {`// My first SAAAM program
SAAAM.registerCreate(create);
SAAAM.registerDraw(draw);

function create() {
  console.log("Hello, World!");
}

function draw(ctx) {
  SAAAM.drawText("Hello, SAAAM World!", 400, 300, "#FFFFFF");
}`}
              </code>
            </pre>

            <p>
              Save this code as{" "}
              <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">hello.saaam</code> and run it
              with SAAAM Game Studio. You should see the text "Hello, SAAAM World!" displayed in the center of the
              screen, and "Hello, World!" logged to the console.
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Understanding the Basics</h3>
            <p>Let's break down what's happening:</p>
            <ol className="list-decimal pl-4 md:pl-6 space-y-1 md:space-y-2">
              <li>
                We register two of SAAAM's lifecycle functions,{" "}
                <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">create</code> and{" "}
                <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">draw</code>, with the engine
              </li>
              <li>
                The <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">create</code> function
                runs once when the game starts
              </li>
              <li>
                The <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">draw</code> function runs
                every frame to render content to the screen
              </li>
              <li>
                We use the built-in{" "}
                <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">drawText</code> function to
                display text
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Moving Objects Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("moving")}>
          {expandedSections.moving ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Moving Objects</h2>
        </div>

        {expandedSections.moving && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>Now let's create a simple moving square:</p>

            <pre className="bg-gray-800 p-2 md:p-4 rounded-md overflow-x-auto text-sm md:text-base">
              <code className="text-green-400 saaam-tutorial-code">
                {`// Moving square example
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

// Game object
var square = {
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  color: "#4488FF",
  speed: 200
};

function create() {
  // Initialization code (empty for now)
}

function step(deltaTime) {
  // Move square with arrow keys
  if (SAAAM.keyboardCheck(SAAAM.vk.right)) {
    square.x += square.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.left)) {
    square.x -= square.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.up)) {
    square.y -= square.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.down)) {
    square.y += square.speed * deltaTime;
  }
  
  // Keep square on screen
  if (square.x < 0) square.x = 0;
  if (square.x + square.width > 800) square.x = 800 - square.width;
  if (square.y < 0) square.y = 0;
  if (square.y + square.height > 600) square.y = 600 - square.height;
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");
  
  // Draw the square
  SAAAM.drawRectangle(square.x, square.y, square.width, square.height, square.color);
  
  // Draw instructions
  SAAAM.drawText("Use arrow keys to move", 400, 30, "#FFFFFF");
}`}
              </code>
            </pre>

            <p>When you run this code, you should see a blue square that you can move around using the arrow keys.</p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Key Concepts Introduced</h3>
            <ol className="list-decimal pl-4 md:pl-6 space-y-1 md:space-y-2">
              <li>
                The <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">step</code> function is
                called every frame and is used for game logic
              </li>
              <li>
                The <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">deltaTime</code> parameter
                represents the time elapsed since the last frame
              </li>
              <li>
                We use <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">keyboardCheck</code> to
                detect key presses
              </li>
              <li>
                We multiply movement by{" "}
                <code className="bg-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-sm">deltaTime</code> to ensure
                consistent speed regardless of frame rate
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Collectibles Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("collectibles")}>
          {expandedSections.collectibles ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Adding Collectibles</h2>
        </div>

        {expandedSections.collectibles && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>Let's expand our game by adding collectibles that the player can gather:</p>

            <p className="text-gray-400">
              (Code example shortened for brevity - see the full tutorial for complete code)
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Key Concepts</h3>
            <ul className="list-disc pl-2 md:pl-6 space-y-1 md:space-y-2">
              <li>Creating and managing multiple game objects (collectibles)</li>
              <li>Implementing collision detection</li>
              <li>Keeping score</li>
              <li>Using time-based animation for visual effects</li>
              <li>Breaking code into functions for better organization</li>
            </ul>
          </div>
        )}
      </div>

      {/* Visual Polish Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("visual")}>
          {expandedSections.visual ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Adding Visual Polish</h2>
        </div>

        {expandedSections.visual && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>Let's enhance our game with better visuals:</p>

            <p className="text-gray-400">
              (Code example shortened for brevity - see the full tutorial for complete code)
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Visual Elements</h3>
            <ul className="list-disc pl-2 md:pl-6 space-y-1 md:space-y-2">
              <li>A spaceship player character that rotates according to movement direction</li>
              <li>Engine flame effects</li>
              <li>Star-shaped collectibles that rotate and have a glow effect</li>
              <li>Multiple types of particles: trails, sparkles, waves, and score popups</li>
              <li>A gradient background with animated stars</li>
            </ul>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Sound Effects</h3>
            <p>SAAAM makes it easy to add sound effects to your game:</p>

            <pre className="bg-gray-800 p-2 md:p-4 rounded-md overflow-x-auto text-sm md:text-base">
              <code className="text-green-400 saaam-tutorial-code">
                {`// Play a sound once
SAAAM.playSound("explosion");

// Play background music with loop
SAAAM.playMusic("background", 0.7, true);

// Stop music
SAAAM.stopMusic();`}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Game States Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("states")}>
          {expandedSections.states ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Implementing Game States</h2>
        </div>

        {expandedSections.states && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <p>Let's add game states to create a complete game loop:</p>

            <pre className="bg-gray-800 p-2 md:p-4 rounded-md overflow-x-auto text-sm md:text-base">
              <code className="text-green-400 saaam-tutorial-code">
                {`// Game states
const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
  VICTORY: "victory"
};

// Game variables
var currentState = GameState.MENU;

function step(deltaTime) {
  // Handle different game states
  switch (currentState) {
    case GameState.MENU:
      updateMenu(deltaTime);
      break;
    case GameState.PLAYING:
      updatePlaying(deltaTime);
      break;
    case GameState.GAME_OVER:
    case GameState.VICTORY:
      updateGameOver(deltaTime);
      break;
  }
}`}
              </code>
            </pre>

            <p>This approach demonstrates how to structure a complete game with different states:</p>
            <ol className="list-decimal pl-4 md:pl-6 space-y-1 md:space-y-2">
              <li>Menu screen with a start button</li>
              <li>Active gameplay with score and time tracking</li>
              <li>Game over screen when time runs out</li>
              <li>Victory screen when the target score is reached</li>
            </ol>
          </div>
        )}
      </div>

      {/* Advanced Features Section */}
      <div className="mb-6">
        <div className="flex items-center cursor-pointer mb-2 py-2" onClick={() => toggleSection("advanced")}>
          {expandedSections.advanced ? (
            <ChevronDown className="mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-2 flex-shrink-0" />
          )}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Advanced Features</h2>
        </div>

        {expandedSections.advanced && (
          <div className="pl-2 md:pl-6 space-y-3 md:space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">State Machines</h3>
            <p>
              For more complex game objects, state machines can help keep your code organized. SAAAM provides a built-in
              state machine system.
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Coroutines</h3>
            <p>SAAAM supports coroutines for handling sequences of events over time. Coroutines are useful for:</p>
            <ul className="list-disc pl-2 md:pl-6 space-y-1 md:space-y-2">
              <li>Sequences of actions that span multiple frames</li>
              <li>Creating cutscenes or scripted events</li>
              <li>Complex animations</li>
              <li>Boss behaviors</li>
            </ul>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Importing and Exporting</h3>
            <p>
              SAAAM supports modular code through importing and exporting, allowing you to organize your code into
              multiple files.
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Advanced Graphics</h3>
            <p>
              SAAAM supports various drawing operations for more complex visuals, including blend modes, sprite
              transformations, and complex shapes.
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Physics Integration</h3>
            <p>SAAAM includes simplified physics capabilities for creating more realistic movement and collisions.</p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Camera Controls</h3>
            <p>
              SAAAM allows camera manipulation for creating games larger than the screen, with functions for positioning
              and smooth following.
            </p>

            <h3 className="text-xl font-semibold text-yellow-400 mt-6">Saving and Loading Data</h3>
            <p>
              SAAAM provides functions for saving and loading game data, allowing you to implement high scores, save
              games, and more.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Conclusion</h2>
        <p>
          This tutorial has covered the basics of the SAAAM language and its capabilities. SAAAM is designed to make
          game development accessible while still providing powerful features for creating engaging games.
        </p>
        <p className="mt-4">
          With these tools, you can start creating your own games with SAAAM. Happy game developing!
        </p>
      </div>
    </div>
  )
}
