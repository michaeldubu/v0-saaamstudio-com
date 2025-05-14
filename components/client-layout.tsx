"use client"

import type React from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Any client-side functionality can go here
  return <div className="h-full">{children}</div>
}

