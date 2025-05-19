"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Trash2, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function HistoryViewer() {
  const [history, setHistory] = useLocalStorage("license-plate-history", [])
  const { toast } = useToast()

  const copyToClipboard = (licensePlate) => {
    navigator.clipboard.writeText(licensePlate)
    toast({
      title: "Đã sao chép",
      description: `Biển số ${licensePlate} đã được sao chép vào clipboard`,
    })
  }

  const openTrafficViolationPage = (licensePlate) => {
    copyToClipboard(licensePlate)
    window.open("https://csgt.vn", "_blank")
    toast({
      title: "Đã mở trang tra cứu",
      description: "Biển số đã được sao chép, vui lòng dán vào ô tìm kiếm và nhập CAPTCHA",
    })
  }

  const removeFromHistory = (id) => {
    setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
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

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tệp đã tải lên / Ảnh đã chụp</TableHead>
                <TableHead>Kết quả tra cứu</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(item.timestamp)}</TableCell>
                  <TableCell>
                    {item.source === "upload" ? (
                      <span>{item.filename || "Tệp đã tải lên"}</span>
                    ) : item.source === "camera" ? (
                      <span>Ảnh từ camera</span>
                    ) : (
                      <span>Nhập thủ công</span>
                    )}
                    {item.imageUrl && (
                      <Button variant="ghost" size="sm" className="ml-2" asChild>
                        <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Xem
                        </a>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.licensePlate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
