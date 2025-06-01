"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-mobile"
import SaaamIDE from "./saaam-ide"
import SaaamTutorial from "./saaam-tutorial"
import SaaamExamples from "./saaam-examples"
import GameStudio from "./game-studio"
import LegendarySaaamIDE from "./legendary-saaam-ide"
import ECSDemo from "./ecs-demo"
import { sampleSaaamCode } from "@/lib/sample-code"

export default function SaaamApp() {
  const [activeTab, setActiveTab] = useState("ide")
  const [generatedCode, setGeneratedCode] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showLegendaryIDE, setShowLegendaryIDE] = useState(false)

  // Listen for messages from child iframes or components
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our application
      if (event.data && event.data.type === "switchTab") {
        setActiveTab(event.data.tab)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code)
    // Automatically switch to IDE tab when code is generated
    setActiveTab("ide")
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-gray-700">
          <TabsList className="bg-gray-800 p-0 h-auto">
            <TabsTrigger
              value="ide"
              className="px-4 py-3 data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none"
            >
              Code Editor
            </TabsTrigger>
            <TabsTrigger
              value="studio"
              className="px-4 py-3 data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none"
            >
              Game Studio
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="px-4 py-3 data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none"
            >
              Examples
            </TabsTrigger>
            <TabsTrigger
              value="tutorial"
              className="px-4 py-3 data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none"
            >
              Tutorial
            </TabsTrigger>
            <TabsTrigger
              value="ecs"
              className="px-4 py-3 data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none"
            >
              ECS Demo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ide" className="flex-1 p-0 m-0">
          {showLegendaryIDE ? (
            <div className="relative w-full h-full">
              <LegendarySaaamIDE />
              <button
                className="absolute top-4 right-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                onClick={() => setShowLegendaryIDE(false)}
              >
                Switch to Standard IDE
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <SaaamIDE initialCode={generatedCode || sampleSaaamCode} isMobile={isMobile} />
              <button
                className="absolute top-4 right-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                onClick={() => setShowLegendaryIDE(true)}
              >
                Switch to Legendary IDE
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="studio" className="flex-1 p-0 m-0">
          <GameStudio onCodeGenerated={handleCodeGenerated} />
        </TabsContent>

        <TabsContent value="examples" className="flex-1 p-0 m-0">
          <SaaamExamples />
        </TabsContent>

        <TabsContent value="tutorial" className="flex-1 p-0 m-0">
          <SaaamTutorial />
        </TabsContent>

        <TabsContent value="ecs" className="flex-1 p-0 m-0">
          <ECSDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}
