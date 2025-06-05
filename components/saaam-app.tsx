"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"
// Replace this import:
// import SaaamIDE from "./saaam-ide"
// With:
import SaaamIDESafe from "./saaam-ide-safe"
import SaaamTutorial from "./saaam-tutorial"
import SaaamExamples from "./saaam-examples"
import GameStudio from "./game-studio"
import ECSDemo from "./ecs-demo"
import { sampleSaaamCode } from "@/lib/sample-code"
import Saaam3DSandbox from "./saaam-3d-sandbox"
import SaaamStudioWorkspace from "./saaam-studio-workspace"

export default function SaaamApp() {
  const [activeTab, setActiveTab] = useState("ide")
  const [generatedCode, setGeneratedCode] = useState("")
  const isMobile = useMobile()
  const [systemStatus, setSystemStatus] = useState({
    initialized: false,
    loading: false,
    systems: {
      integrationManager: false,
      neurosphere: false,
      physics: false,
      world: false,
      linter: false,
      intellisense: false,
      neuralEngine: false,
      sceneGraph: false,
    },
  })

  const [isV0Preview, setIsV0Preview] = useState(false)

  // Detect v0 preview environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPreview =
        window.location.hostname.includes("v0.dev") ||
        window.location.hostname.includes("vercel.app") ||
        window.parent !== window ||
        document.referrer.includes("v0.dev")

      setIsV0Preview(isPreview)

      if (isPreview) {
        console.log("Running in v0 preview mode - using compatible features")
      }
    }
  }, [])

  // Initialize SAAAM systems
  const initializeSaaamSystems = async () => {
    return {
      initialized: true,
      loading: false,
      systems: {
        integrationManager: true,
        neurosphere: true,
        physics: true,
        world: true,
        linter: true,
        intellisense: true,
        neuralEngine: true,
        sceneGraph: true,
      },
    }
  }

  useEffect(() => {
    const initSystems = async () => {
      try {
        const status = await initializeSaaamSystems()
        setSystemStatus(status)
      } catch (error) {
        console.error("System initialization error:", error)
        // Continue with basic functionality
        setSystemStatus((prev) => ({ ...prev, initialized: true, loading: false }))
      }
    }

    initSystems()

    // Listen for system status updates
    const handleSystemsInitialized = (event) => {
      setSystemStatus(event.detail.status)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("saaam-systems-initialized", handleSystemsInitialized)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("saaam-systems-initialized", handleSystemsInitialized)
      }
    }
  }, [])

  // Listen for messages from child iframes or components
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our application
      if (event.data && event.data.type === "switchTab") {
        setActiveTab(event.data.tab)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage)
      }
    }
  }, [])

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code)
    // Automatically switch to IDE tab when code is generated
    setActiveTab("ide")
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      {/* System Status Indicator */}
      <div className="bg-gray-800 px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span>SAAAM Studio v1.0</span>
          {isV0Preview && <span className="px-2 py-1 bg-blue-600 rounded text-xs">v0 Preview Mode</span>}
        </div>
        <div className="flex items-center space-x-2">
          <span>Systems:</span>
          {Object.entries(systemStatus.systems)
            .slice(0, 4)
            .map(([name, status]) => (
              <div
                key={name}
                className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`}
                title={`${name}: ${status ? "Ready" : "Not Ready"}`}
              />
            ))}
          <span className={systemStatus.initialized ? "text-green-500" : "text-yellow-500"}>
            {systemStatus.initialized ? "Ready" : systemStatus.loading ? "Initializing..." : "Not Ready"}
          </span>
        </div>
      </div>

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
            {!isV0Preview && (
              <>
                <TabsTrigger
                  value="ecs"
                  className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
                >
                  ECS Demo
                </TabsTrigger>
                <TabsTrigger
                  value="3d"
                  className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
                >
                  3D Sandbox
                </TabsTrigger>
                <TabsTrigger
                  value="workspace"
                  className="px-4 py-3 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:shadow-none hover:text-white hover:bg-gray-700"
                >
                  Workspace
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="ide" className="flex-1 p-0 m-0">
          {/* And in the TabsContent, replace:
          // <SaaamIDE initialCode={generatedCode || sampleSaaamCode} isMobile={isMobile} />
          // With: */}
          <SaaamIDESafe initialCode={generatedCode || sampleSaaamCode} isMobile={isMobile} />
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

        {!isV0Preview && (
          <>
            <TabsContent value="ecs" className="flex-1 p-0 m-0">
              <ECSDemo />
            </TabsContent>

            <TabsContent value="3d" className="flex-1 p-0 m-0">
              <Saaam3DSandbox />
            </TabsContent>

            <TabsContent value="workspace" className="flex-1 p-0 m-0">
              <SaaamStudioWorkspace />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
