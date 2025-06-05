import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CuboidIcon as Cube, LayoutDashboard } from "lucide-react"

// Import the 3D sandbox component
import Saaam3DSandbox from "./saaam-3d-sandbox"

export default function SaaamStudioWorkspace() {
  return (
    <Tabs defaultValue="dashboard" className="flex flex-col h-full w-full">
      <TabsList className="flex border-b border-gray-700 overflow-x-auto">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2">
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </TabsTrigger>

        <TabsTrigger value="3d-sandbox" className="flex items-center gap-2 px-4 py-2">
          <Cube className="h-4 w-4" />
          <span>3D Sandbox</span>
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="dashboard" className="flex-1 p-0 m-0">
          Dashboard Content
        </TabsContent>
        <TabsContent value="3d-sandbox" className="flex-1 p-0 m-0">
          <Saaam3DSandbox />
        </TabsContent>
      </div>
    </Tabs>
  )
}
