"use client"

import { useState } from "react"

interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  content?: string
  children?: FileSystemItem[]
  parent?: string
  expanded?: boolean
}

interface SaaamFileSystemProps {
  onFileSelect: (file: FileSystemItem) => void
  onFileCreate: (file: FileSystemItem) => void
  onFileDelete: (fileId: string) => void
  onFileRename: (fileId: string, newName: string) => void
  onFileUpdate: (fileId: string, content: string) => void
}

export default function SaaamFileSystem({
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileUpdate,
}: SaaamFileSystemProps) {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: "root",
      name: "Project",
      type: "folder",
      expanded: true,
      children: [
        {
          id: "main.saaam",
          name: "main.saaam",
          type: "file",
          content: `// My first SAAAM program
SAAAM.registerCreate(create);
SAAAM.registerStep(step);
SAAAM.registerDraw(draw);

function create() {
  console.log("Hello, World!");
}

function step(deltaTime) {
  // Game logic goes here
}

function draw(ctx) {
  // Clear the screen
  SAAAM.drawRectangle(0, 0, 800, 600, "#222222");
  
  // Draw text
  SAAAM.drawText("Hello, SAAAM World!", 400, 300, "#FFFFFF");
}`,
          parent: "root",
        },
        {
          id: "assets",
          name: "assets",
          type: "folder",
          expanded: false,
          parent: "root",
          children: [
            {
              id: "sprites",
              name: "sprites",
              type: "folder",
              expanded: false,
              parent: "assets",
              children: [
                {
                  id: "player.png",
                  name: "player.png",
                  type: "file",
                  parent: "sprites",
                },
                {
                  id: "enemy.png",
                  name: "enemy.png",
                  type: "file",
                  parent: "sprites",
                },
              ],
            },
            {
              id: "sounds",
              name: "sounds",
              type: "folder",
              expanded: false,
              parent: "assets",
              children: [
                {
                  id: "jump.mp3",
                  name: "jump.mp3",
                  type: "file",
                  parent: "sounds",
                },
                {
                  id: "background.mp3",
                  name: "background.mp3",
                  type: "file",
                  parent: "sounds",
                },
              ],
            },
          ],
        },
        {
          id: "player.saaam",
          name: "player.saaam",
          type: "file",
          content: `// Player controller
const player = {
  x: 400,
  y: 300,
  width: 50,
  height: 50,
  speed: 200,
  color: "#4488FF"
};

function movePlayer(deltaTime) {
  // Handle player input
  if (SAAAM.keyboardCheck(SAAAM.vk.left)) {
    player.x -= player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.right)) {
    player.x += player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.up)) {
    player.y -= player.speed * deltaTime;
  }
  if (SAAAM.keyboardCheck(SAAAM.vk.down)) {
    player.y += player.speed * deltaTime;
  }
  
  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > 800) player.x = 800 - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > 600) player.y = 600 - player.height;
}

function drawPlayer() {
  SAAAM.drawRectangle(player.x, player.y, player.width, player.height, player.color);
}`,
          parent: "root",
        },
      ],
    },
  ])

  const [selectedFile, setSelectedFile] = useState<string | null>("main.saaam")
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file")
  const [newItemParent, setNewItemParent] = useState<string | null>(null)
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false)
  const [isRenamingItem, setIsRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setFileSystem((prevFileSystem) => {
      const updateItem = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === folderId) {
            return { ...item, expanded: !item.expanded }
          } else if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }

      return updateItem(prevFileSystem)
    })
  }

  // Select a file
  const selectFile = (file: FileSystemItem) => {
    setSelectedFile(file.id)
    onFileSelect(file)
  }

  // Create a new file or folder
  const createNewItem = () => {
    setIsCreatingNewItem(true)
    setNewItemParent(selectedFile)
  }

  const confirmNewItem = () => {
    if (newItemName) {
      const newFile: FileSystemItem = {
        id: newItemName,
        name: newItemName,
        type: newItemType,
        parent: newItemParent || "root",
      }

      setFileSystem((prevFileSystem) => {
        const addItem = (items: FileSystemItem[]): FileSystemItem[] => {
          return items.map((item) => {
            if (item.id === newItemParent) {
              const newItemToAdd = { ...item, children: [...(item.children || []), newFile] }
              return newItemToAdd
            } else if (item.children) {
              return { ...item, children: addItem(item.children) }
            }
            return item
          })
        }

        return addItem(prevFileSystem)
      })

      onFileCreate(newFile)
      setNewItemName("")
      setIsCreatingNewItem(false)
    }
  }

  // Rename a file or folder
  const renameItem = (fileId: string) => {
    setIsRenamingItem(fileId)
    setRenameValue(getFileById(fileId)?.name || "")
  }

  const confirmRenameItem = (fileId: string) => {
    if (renameValue) {
      setFileSystem((prevFileSystem) => {
        const updateItem = (items: FileSystemItem[]): FileSystemItem[] => {
          return items.map((item) => {
            if (item.id === fileId) {
              return { ...item, name: renameValue }
            } else if (item.children) {
              return { ...item, children: updateItem(item.children) }
            }
            return item
          })
        }

        return updateItem(prevFileSystem)
      })

      onFileRename(fileId, renameValue)
      setIsRenamingItem(null)
      setRenameValue("")
    }
  }

  // Delete a file or folder
  const deleteItem = (fileId: string) => {
    setFileSystem((prevFileSystem) => {
      const removeItem = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.reduce((acc: FileSystemItem[], item) => {
          if (item.id !== fileId) {
            const newItem = item.children ? { ...item, children: removeItem(item.children) } : item
            acc.push(newItem)
          }
          return acc
        }, [])
      }

      return removeItem(prevFileSystem)
    })

    onFileDelete(fileId)
  }

  // Duplicate a file
  const duplicateItem = (fileId: string) => {
    console.log(`Duplicating file: ${fileId}`)
  }

  // Helper function to get a file by its ID
  const getFileById = (fileId: string): FileSystemItem | undefined => {
    let found: FileSystemItem | undefined

    const search = (items: FileSystemItem[]): void => {
      for (const item of items) {
        if (item.id === fileId) {
          found = item
          return
        }
        if (item.children) {
          search(item.children)
        }
      }
    }

    search(fileSystem)
    return found
  }

  // Render a file system item
  const renderItem = (item: FileSystemItem) => {
    const isSelected = selectedFile === item.id
    const isRenaming = isRenamingItem === item.id

    return (
      <li key={item.id}>
        {item.type === "folder" ? (
          <>
            <div className={`folder ${item.expanded ? "expanded" : ""}`} onClick={() => toggleFolder(item.id)}>
              <span>{item.name}</span>
            </div>
            {item.expanded && item.children && <ul>{item.children.map((child) => renderItem(child))}</ul>}
          </>
        ) : (
          <div className={`file ${isSelected ? "selected" : ""}`} onClick={() => selectFile(item)}>
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => confirmRenameItem(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmRenameItem(item.id)
                  }
                }}
              />
            ) : (
              <span>{item.name}</span>
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="file-system">
      <ul>{fileSystem.map((item) => renderItem(item))}</ul>

      <button onClick={createNewItem}>Create New</button>

      {isCreatingNewItem && (
        <div className="new-item-form">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New item name"
          />
          <select value={newItemType} onChange={(e) => setNewItemType(e.target.value as "file" | "folder")}>
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          <button onClick={confirmNewItem}>Confirm</button>
        </div>
      )}

      {selectedFile && (
        <div className="file-actions">
          <button onClick={() => renameItem(selectedFile)}>Rename</button>
          <button onClick={() => deleteItem(selectedFile)}>Delete</button>
          <button onClick={() => duplicateItem(selectedFile)}>Duplicate</button>
        </div>
      )}
    </div>
  )
}
