"use client"

import { useState, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

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
  const [history, setHistory] = useState(
    () => JSON.parse(localStorage.getItem("license-plate-history") || "[]")
  )

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput")
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast({
          title: "Không thể truy cập camera",
          description: "Vui lòng cấp quyền truy cập camera cho trình duyệt.",
          variant: "destructive",
        })
      }
    }

    getDevices()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [toast])

  useEffect(() => {
    // Sync history to localStorage when history changes
    localStorage.setItem("license-plate-history", JSON.stringify(history))
  }, [history])

  const startStream = async () => {
    if (!selectedDeviceId) {
      toast({
        title: "Chưa chọn camera",
        description: "Vui lòng chọn một camera trước khi bắt đầu.",
        variant: "destructive",
      })
      return
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

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
      console.error("Error starting stream:", error)
      toast({
        title: "Không thể bắt đầu stream",
        description: "Vui lòng thử lại.",
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

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      toast({
        title: "Không thể chụp ảnh",
        description: "Camera chưa hoạt động hoặc chưa có khung hình.",
        variant: "destructive",
      })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) return

      setIsLoading(true)

      try {
        const formData = new FormData()
        formData.append("image", blob)

        const response = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!data.licensePlates || !data.boundingBoxes) {
          throw new Error("Dữ liệu trả về không hợp lệ.")
        }

        // Vẽ bounding boxes và label
        data.boundingBoxes.forEach((box, index) => {
          const { x, y, width, height } = box
          ctx.strokeStyle = "#FF0000"
          ctx.lineWidth = 3
          ctx.strokeRect(x, y, width, height)

          ctx.fillStyle = "#FF0000"
          ctx.font = "16px Arial"
          ctx.fillText(data.licensePlates[index] || "", x, y - 5)
        })

        const imageData = canvas.toDataURL("image/jpeg")

        const newResult = {
          id: `result-${Date.now()}`,
          licensePlates: data.licensePlates,
          boundingBoxes: data.boundingBoxes,
          timestamp: new Date().toISOString(),
          imageData,
        }

        setResult(newResult)

        data.licensePlates.forEach((plate, plateIndex) => {
          const newHistoryItem = {
            id: `${newResult.id}-plate-${plateIndex}`,
            licensePlate: plate,
            timestamp: newResult.timestamp,
            source: "camera",
            imageUrl: imageData,
          }
          setHistory((prev) => [newHistoryItem, ...prev])
        })

        toast({
          title: "Nhận dạng thành công",
          description: `Phát hiện ${data.licensePlates.length} biển số.`,
        })
      } catch (err) {
        console.error("Recognition error:", err)
        toast({
          title: "Lỗi nhận dạng",
          description: "Không thể nhận dạng ảnh. Vui lòng thử lại.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, "image/jpeg")
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="border p-2 rounded"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "Không tên"}
            </option>
          ))}
        </select>

        <button onClick={startStream} className="bg-green-600 text-white px-4 py-2 rounded">
          Bắt đầu
        </button>
        <button onClick={stopStream} className="bg-red-600 text-white px-4 py-2 rounded">
          Dừng
        </button>
        <button
          onClick={captureFrame}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Đang xử lý..." : "Chụp ảnh"}
        </button>
      </div>

      <video ref={videoRef} className="w-full rounded border" autoPlay muted />
      <canvas ref={canvasRef} className="hidden" />

      {result?.licensePlates?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Biển số nhận dạng:</h4>
          <ul className="bg-gray-100 p-3 rounded space-y-1 text-sm">
            {result.licensePlates.map((plate, index) => (
              <li key={index} className="bg-white p-1 rounded border">
                {plate}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
