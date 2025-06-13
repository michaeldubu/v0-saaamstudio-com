"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the import to use the correct logo component
import { SAAAMLogo } from "@/components/logo"

// Import the new hero section component after the other imports:
import { HeroSection } from "@/components/hero-section"

// Add the styles import
import "../styles/animations.css"

import { ProjectGenerator } from "@/components/project-generator"
import { PreviewPanel } from "@/components/preview-panel"
import { GithubIntegration } from "@/components/github-integration" // Import the new component
import SaaamStudioPage from "./studio/page" // Add this import at the top

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [generatedProject, setGeneratedProject] = useState<any>(null)

  const handleGenerateProject = (projectData: any) => {
    setGeneratedProject(projectData)
    setActiveTab("studio") // Switch to Studio tab after generation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <SAAAMLogo size="medium" />
        <nav>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="studio">Studio</TabsTrigger>
              <TabsTrigger value="github">GitHub</TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      </header>

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home">
            <HeroSection />
            <div className="mt-8">
              <ProjectGenerator onGenerateProject={handleGenerateProject} />
            </div>
            <div className="mt-8">
              <PreviewPanel />
            </div>
          </TabsContent>
          <TabsContent value="studio" className="h-[calc(100vh-180px)]">
            {" "}
            {/* Adjust height as needed */}
            <SaaamStudioPage initialProjectData={generatedProject} />
          </TabsContent>
          <TabsContent value="github">
            <GithubIntegration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
