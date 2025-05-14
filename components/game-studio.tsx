"use client"

// Import the implementation directly
import GameStudioImplementation from "./game-studio-implementation"

interface GameStudioProps {
  onCodeGenerated: (code: string) => void
}

export default function GameStudio({ onCodeGenerated }: GameStudioProps) {
  // We're wrapping the imported implementation
  return <GameStudioImplementation onCodeGenerated={onCodeGenerated} />
}

