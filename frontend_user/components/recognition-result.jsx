"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, FileVideo, FileImage } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

export function RecognitionResult({ result, showImage = false }) {
  const { toast } = useToast()
  const canvasRef = useRef(null)
  const isVideo = result.fileType && !result.fileType.startsWith("image/")

  useEffect(() => {
    if (showImage && result.imageData && canvasRef.current && !isVideo) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image
        ctx.drawImage(img, 0, 0)

        // Draw the bounding box if available
        if (result.boundingBox) {
          const { x, y, width, height } = result.boundingBox

          ctx.strokeStyle = "#FF0000"
          ctx.lineWidth = 3
          ctx.strokeRect(x, y, width, height)

          // Add label above the bounding box
          ctx.fillStyle = "#FF0000"
          ctx.font = "16px Arial"
          ctx.fillText(result.licensePlate, x, y - 5)
        }
      }

      img.src = result.imageData
    } else if (result.imageUrl && canvasRef.current && !isVideo) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image
        ctx.drawImage(img, 0, 0)

        // Draw the bounding box if available
        if (result.boundingBox) {
          const { x, y, width, height } = result.boundingBox

          ctx.strokeStyle = "#FF0000"
          ctx.lineWidth = 3
          ctx.strokeRect(x, y, width, height)

          // Add label above the bounding box
          ctx.fillStyle = "#FF0000"
          ctx.font = "16px Arial"
          ctx.fillText(result.licensePlate, x, y - 5)
        }
      }

      img.src = result.imageUrl
    }
  }, [result, showImage, isVideo])

   // ===== HÀM COPY BIỂN SỐ =====
  const copyToClipboard = (plate) => {
    navigator.clipboard.writeText(plate)
    toast({
      title: "Đã sao chép",
      description: `Biển số ${plate} đã được sao chép vào clipboard`,
    })
  }

  // ===== HÀM COPY TẤT CẢ BIỂN SỐ =====
  const copyAllPlates = () => {
    const allPlates = result.licensePlates.join(", ")
    navigator.clipboard.writeText(allPlates)
    toast({
      title: "Đã sao chép tất cả",
      description: `Đã sao chép ${result.licensePlates.length} biển số vào clipboard`,
    })
  }

  const openTrafficViolationPage = () => {
    copyToClipboard()
    window.open("https://csgt.vn", "_blank")
    toast({
      title: "Đã mở trang tra cứu",
      description: "Biển số đã được sao chép, vui lòng dán vào ô tìm kiếm và nhập CAPTCHA",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            {isVideo ? <FileVideo className="h-5 w-5 mr-2" /> : <FileImage className="h-5 w-5 mr-2" />}
            <div className="flex flex-col">
              <span className="text-base font-medium">
                Biển số:{" "}
                {result.licensePlates && result.licensePlates.length > 0 ? (
                  <span className="text-primary">
                    {
                      result.licensePlates.length === 1
                        ? result.licensePlates[0] // Nếu 1 biển số: hiển thị trực tiếp
                        : `${result.licensePlates.length} biển số được tìm thấy` // Nếu nhiều: hiển thị số lượng
                    }
                  </span>
                ) : (
                  <span className="text-muted-foreground">Không tìm thấy biển số</span>
                )}
              </span>

              {/* ===== HIỂN THỊ DANH SÁCH BIỂN SỐ DƯỚI DẠNG BADGE ===== */}
              {result.licensePlates && result.licensePlates.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.licensePlates.map((plate, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium"
                    >
                      {plate}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== NÚT COPY VỚI DROPDOWN ===== */}
          <div className="flex space-x-2">
            {result.licensePlates && result.licensePlates.length > 0 && (
              <>
                {/* ===== NÚT COPY ===== */}
                {result.licensePlates.length === 1 ? (
                  // Nếu chỉ 1 biển số: copy trực tiếp
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(result.licensePlates[0])}>
                    <Copy className="h-4 w-4" />
                  </Button>
                ) : (
                  // Nếu nhiều biển số: dropdown để chọn copy
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* Tùy chọn copy TẤT CẢ */}
                      <DropdownMenuItem onClick={copyAllPlates} className="font-medium">
                        <Copy className="h-4 w-4 mr-2" />
                        Sao chép tất cả ({result.licensePlates.length} biển số)
                      </DropdownMenuItem>
                      <div className="border-t my-1"></div>
                      {/* Tùy chọn copy TỪNG biển số */}
                      {result.licensePlates.map((plate, index) => (
                        <DropdownMenuItem key={index} onClick={() => copyToClipboard(plate)} className="font-mono">
                          <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                          {plate}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* ===== NÚT TRA CỨU ===== */}
                {result.licensePlates.length === 1 ? (
                  // Nếu chỉ 1 biển số: tra cứu trực tiếp
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openTrafficViolationPage(result.licensePlates[0])}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ) : (
                  // Nếu nhiều biển số: dropdown để chọn tra cứu
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Chọn biển số để tra cứu:
                      </div>
                      <div className="border-t my-1"></div>
                      {result.licensePlates.map((plate, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => openTrafficViolationPage(plate)}
                          className="font-mono"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                          {plate}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Thời gian: {formatDate(result.timestamp)}</p>
          {result.filename && <p>File: {result.filename}</p>}
          {result.licensePlates && <p>Số lượng biển số: {result.licensePlates.length}</p>}
        </div>

        {(showImage || result.imageUrl) && (
          <div className="mt-4 bg-black rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                src={result.imageUrl || result.imageData}
                controls
                className="w-full max-h-[400px]"
                controlsList="nodownload"
                preload="metadata"
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            ) : (
              <canvas ref={canvasRef} className="w-full" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
