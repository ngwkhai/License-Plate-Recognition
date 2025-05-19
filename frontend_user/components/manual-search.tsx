"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchHistory } from "@/hooks/use-search-history"

export function ManualSearch() {
  const [licensePlate, setLicensePlate] = useState("")
  const { toast } = useToast()
  const { addToHistory } = useSearchHistory()

  const copyToClipboard = () => {
    if (!licensePlate.trim()) {
      toast({
        title: "Biển số trống",
        description: "Vui lòng nhập biển số xe trước khi sao chép",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(licensePlate)
    toast({
      title: "Đã sao chép",
      description: `Biển số ${licensePlate} đã được sao chép vào clipboard`,
    })
  }

  const openTrafficViolationPage = () => {
    if (!licensePlate.trim()) {
      toast({
        title: "Biển số trống",
        description: "Vui lòng nhập biển số xe trước khi tra cứu",
        variant: "destructive",
      })
      return
    }

    // Add to history
    addToHistory({
      id: `manual-${Date.now()}`,
      licensePlate,
      timestamp: new Date().toISOString(),
      source: "manual",
    })

    copyToClipboard()
    window.open("https://csgt.vn", "_blank")
    toast({
      title: "Đã mở trang tra cứu",
      description: "Biển số đã được sao chép, vui lòng dán vào ô tìm kiếm và nhập CAPTCHA",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Nhập biển số xe (VD: 30A-12345)"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </Button>
            <Button onClick={openTrafficViolationPage}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Tra cứu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
