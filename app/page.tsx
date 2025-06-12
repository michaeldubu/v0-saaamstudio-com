"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Code2,
  Gamepad2,
  Bot,
  Folder,
  Search,
  Settings,
  User,
  ArrowRight,
  Clock,
  Brain,
  Network,
  Layers,
  Database,
  Cpu,
  Boxes,
  LayoutGrid,
  Workflow,
  Lightbulb,
  Share2,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Compass,
  Globe,
  Smartphone,
  Cloud,
  Maximize,
  Minimize,
  Info,
} from "lucide-react"

// Update the import to use the correct logo component
import { SAAAMLogo } from "@/components/logo"

// Import the new hero section component after the other imports:
import { HeroSection } from "@/components/hero-section"

// Add the styles import
import "../styles/animations.css"

import { ProjectGenerator } from "@/components/project-generator"
import { PreviewPanel } from "@/components/preview-panel"
import { GitHubIntegration } from "@/components/github-integration" // Import the new component
import SaaamStudioPage from "./studio/page" // Add this import at the top

export default function SAMDevWorkspace() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [creationProgress, setCreationProgress] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to SAM.dev",
      message: "Get started by creating a new project or exploring templates",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "New Features Available",
      message: "Check out the latest quantum computing templates",
      time: "2 hours ago",
      read: true,
    },
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [generatedProject, setGeneratedProject] = useState(null)
  const [isGeneratingProject, setIsGeneratingProject] = useState(false)

  const handleProjectGenerate = (projectData: any) => {
    setIsGeneratingProject(true)

    // Simulate generation delay
    setTimeout(() => {
      setGeneratedProject(projectData)
      setIsGeneratingProject(false)
    }, 2000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle system
    const particles = []
    const connections = []
    const particleCount = 120
    const connectionDistance = 180
    const particleSize = 2.5

    // Define colors
    const colors = [
      "#4f46e5", // Indigo
      "#0ea5e9", // Sky
      "#10b981", // Emerald
      "#8b5cf6", // Violet
      "#ec4899", // Pink
    ]

    // Create particles with more variety
    for (let i = 0; i < particleCount; i++) {
      const pSize = Math.random() * particleSize + 1
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: pSize,
        origSize: pSize,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.4,
        pulse: 0,
        pulseSpeed: 0.01 + Math.random() * 0.03,
        growing: true,
      })
    }

    // Create focus points that particles will sometimes gravitate toward
    const focusPoints = [
      { x: canvas.width * 0.3, y: canvas.height * 0.3 },
      { x: canvas.width * 0.7, y: canvas.height * 0.7 },
      { x: canvas.width * 0.7, y: canvas.height * 0.3 },
      { x: canvas.width * 0.3, y: canvas.height * 0.7 },
    ]

    // Animation vars
    let frame = 0
    let now = Date.now() / 1000
    let then = now

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update time
      now = Date.now() / 1000
      const deltaTime = now - then
      then = now
      frame++

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Occasionally have particles gravitate towards focus points
        if (Math.random() < 0.01) {
          const focusPoint = focusPoints[Math.floor(Math.random() * focusPoints.length)]
          const dx = focusPoint.x - p.x
          const dy = focusPoint.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          p.vx += (dx / dist) * 0.05
          p.vy += (dy / dist) * 0.05
        }

        // Apply slight motion based on sine waves
        p.vx += Math.sin(now / 10 + i * 0.1) * 0.002
        p.vy += Math.cos(now / 12 + i * 0.1) * 0.002

        // Apply velocity limits
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1) {
          p.vx = (p.vx / speed) * 1
          p.vy = (p.vy / speed) * 1
        }

        // Move particles
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges with slight fade
        if (p.x < -50) p.x = canvas.width + 50
        if (p.x > canvas.width + 50) p.x = -50
        if (p.y < -50) p.y = canvas.height + 50
        if (p.y > canvas.height + 50) p.y = -50

        // Pulse effect
        p.pulse += p.pulseSpeed
        if (p.growing) {
          p.size = p.origSize + Math.sin(p.pulse) * 0.8
          if (p.size >= p.origSize + 0.8) p.growing = false
        } else {
          p.size = p.origSize - Math.sin(p.pulse) * 0.8
          if (p.size <= p.origSize - 0.8) p.growing = true
        }

        // Draw particle with glow effect
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Add glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        gradient.addColorStop(0, p.color.replace(")", ", 0.3)").replace("rgb", "rgba"))
        gradient.addColorStop(1, p.color.replace(")", ", 0)").replace("rgb", "rgba"))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.globalAlpha = 0.2
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - distance / connectionDistance

            // Draw connection with gradient
            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y)
            gradient.addColorStop(0, particles[i].color.replace(")", `, ${opacity * 0.5})`).replace("rgb", "rgba"))
            gradient.addColorStop(1, particles[j].color.replace(")", `, ${opacity * 0.5})`).replace("rgb", "rgba"))

            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Create wave effects
      const waveCount = 3
      for (let w = 0; w < waveCount; w++) {
        const frequency = 0.001 + w * 0.0005
        const amplitude = 150 + w * 50
        const speed = 0.1 + w * 0.05

        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height * 0.5 + Math.sin(x * frequency + now * speed) * amplitude

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.strokeStyle = `rgba(80, 140, 255, ${0.03 - w * 0.01})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const [animationStyles, setAnimationStyles] = useState(`
  @keyframes pulse-subtle {
    0% { opacity: 0.7; }
    50% { opacity: 0.9; }
    100% { opacity: 0.7; }
  }
  .animate-pulse-subtle {
    animation: pulse-subtle 4s infinite;
  }
  .bg-grid-pattern {
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 10px 10px;
  }
`)

  // Add a style tag to the component for the animations
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = animationStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [animationStyles])

  const templates = [
    {
      id: "web-app",
      icon: Globe,
      title: "Web Application",
      description: "Build adaptive web apps with dynamic UI generation and self-optimizing components",
      tags: ["React", "TypeScript", "Adaptive UI", "Self-Optimizing"],
      difficulty: "Beginner",
      time: "5 min",
      featured: true,
      category: "software",
    },
    {
      id: "game",
      icon: Gamepad2,
      title: "Interactive Game",
      description: "Create games with AI-driven mechanics, procedural content, and adaptive difficulty",
      tags: ["Game Engine", "AI NPCs", "Procedural", "Adaptive"],
      difficulty: "Intermediate",
      time: "15 min",
      featured: true,
      category: "games",
    },
    {
      id: "ai-agent",
      icon: Bot,
      title: "AI Agent",
      description: "Deploy intelligent agents that learn, adapt, and evolve through interaction",
      tags: ["Machine Learning", "Autonomous", "Multi-Modal", "Evolving"],
      difficulty: "Advanced",
      time: "10 min",
      featured: true,
      category: "ai",
    },
    {
      id: "mobile-app",
      icon: Smartphone,
      title: "Mobile App",
      description: "Cross-platform mobile apps with adaptive interfaces and intelligent features",
      tags: ["React Native", "Cross-Platform", "Adaptive", "Intelligent"],
      difficulty: "Intermediate",
      time: "8 min",
      category: "software",
    },
    {
      id: "api-service",
      icon: Cloud,
      title: "API Service",
      description: "Self-optimizing backend services and APIs with intelligent scaling",
      tags: ["Node.js", "Auto-Scale", "Smart Routing", "Self-Healing"],
      difficulty: "Intermediate",
      time: "7 min",
      category: "software",
    },
    {
      id: "data-pipeline",
      icon: Workflow,
      title: "Data Pipeline",
      description: "Intelligent data processing with adaptive workflows and self-optimization",
      tags: ["ETL", "Real-time", "Auto-Optimize", "Adaptive"],
      difficulty: "Advanced",
      time: "12 min",
      category: "data",
    },
    {
      id: "quantum-sim",
      icon: Cpu,
      title: "Quantum Simulator",
      description: "Simulate quantum algorithms and visualize quantum states",
      tags: ["Quantum", "Simulation", "Visualization", "Educational"],
      difficulty: "Expert",
      time: "20 min",
      category: "quantum",
    },
    {
      id: "ar-experience",
      icon: Layers,
      title: "AR Experience",
      description: "Create augmented reality experiences with intelligent object recognition",
      tags: ["AR", "3D", "Computer Vision", "Interactive"],
      difficulty: "Advanced",
      time: "15 min",
      category: "immersive",
    },
    {
      id: "neural-network",
      icon: Network,
      title: "Neural Network",
      description: "Build and train custom neural networks with visual debugging",
      tags: ["Deep Learning", "Visual Editor", "Training", "Analysis"],
      difficulty: "Advanced",
      time: "10 min",
      category: "ai",
    },
  ]

  const recentProjects = [
    {
      name: "Smart Dashboard",
      type: "Web App",
      lastModified: "2 hours ago",
      status: "Active",
      progress: 75,
    },
    {
      name: "AI Chat Bot",
      type: "AI Agent",
      lastModified: "1 day ago",
      status: "Deployed",
      progress: 100,
    },
    {
      name: "Puzzle Game",
      type: "Game",
      lastModified: "3 days ago",
      status: "Development",
      progress: 45,
    },
    {
      name: "Data Analyzer",
      type: "Data Pipeline",
      lastModified: "1 week ago",
      status: "Paused",
      progress: 60,
    },
  ]

  const featuredTemplates = templates.filter((t) => t.featured)
  const filteredTemplates = searchQuery
    ? templates.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : templates

  const handleCreateProject = () => {
    if (selectedTemplate && projectName) {
      setIsCreatingProject(true)

      // Simulate project creation with progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 5
        setCreationProgress(progress)

        if (progress >= 100) {
          clearInterval(interval)
          // In a real app, this would redirect to the project workspace
          setTimeout(() => {
            setIsCreatingProject(false)
            // Add to recent projects
            setNotifications([
              {
                id: Date.now(),
                title: "Project Created",
                message: `${projectName} has been created successfully`,
                time: "Just now",
                read: false,
              },
              ...notifications,
            ])
          }, 500)
        }
      }, 100)
    }
  }

  const categories = [
    { id: "all", name: "All Templates", icon: Boxes },
    { id: "software", name: "Software", icon: Code2 },
    { id: "games", name: "Games", icon: Gamepad2 },
    { id: "ai", name: "AI & ML", icon: Brain },
    { id: "data", name: "Data", icon: Database },
    { id: "quantum", name: "Quantum", icon: Cpu },
    { id: "immersive", name: "AR/VR", icon: Layers },
  ]

  const [activeCategory, setActiveCategory] = useState("all")

  const categoryTemplates =
    activeCategory === "all" ? filteredTemplates : filteredTemplates.filter((t) => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Quantum background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-slate-900/70">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-4">
                {/* Replace the current logo placeholder in the header with the new component */}
                {/* Find the div with class "flex items-center space-x-3" that contains the current logo and replace with: */}
                <SAAAMLogo size="medium" showVersion={true} showTagline={true} />
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-300 hover:text-white hover:bg-slate-800"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <Info className="h-5 w-5" />
                        {notifications.some((n) => !n.read) && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Help & Documentation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications panel */}
        {showNotifications && (
          <div className="absolute right-4 top-16 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Mark all as read
              </Button>
            </div>
            <ScrollArea className="h-80">
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 mb-2 rounded-lg ${notification.read ? "bg-slate-800" : "bg-slate-700"}`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-slate-400">{notification.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t border-slate-700">
              <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300">
                View all notifications
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Navigation Tabs */}
            <div className="mb-6">
              <TabsList className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-1 rounded-xl overflow-hidden">
                <TabsTrigger
                  value="discover"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Discover
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="learn"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Learn
                </TabsTrigger>
                <TabsTrigger
                  value="community"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Community
                </TabsTrigger>
                <TabsTrigger
                  value="studio"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-500 data-[state=active]:text-white"
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Studio
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discover" className="mt-0">
              <div className="space-y-8">
                {/* Welcome Section - Full Width */}
                <HeroSection />

                {/* Split Layout for Project Generation and Preview */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left Side - Project Generation */}
                  <div className="space-y-6">
                    <ProjectGenerator onGenerate={handleProjectGenerate} />

                    {/* Featured Templates */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Featured Templates</h2>
                        <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {featuredTemplates.slice(0, 3).map((template) => {
                          const Icon = template.icon
                          return (
                            <Card
                              key={template.id}
                              className={`border-slate-800 bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group ${
                                selectedTemplate === template.id ? "ring-2 ring-blue-500" : ""
                              }`}
                              onClick={() => setSelectedTemplate(template.id)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/20">
                                    <Icon className="h-4 w-4 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-sm text-white">{template.title}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                                        {template.difficulty}
                                      </Badge>
                                      <span className="text-xs text-slate-400 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {template.time}
                                      </span>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                    Use <ArrowRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Preview Panel */}
                  <div className="lg:sticky lg:top-6">
                    <PreviewPanel projectData={generatedProject} isGenerating={isGeneratingProject} />
                  </div>
                </div>

                {/* Browse Templates - Full Width */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-white">Browse All Templates</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Grid
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Sort
                      </Button>
                    </div>
                  </div>

                  <div className="flex mb-4 overflow-x-auto pb-2">
                    {categories.map((category) => {
                      const Icon = category.icon
                      return (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "outline"}
                          size="sm"
                          className={`mr-2 ${
                            activeCategory === category.id
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-slate-700 text-slate-300 hover:text-white"
                          }`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </Button>
                      )
                    })}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryTemplates.map((template) => {
                      const Icon = template.icon
                      return (
                        <Card
                          key={template.id}
                          className="border-slate-800 bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group"
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/20">
                                <Icon className="h-4 w-4 text-blue-400" />
                              </div>
                              <div>
                                <CardTitle className="text-sm text-white">{template.title}</CardTitle>
                                <Badge variant="outline" className="text-xs border-slate-700 text-slate-300 mt-1">
                                  {template.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-slate-300 mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-2">Projects Tab Content</h2>
                <p className="text-slate-300">This tab would contain your projects dashboard</p>
              </div>
            </TabsContent>

            <TabsContent value="learn" className="mt-0">
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-2">Learning Resources</h2>
                <p className="text-slate-300">This tab would contain tutorials, documentation and guides</p>
              </div>
            </TabsContent>

            <TabsContent value="community" className="mt-0">
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-2">Community Hub</h2>
                <p className="text-slate-300">This tab would contain community features, forums and shared projects</p>
              </div>
            </TabsContent>

            <TabsContent value="studio" className="mt-0 h-[calc(100vh-180px)]">
              {" "}
              {/* Adjust height as needed */}
              <SaaamStudioPage />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar for GitHub Integration */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="lg:col-start-1">
              {/* This column can be used for other content if needed, or left empty */}
            </div>
            <div className="lg:col-start-2">
              <GitHubIntegration />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-6 mt-8 backdrop-blur-md bg-slate-900/70 relative overflow-hidden">
          <div className="absolute inset-0 circuit-board opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <SAAAMLogo size="small" showVersion={false} showTagline={false} />
                </div>
                <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Status
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                      Newsletter
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
              <div className="mt-6 flex items-center">
                
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">© 2024 SAAAM LLC. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
