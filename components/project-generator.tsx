"use client"

import { useRef } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Brain,
  Code2,
  Database,
  Calculator,
  ChefHat,
  BarChart3,
  CreditCard,
  MessageSquare,
  Camera,
  Music,
  FileText,
  Layers,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

interface ProjectGeneratorProps {
  onGenerate: (projectData: any) => void
}

export function ProjectGenerator({ onGenerate }: ProjectGeneratorProps) {
  const [projectDescription, setProjectDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState("react")
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  const quickTemplates = [
    { id: "tipping-calculator", name: "Tipping Calculator", icon: Calculator, color: "bg-blue-500" },
    { id: "recipe-generator", name: "Recipe Generator", icon: ChefHat, color: "bg-green-500" },
    { id: "erp-dashboard", name: "ERP Dashboard", icon: BarChart3, color: "bg-purple-500" },
    { id: "expense-tracker", name: "Expense Tracker", icon: CreditCard, color: "bg-orange-500" },
    { id: "todo-app", name: "Todo App", icon: FileText, color: "bg-cyan-500" },
    { id: "chat-app", name: "Chat App", icon: MessageSquare, color: "bg-pink-500" },
    { id: "photo-gallery", name: "Photo Gallery", icon: Camera, color: "bg-indigo-500" },
    { id: "music-player", name: "Music Player", icon: Music, color: "bg-red-500" },
  ]

  const frameworks = [
    { id: "react", name: "React", icon: "⚛️" },
    { id: "vue", name: "Vue.js", icon: "🟢" },
    { id: "angular", name: "Angular", icon: "🔺" },
    { id: "svelte", name: "Svelte", icon: "🧡" },
    { id: "nextjs", name: "Next.js", icon: "▲" },
    { id: "nuxt", name: "Nuxt.js", icon: "💚" },
  ]

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "JS" },
    { id: "typescript", name: "TypeScript", icon: "TS" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "go", name: "Go", icon: "Go" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "csharp", name: "C#", icon: ".NET" },
    { id: "rust", name: "Rust", icon: "🦀" },
    { id: "php", name: "PHP", icon: "🐘" },
    { id: "ruby", name: "Ruby", icon: "💎" },
    { id: "swift", name: "Swift", icon: " swift" },
    { id: "kotlin", name: "Kotlin", icon: "K" },
  ]

  const features = [
    { id: "auth", name: "Authentication", icon: "🔐" },
    { id: "database", name: "Database", icon: "🗄️" },
    { id: "api", name: "REST API", icon: "🔌" },
    { id: "realtime", name: "Real-time Updates", icon: "⚡" },
    { id: "payments", name: "Payment Integration", icon: "💳" },
    { id: "notifications", name: "Push Notifications", icon: "🔔" },
    { id: "analytics", name: "Analytics", icon: "📊" },
    { id: "ai", name: "AI Integration", icon: "🤖" },
    { id: "responsive", name: "Responsive Design", icon: "📱" },
    { id: "pwa", name: "Progressive Web App", icon: "📲" },
    { id: "testing", name: "Testing Suite", icon: "🧪" },
    { id: "deployment", name: "Auto Deployment", icon: "🚀" },
  ]

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId],
    )
  }

  const handleGenerate = () => {
    const projectData = {
      description: projectDescription,
      template: selectedTemplate,
      framework: selectedFramework,
      language: selectedLanguage,
      features: selectedFeatures,
      timestamp: Date.now(),
    }
    onGenerate(projectData)
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-lg overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-[80px] opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full filter blur-[80px] opacity-5"></div>
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-violet-300">
              Prototype an app with AI
            </span>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
        <CardDescription className="text-slate-300 ml-10">
          Describe your project in natural language and let our quantum-enhanced AI generate the perfect starting point
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Project Description */}
        <div className="relative">
          <Textarea
            placeholder="An app that creates recipes from photos..."
            className="min-h-[100px] bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 pl-4 pr-10 transition-all"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <div className="absolute right-3 bottom-3 text-slate-400">
            <Brain className="h-5 w-5 opacity-60" />
          </div>
          <Badge className="absolute top-3 right-3 bg-slate-700 text-slate-300 border-slate-600">TAB</Badge>
        </div>

        {/* Quick Templates */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Start Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className={`h-auto p-3 flex flex-col items-center gap-2 ${
                    selectedTemplate === template.id
                      ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                      : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`p-2 rounded-lg ${template.color} bg-opacity-20`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-center">{template.name}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <Tabs defaultValue="framework" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="framework">Framework</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
          </TabsList>

          <TabsContent value="framework" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Choose Framework</h4>
              <div className="grid grid-cols-3 gap-2">
                {frameworks.map((framework) => (
                  <Button
                    key={framework.id}
                    variant={selectedFramework === framework.id ? "default" : "outline"}
                    className={`h-auto p-3 flex flex-col items-center gap-2 ${
                      selectedFramework === framework.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-700 text-slate-300 hover:text-white"
                    }`}
                    onClick={() => setSelectedFramework(framework.id)}
                  >
                    <span className="text-lg">{framework.icon}</span>
                    <span className="text-xs">{framework.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Select Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {features.map((feature) => (
                  <Button
                    key={feature.id}
                    variant={selectedFeatures.includes(feature.id) ? "default" : "outline"}
                    className={`h-auto p-3 flex items-center gap-2 justify-start ${
                      selectedFeatures.includes(feature.id)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-700 text-slate-300 hover:text-white"
                    }`}
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    <span>{feature.icon}</span>
                    <span className="text-xs">{feature.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Choose Language</h4>
              <div className="relative flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 z-10 bg-slate-900/70 hover:bg-slate-800/70"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="h-5 w-5 text-slate-300" />
                </Button>
                <div ref={scrollContainerRef} className="flex overflow-x-auto scrollbar-hide py-2 px-10">
                  <div className="flex gap-2">
                    {languages.map((language) => (
                      <Button
                        key={language.id}
                        variant={selectedLanguage === language.id ? "default" : "outline"}
                        className={`flex-shrink-0 h-auto p-3 flex flex-col items-center gap-2 ${
                          selectedLanguage === language.id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-slate-700 text-slate-300 hover:text-white"
                        }`}
                        onClick={() => setSelectedLanguage(language.id)}
                      >
                        <span className="text-lg">{language.icon}</span>
                        <span className="text-xs">{language.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 z-10 bg-slate-900/70 hover:bg-slate-800/70"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Start Coding Section */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Start coding an app</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Code2 className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Database className="h-4 w-4 mr-2" />
              Import Repo
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Layers className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-900/30"
          onClick={handleGenerate}
          disabled={!projectDescription.trim()}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Project
          <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Quantum</span>
        </Button>
      </CardContent>
    </Card>
  )
}
