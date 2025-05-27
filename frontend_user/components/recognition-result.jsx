"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, FileVideo, FileImage, ChevronDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function RecognitionResult({ result, showImage = false }) {
  const { toast } = useToast()
  const canvasRef = useRef(null)
  const isVideo = result.fileType && !result.fileType.startsWith("image/")

  useEffect(() => {
    if ((showImage || result.imageUrl) && canvasRef.current && !isVideo) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
      }
      img.src = result.imageUrl || result.imageData
    }
  }, [result, showImage, isVideo])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Đã sao chép", description: `Biển số: ${text}` })
  }

  const copyAllPlates = () => {
    const all = (result.licensePlates || []).join(", ")
    copyToClipboard(all)
  }

  const openTrafficViolationPage = (plate) => {
    copyToClipboard(plate)
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
                    {result.licensePlates.length === 1
                      ? result.licensePlates[0]
                      : `${result.licensePlates.length} biển số được tìm thấy`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Không tìm thấy biển số</span>
                )}
              </span>
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

          <div className="flex space-x-2">
            {result.licensePlates && result.licensePlates.length > 0 && (
              <>
                {result.licensePlates.length === 1 ? (
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(result.licensePlates[0])}>
                    <Copy className="h-4 w-4" />
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={copyAllPlates} className="font-medium">
                        <Copy className="h-4 w-4 mr-2" />
                        Sao chép tất cả ({result.licensePlates.length} biển số)
                      </DropdownMenuItem>
                      <div className="border-t my-1"></div>
                      {result.licensePlates.map((plate, index) => (
                        <DropdownMenuItem key={index} onClick={() => copyToClipboard(plate)} className="font-mono">
                          <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                          {plate}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {result.licensePlates.length === 1 ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openTrafficViolationPage(result.licensePlates[0])}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ) : (
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
                src={isVideo ? result.imageUrl : result.imageData}
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
