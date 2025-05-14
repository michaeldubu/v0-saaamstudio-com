"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const GameStudioImplementation = ({ onCodeGenerated }) => {
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [code, setCode] = useState("")

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
  }

  const handleEntityChange = (id, field, value) => {
    const updatedEntities = entities.map((entity) => (entity.id === id ? { ...entity, [field]: value } : entity))
    setEntities(updatedEntities)
  }

  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity)
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

  return (
    <div className="w-full h-full flex bg-gray-900 text-white">
      <div className="w-1/4 p-4 border-r border-gray-700">
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

      <div className="w-1/4 p-4 border-r border-gray-700">
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

      <div className="flex-1 p-4">
        <h2 className="text-xl font-semibold mb-4">Generated Code</h2>
        <textarea
          className="w-full h-3/4 p-2 bg-gray-800 text-white font-mono rounded resize-none"
          value={code}
          readOnly
        />
        <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded mt-4" onClick={handleGenerateCode}>
          Generate Code
        </button>
      </div>
    </div>
  )
}

export default GameStudioImplementation

