"use client"

import { ModeToggle } from "./mode-toggle"
import { Toaster } from "@/components/ui/toaster"

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Ứng dụng Nhận dạng Biển số xe</h1>
          <ModeToggle />
        </div>
      </header>
      <main>{children}</main>
      <Toaster />
    </div>
  )
}
