"use client"

import { ModeToggle } from "./mode-toggle"
import { AdminButton } from "./admin-button"
import { Toaster } from "@/components/ui/toaster"

export function MainAppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Trang dành cho người dùng</h1>
          <div className="flex items-center gap-3">
            <AdminButton />
            <ModeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Toaster />
    </div>
  )
}
