"use client"

import { useState, useRef, useCallback } from "react"
import { Play, Square, Bug, BarChart2, Moon, Sun, Users } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Legendary SAAAM IDE with Cutting Edge Features
const LegendarySaaamIDE = () => {
  // Expand initial code template with advanced game mechanics
  const [code, setCode] = useState(`// ⚡ Welcome to the Legendary SAAAM Game Dev IDE! ⚡ 
// Let's build an unforgettable gaming experience 🎮

/*--------------------------------------
Powerful Pseudo-3D Engine
--------------------------------------*/

// Immersive pseudo-3D environment
const world = new World({
  terrain: {
    heightmap: "assets/terrain/mountains.png",
    textures: [
      { name: "grass", file: "grass.png" },
      { name: "rock", file: "rock.png" },
      { name: "snow", file: "snow.png" }
    ],
    texture_regions: [
      { texture: "grass", height_range: [0, 100] },
      { texture: "rock",  height_range: [100, 200] },
      { texture: "snow",  height_range: [200, 255] },
    ]
  },
  water: {
    height: 30,
    color: color("#3399FF"),
    wave_strength: 2,
    wave_speed: 0.5,
    refraction: 0.02  
  },
  skybox: {
    textures: {
      front:  "sky_front.png",
      back:   "sky_back.png", 
      left:   "sky_left.png",
      right:  "sky_right.png",
      top:    "sky_top.png",
      bottom: "sky_bottom.png"  
    }
  },
  fog: {
    color: color("#E6FFFF"),  
    near: 20,
    far: 100
  }
});

/*--------------------------------------
Advanced Cinematic Cutscenes
--------------------------------------*/

// Multi-stage intro cutscene
function* intro_cutscene() {
  // Fade in from black
  yield* screen_fade(color("black"), color("white"), 120); 

  // Pan camera to bird's eye view of world
  yield* camera_pan_to(vec3(0, 200, 0), vec3(0, -90, 0), 180);
  yield* wait(2); // Hold for 2 seconds

  // Zoom down to player character
  yield* camera_move_to(vec3(0, 2, -5), 120, EASE_QUADRATIC);
  yield* camera_look_at(global.player.position, 120, EASE_QUADRATIC);
  yield* wait(1);

  // Spawn legendary title text
  const title = spawn_text("CYBER ROGUE", { 
    font: "Future", 
    size: 100, 
    color: color("yellow"),
    glow: { strength: 10, color: color("gold") },
    position: vec3(0, 5, 0),
    animation: {
      type: "emerge",
      duration: 120 
    }
  });
  
  yield* wait(3);
  
  // Shatter title dramatically
  title.shatter({
    duration: 60,
    style: "chaos",
    sound: {
      type: "shatter",
      pitch: 0.8,
      volume: 1
    }
  });
  yield* screen_shake(20, 0.5);
  yield* screen_flash(color("white"), 30);

  // Final fade to gameplay
  yield* screen_fade(color("white"), color("black"), 60);
}

// Start cutscene when game begins
on_game_start(() => {
  start_cutscene(intro_cutscene());
});

/*--------------------------------------
Dynamic Difficulty Adaptation  
--------------------------------------*/

// Intelligent dynamic difficulty system
const difficulty_manager = {
  skills_assessed: [
    "combat", "stealth", "hacking", "parkour"  
  ],
  assess_player_skill(skill) {
    // Analyze player's performance in given skill
    // Return a rating from 0 to 1
    return analyze_skill_performance(skill, global.player.stats); 
  },
  calculate_difficulty() {
    // Calculate optimal difficulty based on player's skill profile
    const skill_ratings = this.skills_assessed.map(skill => 
      this.assess_player_skill(skill)
    );
    const average_skill = skill_ratings.reduce((a, b) => a + b) / skill_ratings.length;

    // Determine ideal difficulty setting  
    if      (average_skill < 0.25) return "easy";
    else if (average_skill < 0.5)  return "normal";
    else if (average_skill < 0.75) return "hard";    
    else                           return "extreme";
  },
  adjust_game_parameters(difficulty) {
    // Tweak game settings based on difficulty level
    const config = {
      easy:    { enemy_damage: 0.8, enemy_health: 0.9, ammo_scarcity: 0.8 },
      normal:  { enemy_damage: 1.0, enemy_health: 1.0, ammo_scarcity: 1.0 },
      hard:    { enemy_damage: 1.2, enemy_health: 1.2, ammo_scarcity: 1.2 },
      extreme: { enemy_damage: 1.5, enemy_health: 1.5, ammo_scarcity: 1.5 }
    };
    apply_difficulty_config(config[difficulty]);  
  }
};

// Periodically assess difficulty and make adjustments
function* difficulty_adjustment_coroutine() {  
  while (true) {
    const curr_difficulty = difficulty_manager.calculate_difficulty();
    difficulty_manager.adjust_game_parameters(curr_difficulty);
    yield* wait(5); // Reassess every 5 seconds
  }
}

start_coroutine(difficulty_adjustment_coroutine());

/*--------------------------------------
Cutting Edge Multiplayer Features
--------------------------------------*/

// Intelligent lobby system
const lobby_manager = {
  match_players_by_skill(lobby, player) {
    // Find players closest to the new player's skill level
    const player_skill = get_player_skill_rating(player);
    
    const get_skill_delta = (p) => 
      Math.abs(get_player_skill_rating(p) - player_skill);

    const sorted_players = lobby.players
      .map(p => ({ player: p, delta: get_skill_delta(p) }))
      .sort((a, b) => a.delta - b.delta);
  
    return sorted_players
      .slice(0, 4) // Take closest 4 skill matches 
      .map(p => p.player);
  },

  // Advanced team balancing 
  balance_teams(lobby) {
    const players_by_skill = lobby.players.sort((a, b) => 
      get_player_skill_rating(b) -
      get_player_skill_rating(a)   
    );

    const team1 = [];
    const team2 = [];
    for (let i = 0; i < players_by_skill.length; i++) {
      if (i % 2 === 0) team1.push(players_by_skill[i]);
      else             team2.push(players_by_skill[i]);
    } 

    set_player_teams(lobby, team1, team2);
  }
};

// Matchmaking flow
function* matchmaking_flow(player) {
  show_matchmaking_ui();

  try {
    const lobby = yield* find_match(player);
    const balanced_lobby = yield* balance_match(player, lobby);
    const match = yield* start_match(balanced_lobby);
    yield* play_match(match);
    
    const results = yield* end_match(match);
    update_player_skill(player, results);
    show_match_results(results);
  } catch (error) {
    // Handle disconnects, errors, etc.
    show_error(error); 
  }
}  

// Trigger matchmaking on play clicked
on_play_clicked(player => {
  start_coroutine(matchmaking_flow(player));  
});

/*--------------------------------------
Expansive Procedural Generation
--------------------------------------*/

// City layout generation
const city_layout = city_generator({
  size: vec2(4, 4), // 4 km x 4 km
  districts: {
    downtown: {
      blocks: {
        layout: "grid",
        block_size: vec2(80, 80),
        street_width: 15,
        num_blocks: 8 
      },
      building_types: ["skyscraper", "office", "hotel"],
      max_building_height: 300,
      building_density: 0.7
    },
    midtown: {
      blocks: {
        layout: "radial",
        ring_width: 120,
        num_rings: 3, 
      },
      building_types: ["apartment", "shop", "office"],
      max_building_height: 90,
      building_density: 0.5
    },
    suburbs: {
      blocks: {
        layout: "organic",
        average_block_size: 200,
        max_block_size_deviation: 50
      },
      building_types: ["house", "convenience_store"],
      max_building_height: 30,
      building_density: 0.3
    },
    industrial: {
      blocks: {
        layout: "grid",
        block_size: vec2(150, 150),
        street_width: 20,
        num_blocks: 4
      },  
      building_types: ["warehouse", "factory", "power_plant"],
      max_building_height: 60,
      building_density: 0.4
    }
  },
  highway_ring_road: {
    ring_radius: 1500,
    num_exits: 4
  }
});

// Seamlessly stream in city areas as player explores
const city_loader = {
  loaded_areas: new Map(),
  
  *load_area(coords) {
    // Check if area already loaded  
    if (this.loaded_areas.has(coords)) return;

    // Load city area asynchronously  
    const area = yield city_layout.generate_area(coords);
    this.loaded_areas.set(coords, area);
  },
  
  update() {
    const curr_area = world.get_area(global.player.position);
    
    // Load current area and neighbors
    for (const coords of curr_area.neighbor_coords()) {
      start_coroutine(this.load_area(coords)); 
    }

    // Unload areas beyond neighbor range
    for (const coords of this.loaded_areas.keys()) {
      if (!curr_area.is_neighbor(coords) &&
          coords !== curr_area) {
        this.loaded_areas.delete(coords);
        world.destroy_area(coords);
      }
    }
  }
};

// Update city streaming every frame
on_frame(() => city_loader.update());
`)

  // IDE State
  const [ide, setIde] = useState({
    mode: "coding", // coding, running, debugging
    runState: "stopped", // stopped, running, paused
    theme: "dark",
    currentFile: "game.js",
    tabs: [{ name: "game.js", active: true }],
    font: "Fira Code",
    fontSize: 16,
    minimap: "always", // always, mouseover, never
    highlightActiveLine: true,
    files: [
      {
        name: "game.js",
        content: code,
      },
      {
        name: "player.js",
        content: "// Player controller code",
      },
      {
        name: "enemy.js",
        content: "// Enemy AI code",
      },
      {
        name: "ui.js",
        content: "// User interface code",
      },
    ],
    consoleMessages: [],
    errors: [],
    profilerOpen: false,
    aiAssistOpen: false,
    multiplayerOpen: false,
    tutorialOpen: false,
    fullScreen: false,
    consoleOpen: true,
  })

  const codeEditor = useRef()

  // Methods
  const openFile = useCallback(
    (file) => {
      setIde({
        ...ide,
        currentFile: file.name,
        tabs: ide.tabs.map((t) => ({
          ...t,
          active: t.name === file.name,
        })),
      })
    },
    [ide],
  )

  const toggleConsole = () => {
    setIde({
      ...ide,
      consoleOpen: !ide.consoleOpen,
    })
  }

  const runCode = () => {
    console.log("Running legendary SAAAM game...")
    // Simulate running code
    setTimeout(() => {
      setIde({
        ...ide,
        mode: "running",
        runState: "running",
        consoleMessages: [
          ...ide.consoleMessages,
          { type: "info", text: "Compiling scripts..." },
          { type: "info", text: "Scripts compiled successfully!" },
          { type: "info", text: "Initializing renderer" },
          { type: "info", text: "Loading assets..." },
          { type: "info", text: "Initializing game systems..." },
          { type: "info", text: "Establishing network connection" },
          { type: "info", text: "Synchronizing world state" },
          { type: "success", text: "Game running!" },
        ],
      })
    }, 1500)
  }

  const stopCode = () => {
    setIde({
      ...ide,
      mode: "coding",
      runState: "stopped",
      consoleMessages: ide.consoleMessages.concat({
        type: "info",
        text: "Game stopped",
      }),
    })
  }

  const toggleProfiling = () => {
    setIde({
      ...ide,
      profilerOpen: !ide.profilerOpen,
    })
  }

  const toggleMultiplayerTools = () => {
    setIde({
      ...ide,
      multiplayerOpen: !ide.multiplayerOpen,
    })
  }

  const toggleTheme = () => {
    setIde({
      ...ide,
      theme: ide.theme === "dark" ? "light" : "dark",
    })
  }

  // Render the current file content
  const getCurrentFileContent = () => {
    const file = ide.files.find((f) => f.name === ide.currentFile)
    return file ? file.content : ""
  }

  // Update file content
  const updateFileContent = (content) => {
    setIde({
      ...ide,
      files: ide.files.map((f) => (f.name === ide.currentFile ? { ...f, content } : f)),
    })

    if (ide.currentFile === "game.js") {
      setCode(content)
    }
  }

  return (
    <div
      className={`flex flex-col h-full w-full ${ide.theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      {/* Top Toolbar */}
      <div
        className={`flex items-center justify-between p-2 ${ide.theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-300"}`}
      >
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-yellow-400">LEGENDARY SAAAM IDE</span>
          <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">PRO</span>
        </div>

        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={ide.runState === "running" ? "destructive" : "default"}
                  size="sm"
                  onClick={ide.runState === "running" ? stopCode : runCode}
                  className="flex items-center space-x-1"
                >
                  {ide.runState === "running" ? (
                    <>
                      <Square className="w-4 h-4" /> <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> <span>Run</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{ide.runState === "running" ? "Stop execution" : "Run code"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIde({ ...ide, mode: ide.mode === "debugging" ? "coding" : "debugging" })}
                  className={`flex items-center space-x-1 ${ide.mode === "debugging" ? "bg-yellow-600 text-white" : ""}`}
                >
                  <Bug className="w-4 h-4" /> <span>Debug</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle debugging mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleProfiling}
                  className={`flex items-center space-x-1 ${ide.profilerOpen ? "bg-pink-600 text-white" : ""}`}
                >
                  <BarChart2 className="w-4 h-4" /> <span>Profiler</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open performance profiler</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMultiplayerTools}
                  className={`flex items-center space-x-1 ${ide.multiplayerOpen ? "bg-blue-600 text-white" : ""}`}
                >
                  <Users className="w-4 h-4" /> <span>Multiplayer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Multiplayer tools</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center space-x-1">
                  {ide.theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Project Files */}
        <div
          className={`w-48 ${ide.theme === "dark" ? "bg-gray-800 border-r border-gray-700" : "bg-gray-200 border-r border-gray-300"} overflow-y-auto`}
        >
          <div className={`p-2 font-semibold text-sm ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            PROJECT FILES
          </div>
          <div className="px-2">
            {ide.files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center p-1 rounded cursor-pointer ${
                  file.name === ide.currentFile
                    ? ide.theme === "dark"
                      ? "bg-blue-800 text-white"
                      : "bg-blue-100 text-blue-800"
                    : ide.theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-300"
                }`}
                onClick={() => openFile(file)}
              >
                <span className="text-sm">📄 {file.name}</span>
              </div>
            ))}
          </div>

          <div className={`p-2 font-semibold text-sm ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-4`}>
            ASSETS
          </div>
          <div className="px-2">
            <div
              className={`flex items-center p-1 rounded cursor-pointer ${ide.theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
            >
              <span className="text-sm">🖼️ sprites/</span>
            </div>
            <div
              className={`flex items-center p-1 rounded cursor-pointer ${ide.theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
            >
              <span className="text-sm">🔊 sounds/</span>
            </div>
            <div
              className={`flex items-center p-1 rounded cursor-pointer ${ide.theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
            >
              <span className="text-sm">🏞️ rooms/</span>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div
            className={`flex ${ide.theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-gray-200 border-b border-gray-300"}`}
          >
            {ide.tabs.map((tab, index) => (
              <button
                key={index}
                className={`px-4 py-2 text-sm font-medium ${
                  tab.active
                    ? ide.theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                    : ide.theme === "dark"
                      ? "text-gray-400 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-300"
                }`}
                onClick={() => openFile({ name: tab.name })}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto p-2">
              <textarea
                className={`w-full h-full font-mono p-2 resize-none focus:outline-none ${
                  ide.theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
                }`}
                value={getCurrentFileContent()}
                onChange={(e) => updateFileContent(e.target.value)}
                spellCheck="false"
              ></textarea>
            </div>
          </div>

          {/* Console Output */}
          {ide.consoleOpen && (
            <div
              className={`h-40 ${ide.theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-200 border-t border-gray-300"} overflow-y-auto`}
            >
              <div
                className={`flex items-center justify-between px-2 py-1 ${ide.theme === "dark" ? "bg-gray-900" : "bg-gray-300"}`}
              >
                <span className="text-sm font-semibold">Console</span>
                <button
                  className={`text-sm ${ide.theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  onClick={() => setIde({ ...ide, consoleMessages: [] })}
                >
                  Clear
                </button>
              </div>
              <div className="p-2 font-mono text-sm">
                {ide.consoleMessages.map((entry, index) => (
                  <div
                    key={index}
                    className={
                      entry.type === "error"
                        ? "text-red-400"
                        : entry.type === "success"
                          ? "text-green-400"
                          : ide.theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-700"
                    }
                  >
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties, variables, and documentation */}
        <div
          className={`w-64 ${ide.theme === "dark" ? "bg-gray-800 border-l border-gray-700" : "bg-gray-200 border-l border-gray-300"} overflow-y-auto`}
        >
          <div className="p-2">
            {/* Tab selection for right sidebar */}
            <Tabs defaultValue="inspector">
              <TabsList className="w-full">
                <TabsTrigger
                  value="inspector"
                  className={`flex-1 ${ide.theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900 text-gray-700"}`}
                >
                  Inspector
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className={`flex-1 ${ide.theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900 text-gray-700"}`}
                >
                  Docs
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className={`flex-1 ${ide.theme === "dark" ? "data-[state=active]:text-white" : "data-[state=active]:text-gray-900 text-gray-700"}`}
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inspector" className="mt-2">
                <div
                  className={`text-sm font-semibold ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}
                >
                  OBJECT PROPERTIES
                </div>
                <div className={`border ${ide.theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded mb-4`}>
                  <div
                    className={`${ide.theme === "dark" ? "bg-gray-700" : "bg-gray-300"} px-2 py-1 text-sm font-medium`}
                  >
                    World
                  </div>
                  <div className="p-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Terrain</span>
                      <span className={`text-sm ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        mountains.png
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Water Height</span>
                      <span className={`text-sm ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>30</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fog Distance</span>
                      <span className={`text-sm ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>100</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-semibold ${ide.theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}
                >
                  DOCUMENTATION
                </div>
                <div className={`${ide.theme === "dark" ? "bg-gray-900" : "bg-white"} p-2 rounded text-sm`}>
                  <h3 className="text-yellow-400 font-bold">SAAAM Language</h3>
                  <p className={`mt-1 ${ide.theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    A clean, intuitive language for game development.
                  </p>

                  <h4 className="text-yellow-400 font-medium mt-3">Quick Reference</h4>
                  <div className={`mt-1 space-y-1 ${ide.theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    <details>
                      <summary
                        className={`cursor-pointer ${ide.theme === "dark" ? "hover:text-white" : "hover:text-gray-900"}`}
                      >
                        Coroutines
                      </summary>
                      <ul className="pl-4 mt-1 space-y-1 list-disc">
                        <li>function* - Define coroutine</li>
                        <li>yield* - Pause and wait for another coroutine</li>
                        <li>start_coroutine() - Start a coroutine</li>
                      </ul>
                    </details>
                    <details>
                      <summary
                        className={`cursor-pointer ${ide.theme === "dark" ? "hover:text-white" : "hover:text-gray-900"}`}
                      >
                        Multiplayer
                      </summary>
                      <ul className="pl-4 mt-1 space-y-1 list-disc">
                        <li>match_players_by_skill() - Match players by skill level</li>
                        <li>balance_teams() - Balance teams based on skill</li>
                        <li>find_match() - Find a suitable match</li>
                      </ul>
                    </details>
                  </div>

                  <div className="mt-3">
                    <a href="#" className="text-blue-400 hover:underline">
                      View Full Documentation
                    </a>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="docs" className="mt-2">
                <div className="p-2 space-y-4">
                  <h3 className="font-bold text-yellow-400">SAAAM Engine Documentation</h3>
                  <p className={ide.theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    The SAAAM engine provides powerful tools for game development with a focus on performance and ease
                    of use.
                  </p>

                  <h4 className="font-semibold text-yellow-400">Key Features</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Coroutine-based game flow</li>
                    <li>Advanced procedural generation</li>
                    <li>Integrated multiplayer support</li>
                    <li>Dynamic difficulty adjustment</li>
                    <li>Cinematic cutscene system</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-2">
                <div className="p-2 space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${ide.theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Font Size
                    </label>
                    <select
                      className={`mt-1 block w-full p-2 ${
                        ide.theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } rounded-md shadow-sm focus:outline-none`}
                      value={ide.fontSize}
                      onChange={(e) => setIde({ ...ide, fontSize: Number.parseInt(e.target.value) })}
                    >
                      <option value="12">12px</option>
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                      <option value="20">20px</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${ide.theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Show Minimap
                    </label>
                    <select
                      className={`mt-1 block w-full p-2 ${
                        ide.theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } rounded-md shadow-sm focus:outline-none`}
                      value={ide.minimap}
                      onChange={(e) => setIde({ ...ide, minimap: e.target.value })}
                    >
                      <option value="always">Always</option>
                      <option value="mouseover">On Mouseover</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className={`flex items-center justify-between px-2 py-1 ${ide.theme === "dark" ? "bg-blue-800" : "bg-blue-600"} text-white text-xs`}
      >
        <div>Ready</div>
        <div className="flex space-x-4">
          <span>Line: 12</span>
          <span>Col: 4</span>
          <span>SAAAM v2.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default LegendarySaaamIDE
