"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Trash2, Download, FileVideo, FileImage, X, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function HistoryView({ onClose }) {
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
    toast({
      title: "Đã xóa lịch sử",
      description: "Tất cả lịch sử tra cứu đã được xóa",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Lịch sử tra cứu biển số xe</h1>
        </div>
        <Button variant="outline" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="py-12">
              <p className="text-muted-foreground text-lg">Chưa có lịch sử tra cứu nào</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Quay lại trang nhận dạng
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Hiển thị {history.length} kết quả tra cứu</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Xóa tất cả
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Quay lại
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian tra cứu</TableHead>
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
                          <div className="flex items-center">
                            {item.source === "upload" ? (
                              <>
                                {item.fileType?.startsWith("image/") ? (
                                  <FileImage className="h-4 w-4 mr-2" />
                                ) : (
                                  <FileVideo className="h-4 w-4 mr-2" />
                                )}
                                <span>{item.filename || "Tệp đã tải lên"}</span>
                              </>
                            ) : item.source === "camera" ? (
                              <>
                                <FileImage className="h-4 w-4 mr-2" />
                                <span>Ảnh từ camera</span>
                              </>
                            ) : (
                              <span>Nhập thủ công</span>
                            )}
                            {item.imageUrl && (
                              <Button variant="ghost" size="sm" className="ml-2" asChild>
                                <a
                                  href={item.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    // Nếu là video, mở trong cửa sổ mới
                                    if (item.fileType && !item.fileType.startsWith("image/")) {
                                      window.open(item.imageUrl, "_blank", "width=800,height=600")
                                      e.preventDefault()
                                    }
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" /> Xem
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.licensePlate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Sao chép biển số"
                              onClick={() => copyToClipboard(item.licensePlate)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Tra cứu trên CSGT.vn"
                              onClick={() => openTrafficViolationPage(item.licensePlate)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Xóa khỏi lịch sử"
                              onClick={() => removeFromHistory(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
