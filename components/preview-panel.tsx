"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Eye, Download, Share2, Maximize2, RefreshCw, Smartphone, Monitor, Tablet } from "lucide-react"

interface PreviewPanelProps {
  projectData: any
  isGenerating: boolean
}

export function PreviewPanel({ projectData, isGenerating }: PreviewPanelProps) {
  const [activeView, setActiveView] = useState("preview")
  const [deviceView, setDeviceView] = useState("desktop")
  const [generatedCode, setGeneratedCode] = useState("")

  useEffect(() => {
    if (projectData && !isGenerating) {
      // Simulate code generation
      const mockCode = generateMockCode(projectData)
      setGeneratedCode(mockCode)
    }
  }, [projectData, isGenerating])

  const generateMockCode = (data: any) => {
    return `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ${data.template?.replace("-", "") || "Generated"}App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            ${data.template?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Generated App"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            ${data.description || "Your AI-generated application"}
          </p>
          
          <div className="flex items-center justify-between">
            <span>Count: {count}</span>
            <Button onClick={() => setCount(count + 1)}>
              Increment
            </Button>
          </div>
          
          ${
            data.features?.includes("auth")
              ? `
          <div className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </div>`
              : ""
          }
          
          ${
            data.features?.includes("database")
              ? `
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Connected to database
            </p>
          </div>`
              : ""
          }
        </CardContent>
      </Card>
    </div>
  )
}`
  }

  const renderPreview = () => {
    if (isGenerating) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-300">Generating your app...</p>
          </div>
        </div>
      )
    }

    if (!projectData) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700">
          <div className="text-center">
            <Eye className="h-8 w-8 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">Preview will appear here</p>
            <p className="text-sm text-slate-500 mt-2">Generate a project to see the preview</p>
          </div>
        </div>
      )
    }

    // Mock preview based on template
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden ${
          deviceView === "mobile" ? "max-w-sm mx-auto" : deviceView === "tablet" ? "max-w-2xl mx-auto" : "w-full"
        }`}
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 min-h-96">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {projectData.template?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Generated App"}
              </h2>
              <p className="text-gray-600 mb-4">{projectData.description || "Your AI-generated application"}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Interactive Element</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Click Me</button>
                </div>

                {projectData.features?.includes("auth") && (
                  <div className="p-3 border rounded">
                    <button className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50">Sign In</button>
                  </div>
                )}

                {projectData.features?.includes("database") && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">✓ Database Connected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-lg h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Live Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-green-500 text-green-400">
              {projectData?.framework || "React"}
            </Badge>
            {projectData && (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                {projectData.features?.length || 0} features
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="preview" className="text-xs">
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                Code
              </TabsTrigger>
              <TabsTrigger value="console" className="text-xs">
                Console
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            <Button
              variant={deviceView === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceView("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceView === "tablet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceView("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceView === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceView("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[600px]">
          {activeView === "preview" && <div className="p-4 h-full">{renderPreview()}</div>}

          {activeView === "code" && (
            <ScrollArea className="h-full">
              <div className="p-4">
                <pre className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                  <code>{generatedCode || "// Code will appear here after generation"}</code>
                </pre>
              </div>
            </ScrollArea>
          )}

          {activeView === "console" && (
            <div className="p-4 h-full">
              <div className="bg-slate-800 rounded-lg p-4 h-full font-mono text-sm">
                <div className="text-green-400">$ npm run dev</div>
                <div className="text-slate-300 mt-2">
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Building project...
                    </div>
                  ) : projectData ? (
                    <>
                      <div className="text-blue-400">✓ Project generated successfully</div>
                      <div className="text-slate-400">✓ Dependencies installed</div>
                      <div className="text-green-400">✓ Development server ready</div>
                      <div className="text-slate-300 mt-2">Local: http://localhost:3000</div>
                    </>
                  ) : (
                    <div className="text-slate-400">Waiting for project generation...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {projectData && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700">
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
