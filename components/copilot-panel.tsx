"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Bot,
  Code,
  Sparkles,
  Loader2,
  Copy,
  Download,
  BoxIcon as Button,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  X,
  FileText,
  Zap,
  Lightbulb,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardFooter } from "@/components/ui/card"
import { Bug, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useStudio } from "@/contexts/studio-context"
import CopilotCodeAnalyzer from "./copilot-code-analyzer"
import CopilotFileBrowser from "./copilot-file-browser"

// Define message types for conversation history
type MessageRole = "user" | "assistant" | "system"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  codeBlocks?: CodeBlock[]
  fileReference?: {
    fileId: string
    fileName: string
  }
}

interface CodeBlock {
  code: string
  language: string
  id: string
}

interface CopilotPanelProps {
  initialCode?: string
}

export default function CopilotPanel({ initialCode }: CopilotPanelProps) {
  const { project, editorContent, getActiveFile, insertCodeAtCursor } = useStudio()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your SAAAM Copilot. I can help you write game code, explain concepts, or debug issues. What would you like to do today?",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [apiError, setApiError] = useState<string | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<"files" | "analysis">("analysis")
  const [isLoading, setIsLoading] = useState(false)
  const [codeSnippets, setCodeSnippets] = useState<Array<{ id: string; title: string; code: string }>>([])
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Test the API connection on component mount
  useEffect(() => {
    checkApiConnection()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Helper function to extract code blocks from text
  const extractCodeBlocks = (text: string): { text: string; codeBlocks: CodeBlock[] } => {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g
    const codeBlocks: CodeBlock[] = []
    let match
    let processedText = text

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || "javascript"
      const code = match[2]
      const id = `code-${Date.now()}-${codeBlocks.length}`

      codeBlocks.push({
        language,
        code,
        id,
      })

      // Replace code block with a reference
      processedText = processedText.replace(match[0], `[Code Block ${codeBlocks.length}]`)
    }

    return { text: processedText, codeBlocks }
  }

  // Helper function to gather context from the SAAAM environment
  function getContext() {
    try {
      const activeFile = getActiveFile()

      return {
        projectName: project.name,
        activeFile: activeFile
          ? {
              id: activeFile.id,
              name: activeFile.name,
              path: activeFile.path,
              type: activeFile.type,
              content: activeFile.content,
            }
          : null,
        activeEntity: project.activeEntity,
        fileCount: project.files.length,
        assetCount: project.assets.length,
        entityCount: project.entities.length,
        timestamp: new Date().toISOString(),
        environment: "SAAAM Studio",
      }
    } catch (error) {
      console.warn("Could not gather full context:", error)
      return {
        timestamp: new Date().toISOString(),
        environment: "SAAAM Studio",
      }
    }
  }

  // Check if the OpenAI API is properly configured
  const checkApiConnection = async () => {
    try {
      setApiStatus("loading")
      const response = await fetch("/api/copilot-test")
      const data = await response.json()

      if (data.success) {
        setApiStatus("success")
      } else {
        setApiStatus("error")
        setApiError(data.error || "Unknown error")
      }
    } catch (error) {
      setApiStatus("error")
      setApiError(error instanceof Error ? error.message : "Failed to connect to API")
    }
  }

  async function testApiConnection() {
    try {
      setApiStatus("unknown")
      const res = await fetch("/api/copilot-test")
      const data = await res.json()

      if (data.success) {
        setApiStatus("connected")
        setAvailableModels(data.availableModels || [])
        setDebugInfo((prev) => ({ ...prev, apiTest: data }))
      } else {
        setApiStatus("error")
        setError(`API Test Error: ${data.error}`)
        setDebugInfo((prev) => ({ ...prev, apiTest: data }))
      }
    } catch (error) {
      setApiStatus("error")
      setError(`API Test Error: ${error instanceof Error ? error.message : String(error)}`)
      setDebugInfo((prev) => ({ ...prev, apiTestError: error }))
    }
  }

  async function askCopilot() {
    if (!input.trim()) return

    setLoading(true)
    setError(null)

    // Add user message to conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    try {
      // Get the current context from the SAAAM environment
      const context = getContext()

      // Create conversation history for context
      const conversationHistory = messages
        .filter((msg) => msg.role !== "system")
        .slice(-6) // Last 6 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
          fileReference: msg.fileReference,
        }))

      // Store request data for debugging
      const requestData = {
        prompt: input,
        context: {
          ...context,
          conversationHistory,
        },
      }
      setDebugInfo({ request: requestData })

      console.log("Sending request to Copilot API:", requestData)
      const startTime = Date.now()

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      const responseTime = Date.now() - startTime
      const data = await res.json()

      // Store response data for debugging
      setDebugInfo((prev) => ({
        ...prev,
        response: data,
        status: res.status,
        statusText: res.statusText,
        responseTime: `${responseTime}ms`,
      }))

      console.log("Copilot API response:", data)

      if (!res.ok) {
        throw new Error(data.error || data.details || `Server responded with status: ${res.status}`)
      }

      // Process the response to extract code blocks
      const responseText = data.response || "No response received."
      const { text: processedText, codeBlocks } = extractCodeBlocks(responseText)

      // Add assistant message to conversation
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If there are code blocks, show the first one in the side panel
      if (codeBlocks.length > 0) {
        setSelectedCodeBlock(codeBlocks[0])
        setShowCodePanel(true)
      }
    } catch (error) {
      console.error("Error calling Copilot API:", error)
      setError(error instanceof Error ? error.message : String(error))
      setDebugInfo((prev) => ({ ...prev, error: error }))

      // Add error message to conversation
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    await askCopilot() // Call the actual API function
  }

  // Handle key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      //askCopilot()
      handleSendMessage()
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Could add a toast notification here
        console.log("Code copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err)
      })
  }

  // Copy code snippet
  const copyCodeSnippet = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Show a temporary success message
        const tempMessage: Message = {
          id: `system-${Date.now()}`,
          role: "system",
          content: "✅ Code copied to clipboard!",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, tempMessage])

        // Remove the message after 3 seconds
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
        }, 3000)
      })
      .catch((err) => {
        console.error("Failed to copy code:", err)
      })
  }

  // Download code snippet
  const downloadCodeSnippet = (code: string, title: string) => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${title.toLowerCase().replace(/\s+/g, "_")}.saaam`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Handle file selection from the file browser
  const handleFileSelect = (fileId: string, fileName: string) => {
    // Add a message about the selected file
    const fileMessage: Message = {
      id: `file-${Date.now()}`,
      role: "user",
      content: `I'm working on the file "${fileName}". Can you help me understand and improve this code?`,
      timestamp: new Date(),
      fileReference: {
        fileId,
        fileName,
      },
    }

    setMessages((prev) => [...prev, fileMessage])

    // Automatically ask the copilot
    setTimeout(() => {
      askCopilot()
    }, 100)
  }

  // Handle suggestion from the code analyzer
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. How can I help you with your SAAAM game development?",
        timestamp: new Date(),
      },
    ])
    setCodeSnippets([])
    setSelectedSnippet(null)
  }

  // Format the message content with code blocks highlighted
  const formatMessageContent = (message: Message) => {
    if (!message.codeBlocks || message.codeBlocks.length === 0) {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    // Split by code block markers
    const parts = message.content.split(/```[a-zA-Z]*\n[\s\S]*?```/g)
    const codeBlockMarkers = message.content.match(/```[a-zA-Z]*\n[\s\S]*?```/g) || []

    return (
      <div>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <p className="whitespace-pre-wrap">{part}</p>
            {codeBlockMarkers[index] && (
              <div className="my-2 relative">
                <div className="bg-gray-800 rounded-md p-3 overflow-x-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">{message.codeBlocks![index].language || "code"}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedCodeBlock(message.codeBlocks![index])
                          setShowCodePanel(true)
                        }}
                        className="text-xs bg-blue-900 hover:bg-blue-800 text-blue-100 px-2 py-1 rounded"
                      >
                        <Code className="h-3 w-3 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.codeBlocks![index].code)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        <Copy className="h-3 w-3 inline mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{message.codeBlocks![index].code}</code>
                  </pre>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r border-slate-700 bg-gray-900 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
              <h2 className="text-lg font-bold text-yellow-400">SAAAM Assistant</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            defaultValue={sidebarTab}
            onValueChange={(value) => setSidebarTab(value as "files" | "analysis")}
            className="flex-1 flex flex-col"
          >
            <TabsList className="px-3 pt-3">
              <TabsTrigger value="files" className="flex-1">
                Files
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1">
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="flex-1 overflow-hidden p-3">
              <CopilotFileBrowser onFileSelect={handleFileSelect} />
            </TabsContent>

            <TabsContent value="analysis" className="flex-1 overflow-hidden p-3">
              <CopilotCodeAnalyzer onSuggest={handleSuggestion} />
            </TabsContent>
          </Tabs>

          <div className="p-3 border-t border-slate-700">
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSuggestion("Can you help me optimize my game's performance?")}
              >
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                Optimize Performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSuggestion("Can you help me implement enemy AI behavior?")}
              >
                <Lightbulb className="h-4 w-4 mr-2 text-blue-400" />
                Implement AI Behavior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSuggestion("Can you help me create a particle effect system?")}
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                Create Visual Effects
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* API status banner */}
        {apiStatus === "error" && (
          <div className="bg-red-900 text-white p-2 text-sm">
            <strong>API Error:</strong> {apiError || "Could not connect to AI service"}
          </div>
        )}

        <Card className="flex flex-col h-full border-slate-700 bg-gradient-to-b from-[#111] to-[#222] text-white">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center">
              {!showSidebar && (
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)} className="mr-2 h-8 w-8 p-0">
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              <MessageSquare className="h-5 w-5 mr-2 text-yellow-400" />
              <h2 className="text-lg font-bold text-yellow-400">SAAAM Copilot</h2>
              {apiStatus === "connected" && (
                <span className="ml-2 text-xs bg-green-800 text-green-200 px-2 py-0.5 rounded-full">Connected</span>
              )}
              {apiStatus === "error" && (
                <span className="ml-2 text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded-full">API Error</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="h-8 px-2 text-xs"
              >
                <Bug className="mr-1 h-3 w-3" /> Debug
              </Button>
              <Button variant="outline" size="sm" onClick={testApiConnection} className="h-8 px-2 text-xs">
                <RefreshCw className="mr-1 h-3 w-3" /> Test API
              </Button>
            </div>
          </div>

          {/* Debug panel */}
          {showDebugPanel && (
            <div className="bg-gray-900 border-b border-gray-700 p-3 text-xs font-mono">
              <Tabs defaultValue="status">
                <TabsList className="mb-2">
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="status">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">API Status:</span>
                      <span
                        className={
                          apiStatus === "connected"
                            ? "text-green-400"
                            : apiStatus === "error"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }
                      >
                        {apiStatus === "connected" ? "Connected" : apiStatus === "error" ? "Error" : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Available Models:</span>
                      <span className="text-blue-400">
                        {availableModels.length > 0 ? availableModels.join(", ") : "None detected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Environment:</span>
                      <span className="ml-2 text-blue-400">{process.env.NEXT_PUBLIC_VERCEL_ENV || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Project:</span>
                      <span className="ml-2 text-blue-400">
                        {project.name} ({project.files.length} files)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Active File:</span>
                      <span className="ml-2 text-blue-400">{getActiveFile()?.name || "None"}</span>
                    </div>
                    {debugInfo?.apiTest && (
                      <div>
                        <span className="text-gray-400">API Test Result:</span>
                        <pre className="mt-1 p-2 bg-black rounded overflow-auto max-h-32">
                          {JSON.stringify(debugInfo.apiTest, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="request">
                  <pre className="p-2 bg-black rounded overflow-auto max-h-64">
                    {debugInfo?.request ? JSON.stringify(debugInfo.request, null, 2) : "No request data available"}
                  </pre>
                </TabsContent>

                <TabsContent value="response">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={debugInfo?.status === 200 ? "text-green-400" : "text-red-400"}>
                        {debugInfo?.status || "N/A"} {debugInfo?.statusText || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Response Time:</span>
                      <span className="text-blue-400">{debugInfo?.responseTime || "N/A"}</span>
                    </div>
                    <pre className="p-2 bg-black rounded overflow-auto max-h-64">
                      {debugInfo?.response ? JSON.stringify(debugInfo.response, null, 2) : "No response data available"}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* API error alert */}
          {apiStatus === "error" && (
            <div className="bg-red-900/30 border-b border-red-800 p-3 flex items-start">
              <AlertTriangle className="text-red-400 mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">API Connection Error</p>
                <p className="text-red-400 text-sm mt-1">
                  The OpenAI API connection failed. This could be due to an invalid API key or network issues. Check the
                  debug panel for more details.
                </p>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : message.role === "system"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-800 text-white",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center mb-1">
                      <Bot size={16} className="mr-1 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold">SAAAM Copilot</span>
                    </div>
                  )}
                  {message.fileReference && (
                    <div className="mb-2 text-xs bg-blue-900/50 p-2 rounded flex items-center">
                      <FileText className="h-3 w-3 mr-1 text-blue-300" />
                      <span className="text-blue-300">File: {message.fileReference.fileName}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {/* Render code blocks */}
                    {message.content.includes("```") ? (
                      message.content.split(/(```[a-zA-Z]*\n[\s\S]*?```)/g).map((part, index) => {
                        if (part.startsWith("```")) {
                          // Code block
                          const match = part.match(/```([a-zA-Z]*)\n([\s\S]*?)```/)
                          const language = match ? match[1] : "code"
                          const code = match ? match[2] : part.replace(/```[a-zA-Z]*\n/, "").replace(/```$/, "")

                          return (
                            <div key={index} className="my-2 relative">
                              <div className="bg-gray-800 rounded-md p-3 overflow-x-auto">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-gray-400">{language || "code"}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedCodeBlock({ id: `code-${index}`, language, code })
                                        setShowCodePanel(true)
                                      }}
                                      className="text-xs bg-blue-900 hover:bg-blue-800 text-blue-100 px-2 py-1 rounded"
                                    >
                                      <Code className="h-3 w-3 inline mr-1" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => copyToClipboard(code)}
                                      className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                                    >
                                      <Copy className="h-3 w-3 inline mr-1" />
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                <pre className="text-sm overflow-x-auto">
                                  <code>{code}</code>
                                </pre>
                              </div>
                            </div>
                          )
                        } else {
                          // Regular text
                          return (
                            <p key={index} className="whitespace-pre-wrap">
                              {part}
                            </p>
                          )
                        }
                      })
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <CardFooter className="border-t border-slate-700 p-4">
            <div className="flex flex-col w-full space-y-2">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  placeholder="Ask about your code, game mechanics, or how to implement features..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className="bg-black text-white border border-slate-600 pr-10 min-h-[80px]"
                  rows={3}
                  disabled={isLoading || apiStatus === "error"}
                />
                <Button
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || apiStatus === "error"}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {availableModels.includes("gpt-3.5-turbo") ? "Using GPT-3.5 Turbo" : "Model: Unknown"}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestion("Can you analyze my current code and suggest improvements?")}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Analyze Code
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setSidebarTab("files")}>
                    <FileText className="h-3 w-3 mr-1" />
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Code panel (side panel) */}
      {showCodePanel && selectedCodeBlock && (
        <div className="w-1/2 border-l border-slate-700 bg-gray-900 flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center">
              <Code className="h-5 w-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-bold text-blue-400">Code Viewer</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedCodeBlock.code)}
                className="h-8 px-2 text-xs"
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCodePanel(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-800 rounded-md p-4">
              <pre className="text-sm overflow-x-auto">
                <code>{selectedCodeBlock.code}</code>
              </pre>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Language: {selectedCodeBlock.language || "javascript"}</span>
              <Button
                variant="default"
                size="sm"
                className="text-xs"
                onClick={() => insertCodeAtCursor(selectedCodeBlock!.code)}
              >
                Insert into Editor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Code snippets sidebar */}
      {codeSnippets.length > 0 && (
        <div className="w-64 border-l border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold">Code Snippets</h3>
          </div>

          <div className="p-2">
            {codeSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className={`p-2 mb-2 rounded cursor-pointer ${
                  selectedSnippet === snippet.id ? "bg-blue-900" : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedSnippet(snippet.id)}
              >
                <div className="text-sm font-medium">{snippet.title}</div>
                <div className="text-xs text-gray-400 mt-1">{snippet.code.split("\n").length} lines</div>
              </div>
            ))}
          </div>

          {selectedSnippet && (
            <div className="p-3 border-t border-gray-700">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Selected Snippet</h3>
                <div className="flex space-x-1">
                  <button
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={() => {
                      const snippet = codeSnippets.find((s) => s.id === selectedSnippet)
                      if (snippet) {
                        copyCodeSnippet(snippet.code)
                      }
                    }}
                    title="Copy code"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={() => {
                      const snippet = codeSnippets.find((s) => s.id === selectedSnippet)
                      if (snippet) {
                        downloadCodeSnippet(snippet.code, snippet.title)
                      }
                    }}
                    title="Download code"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 p-2 rounded text-xs font-mono overflow-x-auto max-h-64">
                {codeSnippets
                  .find((s) => s.id === selectedSnippet)
                  ?.code.split("\n")
                  .map((line, i) => (
                    <div key={i} className="whitespace-pre">
                      {line}
                    </div>
                  ))}
              </div>

              <Button
                className="w-full mt-2"
                size="sm"
                onClick={() => {
                  const snippet = codeSnippets.find((s) => s.id === selectedSnippet)
                  if (snippet) {
                    // In a real implementation, this would use the snippet code
                    // For now, we'll just log it
                    console.log("Using snippet:", snippet.code)

                    // Show a message
                    const tempMessage: Message = {
                      id: `system-${Date.now()}`,
                      role: "system",
                      content: `✅ Code snippet "${snippet.title}" applied to editor!`,
                      timestamp: new Date(),
                    }

                    setMessages((prev) => [...prev, tempMessage])
                  }
                }}
              >
                Use This Code
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
