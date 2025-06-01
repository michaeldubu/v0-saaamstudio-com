import { StudioProvider } from "@/contexts/studio-context"
import ClientLayout from "@/components/client-layout"
import SaaamApp from "@/components/saaam-app"

export default function Home() {
  return (
    <StudioProvider>
      <ClientLayout>
        <SaaamApp />
      </ClientLayout>
    </StudioProvider>
  )
}
