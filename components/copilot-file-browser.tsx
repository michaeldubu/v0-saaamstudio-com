"use client"

import { useState } from "react"
import { useStudio } from "@/contexts/studio-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText, ImageIcon, Music, FolderOpen, ChevronRight, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

interface CopilotFileBrowserProps {
  onFileSelect?: (fileId: string, fileName: string) => void
}

export default function CopilotFileBrowser({ onFileSelect }: CopilotFileBrowserProps) {
  const { project, setActiveFile } = useStudio()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "/": true,
    "/sprites": false,
    "/sounds": false,
  })

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const handleFileClick = (fileId: string, fileName: string) => {
    setActiveFile(fileId)
    if (onFileSelect) {
      onFileSelect(fileId, fileName)
    }
  }

  // Group files by folder
  const filesByFolder: Record<string, typeof project.files> = {}

  project.files.forEach((file) => {
    const folderPath = file.path.substring(0, file.path.lastIndexOf("/")) || "/"
    if (!filesByFolder[folderPath]) {
      filesByFolder[folderPath] = []
    }
    filesByFolder[folderPath].push(file)
  })

  // Filter files based on search query
  const filteredFiles = searchQuery
    ? project.files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.path.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "script":
        return <FileText className="h-4 w-4 text-blue-400" />
      case "sprite":
        return <ImageIcon className="h-4 w-4 text-green-400" />
      case "sound":
        return <Music className="h-4 w-4 text-purple-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Card className="w-full border-slate-700 bg-gray-900 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <FolderOpen className="h-4 w-4 mr-2 text-yellow-400" />
          <span>Project Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 py-1 h-8 text-xs bg-gray-800 border-gray-700"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {searchQuery ? (
            // Search results
            <div className="space-y-1">
              {filteredFiles.length === 0 ? (
                <div className="text-xs text-gray-400 p-2">No files found</div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center p-1 rounded text-xs cursor-pointer ${
                      project.activeFile === file.id ? "bg-blue-900/50 text-blue-100" : "hover:bg-gray-800"
                    }`}
                    onClick={() => handleFileClick(file.id, file.name)}
                  >
                    <div className="mr-2">{getFileIcon(file.type)}</div>
                    <div className="flex-1 truncate">{file.name}</div>
                    <div className="text-gray-500 text-xs">{file.path}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Folder tree view
            <div className="space-y-1">
              {Object.keys(filesByFolder).map((folderPath) => {
                const isExpanded = expandedFolders[folderPath] || false
                const folderName = folderPath === "/" ? "Root" : folderPath.split("/").pop()

                return (
                  <div key={folderPath}>
                    <div
                      className="flex items-center p-1 rounded text-xs cursor-pointer hover:bg-gray-800"
                      onClick={() => toggleFolder(folderPath)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 mr-1 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                      )}
                      <FolderOpen className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>{folderName}</span>
                      <span className="ml-2 text-gray-500">({filesByFolder[folderPath].length})</span>
                    </div>

                    {isExpanded && (
                      <div className="ml-5 mt-1 space-y-1">
                        {filesByFolder[folderPath].map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center p-1 rounded text-xs cursor-pointer ${
                              project.activeFile === file.id ? "bg-blue-900/50 text-blue-100" : "hover:bg-gray-800"
                            }`}
                            onClick={() => handleFileClick(file.id, file.name)}
                          >
                            <div className="mr-2">{getFileIcon(file.type)}</div>
                            <div className="flex-1 truncate">{file.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
