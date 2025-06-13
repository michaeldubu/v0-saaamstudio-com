"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"
import type React from "react"

interface GamePreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  gameRunning: boolean
}

export function GamePreview({ canvasRef, gameRunning }: GamePreviewProps) {
  return (
    <Card className="h-full flex flex-col bg-slate-800/70 border-slate-700 rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Eye className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Game Preview</h3>
      </div>
      <CardContent className="flex-1 p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800} // Default canvas size
          height={600}
          className="border border-slate-700 bg-black"
        />
      </CardContent>
    </Card>
  )
}
