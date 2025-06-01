"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Folder, File, Upload, X, Grid, List, Search, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Define asset types
type AssetType = "sprite" | "sound" | "room"

interface Asset {
  id: string
  name: string
  type: AssetType
  url: string
  thumbnail?: string
  dateAdded: Date
  tags: string[]
  size?: number // in KB
  dimensions?: { width: number; height: number } // for sprites
  duration?: number // for sounds, in seconds
}

interface AssetManagerProps {
  assetType: AssetType
  onClose: () => void
  onSelectAsset?: (asset: Asset) => void
  theme: "dark" | "light"
}

export default function AssetManager({ assetType, onClose, onSelectAsset, theme }: AssetManagerProps) {
  // Sample assets for each type
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (assetType === "sprite") {
      return [
        {
          id: "sprite1",
          name: "player.png",
          type: "sprite",
          url: "/placeholder.svg?height=64&width=64",
          thumbnail: "/placeholder.svg?height=64&width=64",
          dateAdded: new Date(2023, 5, 15),
          tags: ["player", "character"],
          size: 24,
          dimensions: { width: 64, height: 64 },
        },
        {
          id: "sprite2",
          name: "enemy.png",
          type: "sprite",
          url: "/placeholder.svg?height=64&width=64",
          thumbnail: "/placeholder.svg?height=64&width=64",
          dateAdded: new Date(2023, 5, 16),
          tags: ["enemy", "character"],
          size: 32,
          dimensions: { width: 64, height: 64 },
        },
        {
          id: "sprite3",
          name: "background.png",
          type: "sprite",
          url: "/placeholder.svg?height=320&width=640",
          thumbnail: "/placeholder.svg?height=320&width=640",
          dateAdded: new Date(2023, 5, 17),
          tags: ["background", "environment"],
          size: 128,
          dimensions: { width: 640, height: 320 },
        },
      ]
    } else if (assetType === "sound") {
      return [
        {
          id: "sound1",
          name: "jump.mp3",
          type: "sound",
          url: "#",
          dateAdded: new Date(2023, 5, 15),
          tags: ["sfx", "player"],
          size: 48,
          duration: 1.2,
        },
        {
          id: "sound2",
          name: "explosion.mp3",
          type: "sound",
          url: "#",
          dateAdded: new Date(2023, 5, 16),
          tags: ["sfx", "combat"],
          size: 96,
          duration: 2.5,
        },
        {
          id: "sound3",
          name: "background_music.mp3",
          type: "sound",
          url: "#",
          dateAdded: new Date(2023, 5, 17),
          tags: ["music", "background"],
          size: 3200,
          duration: 120,
        },
      ]
    } else {
      // Rooms
      return [
        {
          id: "room1",
          name: "level1.room",
          type: "room",
          url: "#",
          thumbnail: "/placeholder.svg?height=160&width=320",
          dateAdded: new Date(2023, 5, 15),
          tags: ["level", "start"],
          size: 12,
        },
        {
          id: "room2",
          name: "boss_room.room",
          type: "room",
          url: "#",
          thumbnail: "/placeholder.svg?height=160&width=320",
          dateAdded: new Date(2023, 5, 16),
          tags: ["level", "boss"],
          size: 18,
        },
      ]
    }
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter assets based on search query
  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Handle asset selection
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    if (onSelectAsset) {
      onSelectAsset(asset)
    }
  }

  // Handle file upload
  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      // Create new assets from the files
      const newAssets = Array.from(files).map((file) => {
        const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fileExtension = file.name.split(".").pop() || ""

        // Create appropriate asset based on type
        const asset: Asset = {
          id,
          name: file.name,
          type: assetType,
          url: URL.createObjectURL(file),
          dateAdded: new Date(),
          tags: [],
          size: Math.round(file.size / 1024), // Convert bytes to KB
        }

        // Add type-specific properties
        if (assetType === "sprite") {
          asset.thumbnail = URL.createObjectURL(file)
          // We would normally get dimensions from the image, but we'll use placeholders
          asset.dimensions = { width: 64, height: 64 }
        } else if (assetType === "sound") {
          // We would normally get duration from the audio, but we'll use a placeholder
          asset.duration = 2.0
        } else if (assetType === "room") {
          asset.thumbnail = "/placeholder.svg?height=160&width=320"
        }

        return asset
      })

      // Add new assets to the list
      setAssets((prevAssets) => [...prevAssets, ...newAssets])
      setIsUploading(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 1500)
  }

  // Handle asset deletion
  const handleDeleteAsset = (assetId: string) => {
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId))
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null)
    }
  }

  // Get title based on asset type
  const getTitle = () => {
    switch (assetType) {
      case "sprite":
        return "Sprite Assets"
      case "sound":
        return "Sound Assets"
      case "room":
        return "Room Assets"
      default:
        return "Assets"
    }
  }

  return (
    <div
      className={`w-full h-full flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-3 ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-300"}`}
      >
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
        <Button variant="destructive" size="sm" onClick={onClose} className="flex items-center">
          <X size={16} className="mr-1" /> <span>Close</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-2 p-2 ${theme === "dark" ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-300"}`}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            type="text"
            placeholder={`Search ${assetType}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-8 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="px-2"
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="px-2"
          >
            <List size={16} />
          </Button>
        </div>

        <Button variant="default" size="sm" onClick={handleFileUpload} disabled={isUploading}>
          <Upload size={16} className="mr-1" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={assetType === "sprite" ? "image/*" : assetType === "sound" ? "audio/*" : ".room,.json"}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Asset list */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Folder className={`${theme === "dark" ? "text-gray-600" : "text-gray-400"} mb-2`} size={48} />
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4`}>
                {searchQuery ? "No assets match your search" : `No ${assetType} assets found`}
              </p>
              <Button variant="outline" size="sm" onClick={handleFileUpload}>
                <Plus size={16} className="mr-1" /> Add {assetType}
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`group relative rounded-lg overflow-hidden border ${
                    selectedAsset?.id === asset.id
                      ? theme === "dark"
                        ? "border-blue-500"
                        : "border-blue-600"
                      : theme === "dark"
                        ? "border-gray-700"
                        : "border-gray-300"
                  } cursor-pointer transition-all hover:border-blue-400`}
                  onClick={() => handleAssetClick(asset)}
                >
                  {/* Asset preview */}
                  <div
                    className={`h-24 flex items-center justify-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                  >
                    {asset.type === "sprite" || asset.type === "room" ? (
                      <img
                        src={asset.thumbnail || "/placeholder.svg?height=64&width=64"}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <File size={32} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
                        <span className="text-xs mt-1">{asset.duration?.toFixed(1)}s</span>
                      </div>
                    )}
                  </div>

                  {/* Asset info */}
                  <div className={`p-2 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
                    <div className="text-sm font-medium truncate">{asset.name}</div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{asset.size} KB</span>
                      {asset.dimensions && (
                        <span>
                          {asset.dimensions.width}×{asset.dimensions.height}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAsset(asset.id)
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`group flex items-center p-2 rounded ${
                    selectedAsset?.id === asset.id
                      ? theme === "dark"
                        ? "bg-blue-900 bg-opacity-30"
                        : "bg-blue-100"
                      : theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-100"
                  } cursor-pointer`}
                  onClick={() => handleAssetClick(asset)}
                >
                  {/* Icon or thumbnail */}
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    {asset.type === "sprite" || asset.type === "room" ? (
                      <img
                        src={asset.thumbnail || "/placeholder.svg?height=40&width=40"}
                        alt={asset.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <File size={24} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
                      </div>
                    )}
                  </div>

                  {/* Asset info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{asset.name}</div>
                    <div className="text-xs text-gray-500 flex">
                      <span className="mr-2">{asset.size} KB</span>
                      {asset.dimensions && (
                        <span className="mr-2">
                          {asset.dimensions.width}×{asset.dimensions.height}
                        </span>
                      )}
                      {asset.duration && <span>{asset.duration.toFixed(1)}s</span>}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="hidden md:flex flex-wrap gap-1 mx-2">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500 hidden md:block mr-4">
                    {asset.dateAdded.toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 mr-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Edit functionality would go here
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAsset(asset.id)
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Asset details panel (when an asset is selected) */}
        {selectedAsset && (
          <div
            className={`w-64 border-l ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-100"} overflow-y-auto`}
          >
            <div className="p-3">
              <h3 className="text-lg font-semibold mb-2">{selectedAsset.name}</h3>

              {/* Preview */}
              <div
                className={`mb-4 p-2 rounded ${theme === "dark" ? "bg-gray-900" : "bg-white"} flex items-center justify-center`}
              >
                {selectedAsset.type === "sprite" || selectedAsset.type === "room" ? (
                  <img
                    src={selectedAsset.thumbnail || "/placeholder.svg?height=120&width=120"}
                    alt={selectedAsset.name}
                    className="max-w-full max-h-32 object-contain"
                  />
                ) : (
                  <div className="h-24 w-full flex flex-col items-center justify-center">
                    <File size={48} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
                    <audio controls className="mt-2 w-full" src={selectedAsset.url}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Properties</div>
                  <div className={`mt-1 p-2 rounded text-sm ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Type:</span>
                      <span>{selectedAsset.type}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Size:</span>
                      <span>{selectedAsset.size} KB</span>
                    </div>
                    {selectedAsset.dimensions && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Dimensions:</span>
                        <span>
                          {selectedAsset.dimensions.width}×{selectedAsset.dimensions.height}
                        </span>
                      </div>
                    )}
                    {selectedAsset.duration && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Duration:</span>
                        <span>{selectedAsset.duration.toFixed(1)}s</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Added:</span>
                      <span>{selectedAsset.dateAdded.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="text-sm font-medium">Tags</div>
                  <div className={`mt-1 p-2 rounded ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.tags.length > 0 ? (
                        selectedAsset.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-1 rounded ${
                              theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectAsset && onSelectAsset(selectedAsset)}
                  >
                    Use Asset
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteAsset(selectedAsset.id)}>
                    Delete
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={onClose}>
                  Back to Editor
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Fixed back button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="default" size="lg" onClick={onClose} className="shadow-lg">
          <X size={18} className="mr-2" /> Back to Editor
        </Button>
      </div>
    </div>
  )
}
