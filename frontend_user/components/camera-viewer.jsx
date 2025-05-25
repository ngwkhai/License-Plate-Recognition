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
  const wsRef = useRef(null)
  const { toast } = useToast()
  const [history, setHistory] = useLocalStorage("license-plate-history", [])

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setDevices(videoDevices)
        if (videoDevices.length > 0) setSelectedDeviceId(videoDevices[0].deviceId)
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
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
      if (wsRef.current) wsRef.current.close()
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
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      wsRef.current = new WebSocket("ws://localhost:8000/ws")
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const context = canvas.getContext("2d")
          const img = new Image()
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            context.drawImage(img, 0, 0)
            context.strokeStyle = "#FF0000"
            context.lineWidth = 3
            context.strokeRect(...data.boundingBox)
            context.fillStyle = "#FF0000"
            context.font = "16px Arial"
            context.fillText(data.licensePlate, data.boundingBox[0], data.boundingBox[1] - 5)
            const imageData = canvas.toDataURL("image/jpeg")
            const mockResult = {
              id: `result-${Date.now()}`,
              licensePlate: data.licensePlate,
              boundingBox: data.boundingBox,
              timestamp: new Date().toISOString(),
              imageData: imageData,
            }
            setResult(mockResult)
            const newHistoryItem = {
              id: mockResult.id,
              licensePlate: mockResult.licensePlate,
              timestamp: mockResult.timestamp,
              source: "camera",
              imageUrl: imageData,
            }
            setHistory((prev) => [newHistoryItem, ...prev])
            toast({
              title: "Nhận dạng thành công",
              description: `Đã nhận dạng biển số: ${mockResult.licensePlate}`,
            })
          }
          img.src = `data:image/jpeg;base64,${data.image}`
        }
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
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    if (wsRef.current) wsRef.current.close()
    setIsStreaming(false)
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
              <Switch id="stream-toggle" checked={isStreaming} onCheckedChange={(checked) => (checked ? startStream() : stopStream())} />
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
        </CardContent>
      </Card>
      {result && <RecognitionResult result={result} onReset={() => setResult(null)} />}
    </div>
  )
}
