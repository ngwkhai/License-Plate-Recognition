"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchHistory } from "@/hooks/use-search-history"
import { formatDate } from "@/lib/utils"

export function SearchHistory() {
  const { history, clearHistory, removeFromHistory } = useSearchHistory()
  const { toast } = useToast()

  const copyToClipboard = (licensePlate: string) => {
    navigator.clipboard.writeText(licensePlate)
    toast({
      title: "Đã sao chép",
      description: `Biển số ${licensePlate} đã được sao chép vào clipboard`,
    })
  }

  const openTrafficViolationPage = (licensePlate: string) => {
    copyToClipboard(licensePlate)
    window.open("https://csgt.vn", "_blank")
    toast({
      title: "Đã mở trang tra cứu",
      description: "Biển số đã được sao chép, vui lòng dán vào ô tìm kiếm và nhập CAPTCHA",
    })
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">Chưa có lịch sử tra cứu nào</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={clearHistory}>
          Xóa tất cả
        </Button>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Biển số: {item.licensePlate}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(item.licensePlate)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openTrafficViolationPage(item.licensePlate)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => removeFromHistory(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <div className="text-sm text-muted-foreground">
                <p>Thời gian: {formatDate(item.timestamp)}</p>
                <p>
                  Nguồn: {item.source === "upload" ? "Tải lên" : item.source === "camera" ? "Camera" : "Nhập thủ công"}
                </p>
                {item.filename && <p>File: {item.filename}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
