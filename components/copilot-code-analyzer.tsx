"use client"

import { useState, useEffect } from "react"
import { useStudio, type CodeAnalysisResult } from "@/contexts/studio-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Code, Lightbulb, Zap, ArrowRight } from "lucide-react"

interface CopilotCodeAnalyzerProps {
  onSuggest?: (suggestion: string) => void
}

export default function CopilotCodeAnalyzer({ onSuggest }: CopilotCodeAnalyzerProps) {
  const { editorContent, analyzeCode, getActiveFile, insertCodeAtCursor, highlightCodeSection } = useStudio()
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("issues")

  // Analyze code when it changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeCurrentCode()
    }, 1000)

    return () => clearTimeout(timer)
  }, [editorContent])

  const analyzeCurrentCode = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeCode(editorContent)
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing code:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSuggest = (suggestion: string) => {
    if (onSuggest) {
      onSuggest(suggestion)
    }
  }

  const handleApplySuggestion = (code: string) => {
    insertCodeAtCursor(code)
  }

  const handleHighlightIssue = (line: number) => {
    highlightCodeSection(line, line)
  }

  const activeFile = getActiveFile()

  return (
    <Card className="w-full border-slate-700 bg-gray-900 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Code className="h-4 w-4 mr-2 text-blue-400" />
          <span>Copilot Analysis: {activeFile?.name || "No file selected"}</span>
          {isAnalyzing && <span className="ml-2 text-xs text-gray-400">(Analyzing...)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {analysis ? (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="issues" className="text-xs">
                Issues ({analysis.issues.length})
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-xs">
                Suggestions ({analysis.suggestions.length})
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs">
                Structure
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="mt-0">
              <div className="max-h-[200px] overflow-y-auto">
                {analysis.issues.length === 0 ? (
                  <div className="flex items-center justify-center p-4 text-gray-400 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                    No issues found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.issues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-xs flex items-start ${
                          issue.type === "error"
                            ? "bg-red-900/30 border border-red-800"
                            : issue.type === "warning"
                              ? "bg-yellow-900/30 border border-yellow-800"
                              : "bg-blue-900/30 border border-blue-800"
                        }`}
                      >
                        <AlertCircle
                          className={`h-4 w-4 mr-2 flex-shrink-0 ${
                            issue.type === "error"
                              ? "text-red-400"
                              : issue.type === "warning"
                                ? "text-yellow-400"
                                : "text-blue-400"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{issue.message}</div>
                          {issue.line && (
                            <div className="text-gray-400 mt-1">
                              Line {issue.line}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs p-0 h-auto ml-2 text-blue-400"
                                onClick={() => handleHighlightIssue(issue.line!)}
                              >
                                Go to
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-0">
              <div className="max-h-[200px] overflow-y-auto">
                {analysis.suggestions.length === 0 ? (
                  <div className="flex items-center justify-center p-4 text-gray-400 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                    No suggestions available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 rounded text-xs bg-blue-900/20 border border-blue-800">
                        <div className="flex items-start">
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{suggestion.message}</div>
                            {suggestion.line && (
                              <div className="text-gray-400 mt-1">
                                Line {suggestion.line}
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-xs p-0 h-auto ml-2 text-blue-400"
                                  onClick={() => handleHighlightIssue(suggestion.line!)}
                                >
                                  Go to
                                </Button>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 ml-2"
                            onClick={() => handleSuggest(`Can you help me ${suggestion.message.toLowerCase()}?`)}
                          >
                            Ask
                          </Button>
                        </div>

                        {suggestion.code && (
                          <div className="mt-2 bg-gray-800 p-2 rounded relative">
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                              <code>{suggestion.code}</code>
                            </pre>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-1 right-1 h-6 text-xs"
                              onClick={() => handleApplySuggestion(suggestion.code!)}
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="structure" className="mt-0">
              <div className="max-h-[200px] overflow-y-auto">
                <div className="space-y-4">
                  {analysis.entities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-400 mb-1">Entities</h3>
                      <div className="space-y-1">
                        {analysis.entities.map((entity, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs p-1 hover:bg-gray-800 rounded"
                          >
                            <div className="flex items-center">
                              <span className="text-blue-400 mr-2">{entity.type}</span>
                              <span>{entity.name}</span>
                            </div>
                            <div className="text-gray-500">
                              Line {entity.line}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs p-0 h-auto ml-2 text-blue-400"
                                onClick={() => handleHighlightIssue(entity.line)}
                              >
                                Go to
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.functions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-400 mb-1">Functions</h3>
                      <div className="space-y-1">
                        {analysis.functions.map((func, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs p-1 hover:bg-gray-800 rounded"
                          >
                            <div>
                              <span className="text-green-400">{func.name}</span>
                              <span className="text-gray-400">({func.params.join(", ")})</span>
                            </div>
                            <div className="text-gray-500">
                              Line {func.line}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs p-0 h-auto ml-2 text-blue-400"
                                onClick={() => handleHighlightIssue(func.line)}
                              >
                                Go to
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.entities.length === 0 && analysis.functions.length === 0 && (
                    <div className="flex items-center justify-center p-4 text-gray-400 text-sm">
                      No structure information available
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center p-4 text-gray-400 text-sm">
            {isAnalyzing ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Analyzing code...
              </div>
            ) : (
              <div>No analysis available</div>
            )}
          </div>
        )}

        <div className="mt-3 border-t border-gray-800 pt-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">Ask Copilot about your code</div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggest("Can you optimize my code?")}
              >
                <Zap className="h-3 w-3 mr-1" />
                Optimize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggest("Can you explain how this code works?")}
              >
                <Code className="h-3 w-3 mr-1" />
                Explain
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggest("Can you suggest improvements to this code?")}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Improve
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

