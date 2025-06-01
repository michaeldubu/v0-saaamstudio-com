"use client"
import { useStudio } from "@/contexts/studio-context"
import SaaamSandbox from "./saaam-sandbox"

export default function SaaamStudioWorkspace() {
  const { getActiveFile } = useStudio()

  const activeFile = getActiveFile()

  return (
    <div className="h-full flex flex-col">
      <SaaamSandbox initialCode={activeFile?.content || ""} width={800} height={600} />
    </div>
  )
}
