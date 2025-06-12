"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"

interface GamePreviewProps {
  // In a real scenario, this would involve a canvas or iframe for the game engine
  // For now, it's a placeholder
  gameRunning: boolean
}

export function GamePreview({ gameRunning }: GamePreviewProps) {
  return (
    <Card className="h-full flex flex-col bg-slate-800/70 border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Eye className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Game Preview</h3>
      </div>
      <CardContent className="flex-1 p-4 flex items-center justify-center">
        {gameRunning ? (
          <div className="text-center text-green-400">
            <p className="text-lg font-bold">Game Running...</p>
            <p className="text-sm text-slate-400">Imagine your SAAAM game here!</p>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <p className="text-lg font-bold">No Game Running</p>
            <p className="text-sm">Run a script to see the game preview.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
