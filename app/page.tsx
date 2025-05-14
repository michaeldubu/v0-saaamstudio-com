"use client"

import ClientLayout from "@/components/client-layout"
import SaaamApp from "@/components/saaam-app"

export default function Home() {
  return (
    <ClientLayout>
      <div className="w-full h-screen flex flex-col">
        <SaaamApp />
      </div>
    </ClientLayout>
  )
}

