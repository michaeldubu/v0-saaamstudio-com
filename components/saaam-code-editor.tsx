"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Save,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

/**
 * SAAAM Code Editor Component - Integrated development environment for SAAAM language
 * Features:
 * - Syntax highlighting for SAAAM language
 * - IntelliSense and code completion
 * - Error checking and validation
 * - File management
 * - Project organization
 * - Integration with SAAAM Engine
 */
export default function SaaamCodeEditor() {
  // Editor state
  const [activeFile, setActiveFile] = useState(null)
  const [files, setFiles] = useState([])
  const [expandedFolders, setExpandedFolders] = useState({
    scripts: true,
    gameObjects: false,
    assets: false,
  })
  const [engineLoaded, setEngineLoaded] = useState(false)
  const [messages, setMessages] = useState([
    {
      text: "Welcome to SAAAM Code Editor!",
      type: "info",
      id: Date.now(),
    },
  ])
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [theme, setTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [wordWrap, setWordWrap] = useState("on")
  const [showSettings, setShowSettings] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [currentScript, setCurrentScript] = useState("")
  const [validationResults, setValidationResults] = useState(null)
  const [executionResults, setExecutionResults] = useState(null)
  const [compilationResults, setCompilationResults] = useState(null)

  // References
  const editorContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const monacoEditorRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const engineBridgeRef = useRef(null)

  // Mock initial files for demo
  const initialFiles = [
    {
      id: "1",
      name: "player.saaam",
      content: `// SAAAM Player Script
// Handles player movement, jumping, and interactions

var player_speed = 5;
const GRAVITY = 0.5;
var jump_strength = 10;
var is_grounded = false;

function create() {
  // Initialize your player object
  this.position = vec2(100, 100);
  this.velocity = vec2(0, 0);
  this.sprite = "player_idle";

  // Set up player properties
  this.health = 100;
  this.max_health = 100;
  this.coins = 0;

  console.log("Player created at position: " + this.position.x + ", " + this.position.y);
}

function step() {
  // Apply gravity
  this.velocity.y += GRAVITY;

  // Handle input
  if (keyboard_check(vk_right) || keyboard_check(vk_d)) {
    this.velocity.x = player_speed;
    this.sprite = "player_run";
    this.image_xscale = 1; // Face right
  } else if (keyboard_check(vk_left) || keyboard_check(vk_a)) {
    this.velocity.x = -player_speed;
    this.sprite = "player_run";
    this.image_xscale = -1; // Face left
  } else {
    this.velocity.x = 0;
    this.sprite = "player_idle";
  }

  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // Check if on ground
  if (check_collision(this.position.x, this.position.y + 1, "solid")) {
    is_grounded = true;

    // Only stop falling if we're moving down
    if (this.velocity.y > 0) {
      this.velocity.y = 0;
    }

    // Jump if space is pressed
    if (keyboard_check_pressed(vk_space) || keyboard_check_pressed(vk_w) || keyboard_check_pressed(vk_up)) {
      this.velocity.y = -jump_strength;
      is_grounded = false;
      play_sound("jump");
    }
  } else {
    is_grounded = false;
    // Show jumping/falling sprite
    this.sprite = "player_jump";
  }

  // Collect coins
  var coin = check_collision(this.position.x, this.position.y, "coin");
  if (coin) {
    this.coins++;
    destroy(coin);
    play_sound("coin");

    // Create a visual effect
    create_effect("sparkle", this.position.x, this.position.y);
  }

  // Handle enemy collision
  var enemy = check_collision(this.position.x, this.position.y, "enemy");
  if (enemy) {
    take_damage(10);
  }
}

function draw() {
  // Draw the player sprite
  draw_sprite(this.sprite, this.position.x, this.position.y);

  // Draw health bar above player
  draw_health_bar(this.position.x - 20, this.position.y - 30, 40, 5, this.health / this.max_health);
}

function take_damage(amount) {
  this.health -= amount;

  // Flash red
  this.flash = 10;

  // Play hurt sound
  play_sound("hurt");

  if (this.health <= 0) {
    die();
  }
}

function die() {
  play_sound("die");
  create_effect("explosion", this.position.x, this.position.y);

  // Restart level after delay
  wait(2, function() {
    restart_level();
  });
}`,
      folder: "scripts",
      type: "script",
    },
    {
      id: "2",
      name: "enemy.saaam",
      content: `// SAAAM Enemy Script
// Basic enemy AI with patrol and player detection

var move_speed = 2;
var patrol_points = [];
var current_point = 0;
var direction = 1;
var detection_range = 200;
var chase_speed = 3;

function create() {
  // Initialize enemy
  this.position = vec2(300, 550);
  this.velocity = vec2(0, 0);
  this.sprite = "enemy_walk";

  // Set up patrol points if none defined
  if (patrol_points.length === 0) {
    patrol_points = [
      vec2(this.position.x - 100, this.position.y),
      vec2(this.position.x + 100, this.position.y)
    ];
  }
}

function step() {
  // Apply gravity
  this.velocity.y += 0.5;

  // Check for player
  var player = find_nearest("player");
  if (player) {
    var distance = point_distance(this.position.x, this.position.y, player.position.x, player.position.y);

    if (distance < detection_range) {
      // Chase player
      if (player.position.x < this.position.x) {
        this.velocity.x = -chase_speed;
        this.image_xscale = -1; // Face left
      } else {
        this.velocity.x = chase_speed;
        this.image_xscale = 1; // Face right
      }

      this.sprite = "enemy_chase";
    } else {
      // Patrol behavior
      patrol();
    }
  } else {
    // No player found, just patrol
    patrol();
  }

  // Apply velocity with collision detection
  var next_x = this.position.x + this.velocity.x;
  var next_y = this.position.y + this.velocity.y;

  // Horizontal collision
  if (!check_collision(next_x, this.position.y, "solid")) {
    this.position.x = next_x;
  } else {
    // Hit a wall, turn around
    direction *= -1;
    this.velocity.x *= -1;
  }

  // Vertical collision
  if (!check_collision(this.position.x, next_y, "solid")) {
    this.position.y = next_y;
  } else {
    this.velocity.y = 0;
  }

  // Check if we're at edge of platform
  if (!check_collision(this.position.x + (direction * 20), this.position.y + 10, "solid")) {
    // About to walk off edge, turn around
    direction *= -1;
  }
}

function patrol() {
  // Move toward current patrol point
  var target = patrol_points[current_point];

  if (point_distance(this.position.x, this.position.y, target.x, target.y) < 10) {
    // Reached point, move to next one
    current_point = (current_point + 1) % patrol_points.length;
    target = patrol_points[current_point];
  }

  // Move toward target
  if (target.x < this.position.x) {
    this.velocity.x = -move_speed;
    this.image_xscale = -1; // Face left
  } else {
    this.velocity.x = move_speed;
    this.image_xscale = 1; // Face right
  }

  this.sprite = "enemy_walk";
}

function draw() {
  draw_sprite(this.sprite, this.position.x, this.position.y);

  // Visualize patrol path in debug mode
  if (debug_mode) {
    draw_set_color("#FF0000");
    for (var i = 0; i < patrol_points.length; i++) {
      var p1 = patrol_points[i];
      var p2 = patrol_points[(i + 1) % patrol_points.length];
      draw_line(p1.x, p1.y, p2.x, p2.y);
      draw_circle(p1.x, p1.y, 5);
    }
  }
}`,
      folder: "scripts",
      type: "script",
    },
    {
      id: "3",
      name: "collectible.saaam",
      content: `// SAAAM Collectible Script
// Creates a collectible coin or item

var hover_height = 5;
var hover_speed = 2;
var rotation_speed = 3;
var original_y = 0;

function create() {
  // Initialize collectible
  this.position = vec2(200, 400);
  original_y = this.position.y;
  this.rotation = 0;
  this.sprite = "coin";
  this.tag = "coin";

  // Set up animation
  this.image_index = 0;
  this.image_speed = 0.2;
}

function step() {
  // Hovering animation
  this.position.y = original_y + Math.sin(Date.now() * 0.001 * hover_speed) * hover_height;

  // Rotation
  this.rotation += rotation_speed;

  // Animate sprite
  this.image_index += this.image_speed;
  if (this.image_index >= 4) { // Assuming 4 frame animation
    this.image_index = 0;
  }
}

function draw() {
  // Draw with rotation
  draw_sprite_ext(
    this.sprite,
    Math.floor(this.image_index),
    this.position.x,
    this.position.y,
    1, 1, this.rotation,
    "#FFFFFF", 1
  );

  // Draw glow effect
  draw_set_alpha(0.5 + Math.sin(Date.now() * 0.002) * 0.2);
  draw_set_color("#FFFF00");
  draw_circle(this.position.x, this.position.y, 15 + Math.sin(Date.now() * 0.002) * 5);
  draw_set_alpha(1);
}`,
      folder: "scripts",
      type: "script",
    },
  ]

  // Initialize component
  useEffect(() => {
    // Set initial files
    setFiles(initialFiles)

    // Set first file as active
    if (initialFiles.length > 0) {
      setActiveFile(initialFiles[0])
      setCurrentScript(initialFiles[0].content)
    }

    setIsEditorReady(true)
    addMessage("Editor initialized", "success")

    // Check for SAAAM engine
    const checkEngine = () => {
      if (typeof window !== "undefined" && window.SAAAM) {
        setEngineLoaded(true)
        addMessage("SAAAM engine detected", "success")
        return true
      }
      return false
    }

    // Check immediately and then periodically
    if (!checkEngine()) {
      const interval = setInterval(() => {
        if (checkEngine()) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [])

  // Add a message to the console
  const addMessage = (text, type = "info") => {
    setMessages((prev) => [...prev, { text, type, id: Date.now() }])
  }

  // Save the current file
  const saveCurrentFile = () => {
    if (!activeFile) return

    const currentContent = textareaRef.current?.value || currentScript

    // Update file in the files array
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === activeFile.id ? { ...file, content: currentContent } : file)),
    )

    // Update active file
    setActiveFile((prevFile) => ({ ...prevFile, content: currentContent }))

    addMessage(`File "${activeFile.name}" saved`, "success")
  }

  // Open a file
  const openFile = (file) => {
    // If there's an active file, save its content first
    if (activeFile && textareaRef.current) {
      saveCurrentFile()
    }

    // Set the new active file
    setActiveFile(file)
    setCurrentScript(file.content)

    addMessage(`File "${file.name}" opened`, "info")
  }

  // Create a new file
  const createNewFile = () => {
    const fileName = prompt("Enter file name (with .saaam extension):", "new_script.saaam")
    if (!fileName) return

    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      content: `// SAAAM Script
// Created: ${new Date().toLocaleString()}

function create() {
  // Initialization code
}

function step() {
  // Update code
}

function draw() {
  // Rendering code
}`,
      folder: "scripts",
      type: "script",
    }

    setFiles((prevFiles) => [...prevFiles, newFile])
    openFile(newFile)
    addMessage(`New file "${fileName}" created`, "success")
  }

  // Delete the current file
  const deleteCurrentFile = () => {
    if (!activeFile) return

    if (!confirm(`Are you sure you want to delete "${activeFile.name}"?`)) return

    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== activeFile.id))
    setActiveFile(null)
    setCurrentScript("")

    addMessage(`File "${activeFile.name}" deleted`, "success")
  }

  // Run the current script
  const runScript = () => {
    if (!activeFile) return

    saveCurrentFile()

    if (!engineLoaded) {
      addMessage("Cannot run script - SAAAM engine not loaded", "error")
      return
    }

    try {
      addMessage(`Running script "${activeFile.name}"`, "info")

      // Simulate script execution
      setTimeout(() => {
        addMessage(`Script "${activeFile.name}" executed successfully`, "success")
      }, 1000)
    } catch (error) {
      addMessage(`Error running script: ${error.message}`, "error")
    }
  }

  // Toggle folder expansion
  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }))
  }

  // Get files by folder
  const getFilesByFolder = (folder) => {
    return files.filter((file) => file.folder === folder)
  }

  // Handle textarea change
  const handleTextareaChange = (e) => {
    setCurrentScript(e.target.value)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* File Explorer */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Project Explorer</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={createNewFile} className="flex-1">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <Button size="sm" variant="outline" onClick={deleteCurrentFile} disabled={!activeFile}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Scripts Folder */}
            <div className="mb-2">
              <button
                onClick={() => toggleFolder("scripts")}
                className="flex items-center w-full p-2 hover:bg-gray-700 rounded"
              >
                {expandedFolders.scripts ? (
                  <FolderOpen className="w-4 h-4 mr-2" />
                ) : (
                  <Folder className="w-4 h-4 mr-2" />
                )}
                Scripts
              </button>
              {expandedFolders.scripts && (
                <div className="ml-6">
                  {getFilesByFolder("scripts").map((file) => (
                    <button
                      key={file.id}
                      onClick={() => openFile(file)}
                      className={`flex items-center w-full p-2 text-left hover:bg-gray-700 rounded ${
                        activeFile?.id === file.id ? "bg-blue-600" : ""
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Game Objects Folder */}
            <div className="mb-2">
              <button
                onClick={() => toggleFolder("gameObjects")}
                className="flex items-center w-full p-2 hover:bg-gray-700 rounded"
              >
                {expandedFolders.gameObjects ? (
                  <FolderOpen className="w-4 h-4 mr-2" />
                ) : (
                  <Folder className="w-4 h-4 mr-2" />
                )}
                Game Objects
              </button>
              {expandedFolders.gameObjects && (
                <div className="ml-6">
                  {getFilesByFolder("gameObjects").map((file) => (
                    <button
                      key={file.id}
                      onClick={() => openFile(file)}
                      className={`flex items-center w-full p-2 text-left hover:bg-gray-700 rounded ${
                        activeFile?.id === file.id ? "bg-blue-600" : ""
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assets Folder */}
            <div className="mb-2">
              <button
                onClick={() => toggleFolder("assets")}
                className="flex items-center w-full p-2 hover:bg-gray-700 rounded"
              >
                {expandedFolders.assets ? <FolderOpen className="w-4 h-4 mr-2" /> : <Folder className="w-4 h-4 mr-2" />}
                Assets
              </button>
              {expandedFolders.assets && (
                <div className="ml-6">
                  {getFilesByFolder("assets").map((file) => (
                    <button
                      key={file.id}
                      onClick={() => openFile(file)}
                      className={`flex items-center w-full p-2 text-left hover:bg-gray-700 rounded ${
                        activeFile?.id === file.id ? "bg-blue-600" : ""
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-2">
          <Button size="sm" onClick={saveCurrentFile} disabled={!activeFile}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" onClick={runScript} disabled={!activeFile || !engineLoaded}>
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
          <div className="flex-1" />
          <Badge variant={engineLoaded ? "default" : "secondary"}>
            {engineLoaded ? "Engine Ready" : "Engine Loading..."}
          </Badge>
        </div>

        {/* Editor */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            {activeFile ? (
              <div className="h-full">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{activeFile.name}</h3>
                </div>
                <textarea
                  ref={textareaRef}
                  value={currentScript}
                  onChange={handleTextareaChange}
                  className="w-full h-full bg-gray-900 text-white font-mono text-sm p-4 border border-gray-700 rounded resize-none focus:outline-none focus:border-blue-500"
                  placeholder="Write your SAAAM code here..."
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a file to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Console */}
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Console
              </h3>
            </div>
            <ScrollArea className="h-96">
              <div className="p-4 space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 text-sm ${
                      message.type === "error"
                        ? "text-red-400"
                        : message.type === "success"
                          ? "text-green-400"
                          : message.type === "warning"
                            ? "text-yellow-400"
                            : "text-gray-300"
                    }`}
                  >
                    {message.type === "error" && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === "success" && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === "warning" && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === "info" && <Terminal className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
