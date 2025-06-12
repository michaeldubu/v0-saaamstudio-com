"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CodeEditorProps {
  content: string
  onContentChange: (newContent: string) => void
  fileName: string | null
}

export function CodeEditor({ content, onContentChange, fileName }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = content
    }
  }, [content, fileName]) // Re-render content when file changes

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value)
  }

  return (
    <Card className="h-full flex flex-col bg-slate-800/70 border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">{fileName || "No file selected"}</h3>
      </div>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-200 resize-none outline-none"
            spellCheck="false"
            onChange={handleInputChange}
            placeholder="// Start coding your SAAAM game here..."
          />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
