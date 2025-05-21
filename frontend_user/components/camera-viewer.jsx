"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, RefreshCw, CameraIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RecognitionResult } from "@/components/recognition-result"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function CameraViewer() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const { toast } = useToast()
  const [history, setHistory] = useLocalStorage("license-plate-history", [])

  // Get available camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        // Request permission first to ensure we get devices
        await navigator.mediaDevices.getUserMedia({ video: true })

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")

        setDevices(videoDevices)

        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast({
          title: "Không thể truy cập camera",
          description: "Vui lòng đảm bảo bạn đã cấp quyền truy cập camera cho trang web này.",
          variant: "destructive",
        })
      }
    }

    getDevices()

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [toast])

  const startStream = async () => {
    if (!selectedDeviceId) {
      toast({
        title: "Không có camera nào được chọn",
        description: "Vui lòng chọn một camera để bắt đầu stream.",
        variant: "destructive",
      })
      return
    }

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Start a new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setIsStreaming(true)
      setResult(null)
    } catch (error) {
      console.error("Error starting camera stream:", error)
      toast({
        title: "Lỗi khi bắt đầu stream",
        description: "Không thể bắt đầu stream camera. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
  }

  const resetResult = () => {
    setResult(null)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      toast({
        title: "Không thể chụp khung hình",
        description: "Vui lòng đảm bảo camera đang hoạt động.",
        variant: "destructive",
      })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        setIsLoading(true)

        try {
          // In a real application, you would send this blob to your backend
          const formData = new FormData();
          formData.append('image', blob);
          const response = await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
          const data = await response.json();

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Generate a random bounding box
          const boundingBox = {
            x: Math.floor(Math.random() * 50) + 25,
            y: Math.floor(Math.random() * 50) + 25,
            width: Math.floor(Math.random() * 100) + 100,
            height: Math.floor(Math.random() * 50) + 30,
          }

          // Draw the bounding box on the canvas
          context.strokeStyle = "#FF0000"
          context.lineWidth = 3
          context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)

          // Generate a random license plate
          const licensePlate = `${Math.floor(Math.random() * 90) + 10}A-${Math.floor(Math.random() * 90000) + 10000}`

          // Add label above the bounding box
          context.fillStyle = "#FF0000"
          context.font = "16px Arial"
          context.fillText(licensePlate, boundingBox.x, boundingBox.y - 5)

          // Get image data for storage
          const imageData = canvas.toDataURL("image/jpeg")

          // Mock result
          const mockResult = {
            id: `result-${Date.now()}`,
            licensePlate: licensePlate,
            boundingBox: boundingBox,
            timestamp: new Date().toISOString(),
            imageData: imageData,
          }

          setResult(mockResult)

          // Add to history - create a new array instead of modifying the existing one
          const newHistoryItem = {
            id: mockResult.id,
            licensePlate: mockResult.licensePlate,
            timestamp: mockResult.timestamp,
            source: "camera",
            imageUrl: imageData,
          }

          setHistory((prevHistory) => [newHistoryItem, ...prevHistory])

          toast({
            title: "Nhận dạng thành công",
            description: `Đã nhận dạng biển số: ${mockResult.licensePlate}`,
          })
        } catch (error) {
          toast({
            title: "Lỗi khi nhận dạng",
            description: "Đã xảy ra lỗi khi nhận dạng biển số. Vui lòng thử lại sau.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      },
      "image/jpeg",
      0.95,
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-1/3">
              <Label htmlFor="camera-select">Chọn camera</Label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={isStreaming}>
                <SelectTrigger id="camera-select" className="w-full">
                  <SelectValue placeholder="Chọn camera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stream-toggle"
                checked={isStreaming}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startStream()
                  } else {
                    stopStream()
                  }
                }}
              />
              <Label htmlFor="stream-toggle">{isStreaming ? "Tắt camera" : "Bật camera"}</Label>
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className={`w-full ${isStreaming ? "block" : "hidden"}`} autoPlay playsInline muted />

            {!isStreaming && (
              <div className="flex flex-col items-center justify-center h-64 text-white">
                <Camera className="h-12 w-12 mb-4" />
                <p>Camera đang tắt</p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {isStreaming && (
            <div className="flex justify-center">
              <Button onClick={captureFrame} disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CameraIcon className="mr-2 h-4 w-4" />
                    Chụp và nhận dạng
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kết quả nhận dạng</h2>
            <Button variant="outline" size="sm" onClick={resetResult}>
              <X className="h-4 w-4 mr-2" />
              Thoát
            </Button>
          </div>
          <RecognitionResult result={result} showImage />
        </div>
      )}
    </div>
  )
}
