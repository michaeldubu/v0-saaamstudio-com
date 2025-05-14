"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStudio } from "@/contexts/studio-context"
import { FileText, FolderPlus, FilePlus, MoreVertical, Edit, Trash2, Copy, Download } from "lucide-react"

export default function SaaamFileSystem() {
  const { project, setActiveFile, getFileById, updateFile } = useStudio()

  const [newFileName, setNewFileName] = useState("")
  const [newFileContent, setNewFileContent] = useState("")
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  // Create a new file
  const createNewFile = () => {
    if (!newFileName.trim()) return

    // In a real implementation, this would call an API to create a file
    console.log(`Creating new file: ${newFileName}`)

    // Reset the form
    setNewFileName("")
    setNewFileContent("")
    setIsNewFileDialogOpen(false)
  }

  // Rename a file
  const renameFile = () => {
    if (!fileToRename || !newName.trim()) return

    // In a real implementation, this would call an API to rename the file
    console.log(`Renaming file ${fileToRename} to ${newName}`)

    // Reset the form
    setFileToRename(null)
    setNewName("")
    setIsRenameDialogOpen(false)
  }

  // Delete a file
  const deleteFile = (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    // In a real implementation, this would call an API to delete the file
    console.log(`Deleting file: ${fileId}`)
  }

  // Download a file
  const downloadFile = (fileId: string) => {
    const file = getFileById(fileId)
    if (!file) return

    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Duplicate a file
  const duplicateFile = (fileId: string) => {
    const file = getFileById(fileId)
    if (!file) return

    // In a real implementation, this would call an API to duplicate the file
    console.log(`Duplicating file: ${fileId}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">Files</h2>
        <div className="flex gap-2">
          <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <FilePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">File Name</label>
                  <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g., main.saaam"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Content (optional)</label>
                  <textarea
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    placeholder="// SAAAM code here"
                    className="w-full h-32 p-2 border rounded-md bg-gray-800 text-white"
                  />
                </div>
                <Button onClick={createNewFile}>Create File</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {project.files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-800 cursor-pointer ${
                project.activeFile === file.id ? "bg-gray-800" : ""
              }`}
              onClick={() => setActiveFile(file.id)}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-sm">{file.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setFileToRename(file.id)
                      setNewName(file.name)
                      setIsRenameDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateFile(file.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadFile(file.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteFile(file.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Name</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <Button onClick={renameFile}>Rename</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

