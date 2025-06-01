"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"

interface GameStudioImplementationProps {
  onCodeGenerated: (code: string) => void
}

const GameStudioImplementation = ({ onCodeGenerated }: GameStudioImplementationProps) => {
  const [entities, setEntities] = useState<
    Array<{
      id: string
      name: string
      x: number
      y: number
      width: number
      height: number
      color: string
    }>
  >([])
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [code, setCode] = useState("")
  const [showEntities, setShowEntities] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleAddEntity = () => {
    const newEntity = {
      id: Math.random().toString(36).substring(7),
      name: `Entity${entities.length + 1}`,
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: "#FFFFFF",
    }
    setEntities([...entities, newEntity])
    setSelectedEntity(newEntity)
  }

  const handleEntityChange = (id: string, field: string, value: any) => {
    const updatedEntities = entities.map((entity) => (entity.id === id ? { ...entity, [field]: value } : entity))
    setEntities(updatedEntities)
  }

  const handleSelectEntity = (entity: any) => {
    setSelectedEntity(entity)
    if (isMobile) {
      setShowEntities(false)
      setShowProperties(true)
    }
  }

  const handleGenerateCode = () => {
    let generatedCode = `// Generated Game Code\n\n`
    entities.forEach((entity) => {
      generatedCode += `let ${entity.name} = {\n`
      generatedCode += `  x: ${entity.x},\n`
      generatedCode += `  y: ${entity.y},\n`
      generatedCode += `  width: ${entity.width},\n`
      generatedCode += `  height: ${entity.height},\n`
      generatedCode += `  color: "${entity.color}"\n`
      generatedCode += `};\n\n`
    })

    setCode(generatedCode)
    onCodeGenerated(generatedCode)
  }

  const toggleEntitiesPanel = () => {
    setShowEntities(!showEntities)
    if (isMobile && !showEntities) {
      setShowProperties(false)
    }
  }

  const togglePropertiesPanel = () => {
    setShowProperties(!showProperties)
    if (isMobile && !showProperties) {
      setShowEntities(false)
    }
  }

  const backToEntities = () => {
    setShowEntities(true)
    setShowProperties(false)
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Mobile navigation */}
      {isMobile && (
        <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
          <button
            className={`px-3 py-1 rounded ${showEntities ? "bg-blue-600" : "bg-gray-700"}`}
            onClick={toggleEntitiesPanel}
          >
            Entities
          </button>
          <button
            className={`px-3 py-1 rounded ${showProperties ? "bg-blue-600" : "bg-gray-700"}`}
            onClick={togglePropertiesPanel}
            disabled={!selectedEntity}
          >
            Properties
          </button>
          <button className="px-3 py-1 rounded bg-green-600" onClick={handleGenerateCode}>
            Generate
          </button>
        </div>
      )}

      {/* Entities panel */}
      {(showEntities || !isMobile) && (
        <div className={`${isMobile ? "w-full" : "w-1/4"} p-4 ${!isMobile && "border-r border-gray-700"}`}>
          <h2 className="text-xl font-semibold mb-4">Entities</h2>
          <div className="space-y-2">
            {entities.map((entity) => (
              <div
                key={entity.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedEntity?.id === entity.id ? "bg-blue-700" : "hover:bg-gray-800"
                }`}
                onClick={() => handleSelectEntity(entity)}
              >
                {entity.name}
              </div>
            ))}
            <button className="w-full p-2 bg-green-600 hover:bg-green-700 rounded" onClick={handleAddEntity}>
              <Plus className="w-4 h-4 mr-2 inline-block" />
              Add Entity
            </button>
          </div>
        </div>
      )}

      {/* Properties panel */}
      {(showProperties || !isMobile) && (
        <div className={`${isMobile ? "w-full" : "w-1/4"} p-4 ${!isMobile && "border-r border-gray-700"}`}>
          {isMobile && (
            <button className="mb-4 px-3 py-1 rounded bg-gray-700" onClick={backToEntities}>
              ← Back to Entities
            </button>
          )}

          {selectedEntity ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Entity Properties</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    value={selectedEntity.name}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "name", e.target.value)}
                    className="mt-1 p-2 w-full bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">X</label>
                  <input
                    type="number"
                    value={selectedEntity.x}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "x", Number.parseInt(e.target.value))}
                    className="mt-1 p-2 w-full bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Y</label>
                  <input
                    type="number"
                    value={selectedEntity.y}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "y", Number.parseInt(e.target.value))}
                    className="mt-1 p-2 w-full bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Width</label>
                  <input
                    type="number"
                    value={selectedEntity.width}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "width", Number.parseInt(e.target.value))}
                    className="mt-1 p-2 w-full bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Height</label>
                  <input
                    type="number"
                    value={selectedEntity.height}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "height", Number.parseInt(e.target.value))}
                    className="mt-1 p-2 w-full bg-gray-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Color</label>
                  <input
                    type="color"
                    value={selectedEntity.color}
                    onChange={(e) => handleEntityChange(selectedEntity.id, "color", e.target.value)}
                    className="mt-1 p-2 w-full bg-gray-700 rounded"
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Select an entity to edit its properties.</p>
          )}
        </div>
      )}

      {/* Code panel - always visible on desktop, conditionally on mobile */}
      {(!isMobile || (!showEntities && !showProperties)) && (
        <div className="flex-1 p-4">
          <h2 className="text-xl font-semibold mb-4">Generated Code</h2>
          <textarea
            className="w-full h-3/4 p-2 bg-gray-800 text-white font-mono rounded resize-none"
            value={code}
            readOnly
          />
          {!isMobile && (
            <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded mt-4" onClick={handleGenerateCode}>
              Generate Code
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default GameStudioImplementation
