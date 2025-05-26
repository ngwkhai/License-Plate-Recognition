"use client"

import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function AdminButton() {
  const { toast } = useToast()

  const goToAdminPage = () => {
    // Chuyển đến trang admin trên port 5174
    window.open("http://localhost:5174", "_blank")

    toast({
      title: "Chuyển đến trang Admin",
      description: "Đang mở trang quản trị trong tab mới",
    })
  }

  return (
    <Button variant="outline" size="icon" onClick={goToAdminPage} className="rounded-full" title="Đăng nhập Admin">
      <User className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Đăng nhập Admin</span>
    </Button>
  )
}
