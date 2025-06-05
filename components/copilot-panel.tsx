"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button, Input } from "@nextui-org/react"
import { SaaamLinter } from "../lib/saaam-linter"
import { SaaamCodeIntellisense } from "../lib/saaam-intellisense"

interface CopilotPanelProps {
  addMessage: (message: string, sender: "user" | "assistant") => void
  activeFile: { name: string; content: string } | null
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({ addMessage, activeFile }) => {
  const [message, setMessage] = useState("")
  const [linter] = useState(() => new SaaamLinter())
  const [intellisense] = useState(() => new SaaamCodeIntellisense())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const askCopilot = async () => {
    if (!message.trim()) return

    addMessage(message, "user")
    setMessage("")

    // Enhanced code analysis with linting
    if (message.toLowerCase().includes("analyze") || message.toLowerCase().includes("check")) {
      const lintResults = linter.lint(activeFile?.content || "", activeFile?.name || "unknown")

      if (lintResults.length > 0) {
        const issues = lintResults.map((issue) => `Line ${issue.line}: ${issue.message} (${issue.severity})`).join("\n")

        addMessage(`Code Analysis Results:\n${issues}`, "assistant")
        return
      } else {
        addMessage("Code analysis complete - no issues found!", "assistant")
        return
      }
    }

    // Natural language game creation
    if (message.toLowerCase().includes("create game") || message.toLowerCase().includes("make a game")) {
      try {
        if (window.SAAAM && window.SAAAM.createGameFromDescription) {
          addMessage("Creating game from your description...", "assistant")
          const game = await window.SAAAM.createGameFromDescription(message)
          addMessage(`Game created successfully! Type: ${game.type}`, "assistant")
        } else {
          addMessage("Neural game creation system not available yet.", "assistant")
        }
      } catch (error) {
        addMessage(`Error creating game: ${error.message}`, "assistant")
      }
      return
    }

    // Default response (replace with actual Copilot logic later)
    addMessage("This is a placeholder response from the Copilot.", "assistant")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 overflow-y-auto">{/* Messages will be displayed here */}</div>
      <div className="p-4 border-t">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask Copilot..."
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askCopilot()
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full mb-2"
        />
        <Button color="primary" onClick={askCopilot} className="w-full">
          Ask
        </Button>
      </div>
    </div>
  )
}

export default CopilotPanel
