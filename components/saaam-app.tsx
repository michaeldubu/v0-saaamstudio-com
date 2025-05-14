"use client"

import type React from "react"
import { useState, useEffect } from "react"
import SaaamIDE from "./saaam-ide"
import GameStudio from "./game-studio"
import StateMachineEditor from "./state-machine-editor"
import ShaderEditor from "./shader-editor"
import SaaamTutorial from "./saaam-tutorial"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ECSDemo from "./ecs-demo"
import { useMediaQuery } from "@/hooks/use-mobile"
import SaaamExamples from "./saaam-examples"
import CopilotPanel from "./copilot-panel"
import { StudioProvider } from "@/contexts/studio-context"
import SaaamStudioWorkspace from "./saaam-studio-workspace"

const SaaamApp: React.FC = () => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("ide")
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    // Listen for messages from the examples component
    const handleMessage = (event) => {
      if (event.data.type === "loadCodeInIDE") {
        // Set the generated code to load in the IDE
        setGeneratedCode(event.data.code)

        // If there's a title, we could show it in a toast or notification
        console.log(`Loading example: ${event.data.title}`)
      }

      if (event.data.type === "switchTab") {
        // Switch to the specified tab
        setActiveTab(event.data.tab)
      }
    }

    window.addEventListener("message", handleMessage)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <StudioProvider>
      <div className="w-full h-screen flex flex-col">
        <Tabs
          defaultValue="ide"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full h-full flex flex-col"
        >
          <div className="bg-gray-900 border-b border-gray-800 px-1 sm:px-2 md:px-4 overflow-x-auto">
            <TabsList className="h-12 md:h-14 w-max min-w-full">
              <TabsTrigger value="ide" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                SAAAM IDE
              </TabsTrigger>
              <TabsTrigger value="studio" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                Game Studio
              </TabsTrigger>
              <TabsTrigger value="examples" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                Examples
              </TabsTrigger>
              <TabsTrigger
                value="state-machine"
                className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4"
              >
                State Machine
              </TabsTrigger>
              <TabsTrigger value="shader" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                Shader Editor
              </TabsTrigger>
              <TabsTrigger value="ecs-demo" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                ECS Demo
              </TabsTrigger>
              <TabsTrigger value="tutorial" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                How to Use
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                Copilot
              </TabsTrigger>
              {/* Add the new Sandbox tab */}
              <TabsTrigger value="sandbox" className="text-xs sm:text-sm md:text-lg whitespace-nowrap px-2 md:px-4">
                Sandbox
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ide" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <SaaamIDE initialCode={generatedCode || undefined} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="studio" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <GameStudio onCodeGenerated={handleCodeGenerated} />
          </TabsContent>

          <TabsContent value="examples" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <SaaamExamples />
          </TabsContent>

          <TabsContent value="state-machine" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <StateMachineEditor onCodeGenerated={handleCodeGenerated} />
          </TabsContent>

          <TabsContent value="shader" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <ShaderEditor onCodeGenerated={handleCodeGenerated} />
          </TabsContent>

          <TabsContent value="ecs-demo" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <ECSDemo />
          </TabsContent>

          <TabsContent value="tutorial" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <SaaamTutorial />
          </TabsContent>

          <TabsContent value="copilot" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4 overflow-auto">
              <CopilotPanel />
            </div>
          </TabsContent>

          {/* Add the new Sandbox tab content */}
          <TabsContent value="sandbox" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
            <SaaamStudioWorkspace />
          </TabsContent>
        </Tabs>
      </div>
    </StudioProvider>
  )
}

export default SaaamApp

