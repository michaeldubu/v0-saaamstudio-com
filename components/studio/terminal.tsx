"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TerminalIcon } from "lucide-react"

interface TerminalProps {
  logs: { type: "info" | "success" | "error" | "system"; message: string }[]
}

export function Terminal({ logs }: TerminalProps) {
  return (
    <Card className="h-full flex flex-col bg-slate-800/70 border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <TerminalIcon className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Console</h3>
      </div>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 font-mono text-sm">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`
                ${log.type === "info" ? "text-blue-400" : ""}
                ${log.type === "success" ? "text-green-400" : ""}
                ${log.type === "error" ? "text-red-400" : ""}
                ${log.type === "system" ? "text-slate-400" : ""}
              `}
              >
                {log.message}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
