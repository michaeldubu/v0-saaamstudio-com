"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"
import SaaamIDE from "./saaam-ide"
import SaaamTutorial from "./saaam-tutorial"
import SaaamExamples from "./saaam-examples"
import GameStudio from "./game-studio"
import ECSDemo from "./ecs-demo"
import { sampleSaaamCode } from "@/lib/sample-code"

export default function SaaamApp() {
  const [activeTab, setActiveTab] = useState("ide")
  const [generatedCode, setGeneratedCode] = useState("")
  const isMobile = useMobile()

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
              className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
            >
              Code Editor
            </TabsTrigger>
            <TabsTrigger
              value="studio"
              className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
            >
              Game Studio
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
            >
              Examples
            </TabsTrigger>
            <TabsTrigger
              value="tutorial"
              className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
            >
              Tutorial
            </TabsTrigger>
            <TabsTrigger
              value="ecs"
              className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
            >
              ECS Demo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ide" className="flex-1 p-0 m-0">
          <SaaamIDE initialCode={generatedCode || sampleSaaamCode} isMobile={isMobile} />
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
