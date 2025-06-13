"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FilePlus, Code, Folder, Upload, Download, Play, Save, Trash2 } from "lucide-react"

interface FileItem {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  folder?: string // Optional: for grouping files in the UI
}

interface FileExplorerProps {
  files: FileItem[]
  activeFileId: string | null
  onOpenFile: (fileId: string) => void
  onNewFile: () => void
  onDeleteFile: (fileId: string) => void
  onSaveFile: () => void
  onRunScript: () => void
  onImportProject: () => void
  onExportProject: () => void
}

export function FileExplorer({
  files,
  activeFileId,
  onOpenFile,
  onNewFile,
  onDeleteFile,
  onSaveFile,
  onRunScript,
  onImportProject,
  onExportProject,
}: FileExplorerProps) {
  const groupedFiles: { [key: string]: FileItem[] } = files.reduce(
    (acc, file) => {
      const folder = file.folder || "root"
      if (!acc[folder]) {
        acc[folder] = []
      }
      acc[folder].push(file)
      return acc
    },
    {} as { [key: string]: FileItem[] },
  )

  return (
    <div className="h-full flex flex-col bg-slate-800/70 border-slate-700 rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Project Files</h3>
      </div>
      <div className="p-4 space-y-2 border-b border-slate-700">
        <Button onClick={onNewFile} className="w-full">
          <FilePlus className="h-4 w-4 mr-2" /> New File
        </Button>
        <Button onClick={onImportProject} className="w-full" variant="outline">
          <Upload className="h-4 w-4 mr-2" /> Import Project
        </Button>
        <Button onClick={onExportProject} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export Project
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {Object.keys(groupedFiles).map((folderName) => (
            <div key={folderName}>
              {folderName !== "root" && (
                <h4 className="mb-2 text-sm font-medium text-slate-400 flex items-center">
                  <Folder className="h-4 w-4 mr-2" /> {folderName}
                </h4>
              )}
              <div className="space-y-1">
                {groupedFiles[folderName].map((file) => (
                  <div key={file.id} className="flex items-center justify-between group">
                    <Button
                      variant={activeFileId === file.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left pr-8"
                      onClick={() => onOpenFile(file.id)}
                    >
                      <Code className="h-4 w-4 mr-2" /> {file.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteFile(file.id)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <Button onClick={onRunScript} className="flex-1">
          <Play className="h-4 w-4 mr-2" /> Run
        </Button>
        <Button onClick={onSaveFile} variant="outline" className="flex-1">
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  )
}
