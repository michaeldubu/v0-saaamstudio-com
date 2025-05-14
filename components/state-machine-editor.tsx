"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

interface StateMachineEditorProps {
  onCodeGenerated: (code: string) => void
}

export default function StateMachineEditor({ onCodeGenerated }: StateMachineEditorProps) {
  const [states, setStates] = useState<string[]>(["Idle", "Walking", "Jumping"])
  const [transitions, setTransitions] = useState<{ from: string; to: string; condition: string }[]>([
    { from: "Idle", to: "Walking", condition: "movePressed" },
    { from: "Walking", to: "Idle", condition: "moveReleased" },
    { from: "Idle", to: "Jumping", condition: "jumpPressed" },
    { from: "Walking", to: "Jumping", condition: "jumpPressed" },
    { from: "Jumping", to: "Idle", condition: "grounded" },
  ])

  const generateCode = () => {
    // Simple state machine code generation
    const code = `// Generated State Machine Code
class StateMachine {
  constructor() {
    this.currentState = "Idle";
    this.states = {
${states.map((state) => `      "${state}": { enter: () => console.log("Entering ${state}"), exit: () => console.log("Exiting ${state}") }`).join(",\n")}
    };
    this.transitions = [
${transitions.map((t) => `      { from: "${t.from}", to: "${t.to}", condition: (entity) => entity.${t.condition} }`).join(",\n")}
    ];
  }

  update(entity) {
    // Check transitions
    for (const transition of this.transitions) {
      if (this.currentState === transition.from && transition.condition(entity)) {
        this.changeState(transition.to);
        break;
      }
    }
  }

  changeState(newState) {
    if (this.currentState === newState) return;
    
    // Exit current state
    this.states[this.currentState].exit();
    
    // Change state
    this.currentState = newState;
    
    // Enter new state
    this.states[this.currentState].enter();
  }
}`

    onCodeGenerated(code)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">State Machine Editor</h1>

      <div className="flex-1 flex">
        <div className="w-1/3 p-4 bg-gray-800 rounded-lg mr-4">
          <h2 className="text-xl font-semibold mb-2">States</h2>
          <div className="space-y-2">
            {states.map((state, index) => (
              <div key={index} className="flex items-center bg-gray-700 p-2 rounded">
                <span className="flex-1">{state}</span>
              </div>
            ))}
            <button
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center"
              onClick={() => setStates([...states, `State${states.length + 1}`])}
            >
              <Plus className="w-4 h-4 mr-1" /> Add State
            </button>
          </div>
        </div>

        <div className="w-2/3 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Transitions</h2>
          <div className="space-y-2">
            {transitions.map((transition, index) => (
              <div key={index} className="flex items-center bg-gray-700 p-2 rounded">
                <span className="mr-2">{transition.from}</span>
                <span className="mx-2">→</span>
                <span className="mr-2">{transition.to}</span>
                <span className="mx-2">when</span>
                <span className="flex-1">{transition.condition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded" onClick={generateCode}>
          Generate Code
        </button>
      </div>
    </div>
  )
}

