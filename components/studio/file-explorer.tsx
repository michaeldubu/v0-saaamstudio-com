"use client"

import { Folder, FileText, Plus, Trash2, Save, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

interface FileItem {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  folder?: string
}

interface FileExplorerProps {
  files: FileItem[]
  activeFileId: string | null
  onOpenFile: (fileId: string) => void
  onNewFile: () => void
  onDeleteFile: (fileId: string) => void
  onSaveFile: () => void
  onRunScript: () => void
}

export function FileExplorer({
  files,
  activeFileId,
  onOpenFile,
  onNewFile,
  onDeleteFile,
  onSaveFile,
  onRunScript,
}: FileExplorerProps) {
  const scriptFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".saaam"))
  const otherFiles = files.filter((f) => f.type === "file" && !f.name.endsWith(".saaam"))

  return (
    <Card className="h-full flex flex-col bg-slate-800/70 border-slate-700">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Files</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              onClick={onNewFile}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              onClick={onSaveFile}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-1">
            {scriptFiles.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                  <Folder className="h-4 w-4" />
                  <span>Scripts</span>
                </div>
                <div className="pl-4 space-y-1">
                  {scriptFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between group">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-sm ${
                          activeFileId === file.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                        }`}
                        onClick={() => onOpenFile(file.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {file.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                  <Folder className="h-4 w-4" />
                  <span>Other Files</span>
                </div>
                <div className="pl-4 space-y-1">
                  {otherFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between group">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-sm ${
                          activeFileId === file.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                        }`}
                        onClick={() => onOpenFile(file.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {file.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-4 border-t border-slate-700 pt-4">
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onRunScript}>
            <PlayCircle className="h-5 w-5 mr-2" />
            Run Script
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
