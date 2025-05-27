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

  const copyToClipboard = () => {
    const text = (result.licensePlates || []).join(", ")
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: `Biển số: ${text}`,
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
            <span>Biển số: {(result.licensePlates || []).join(", ")}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openTrafficViolationPage}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Thời gian: {formatDate(result.timestamp)}</p>
          {result.filename && <p>File: {result.filename}</p>}
        </div>

        <div className="mt-4 bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            <video
              controls
              className="w-full max-h-[400px]"
              controlsList="nodownload"
              preload="metadata"
              src={result.imageUrl}
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          ) : (
            <canvas ref={canvasRef} className="w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
