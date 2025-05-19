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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.licensePlate)
    toast({
      title: "Đã sao chép",
      description: `Biển số ${result.licensePlate} đã được sao chép vào clipboard`,
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
            <span>Biển số: {result.licensePlate}</span>
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
