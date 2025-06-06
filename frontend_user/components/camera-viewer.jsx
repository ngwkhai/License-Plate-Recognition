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
  const resultCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const captureIntervalRef = useRef(null)
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
      stopStream()
    }
  }, [toast])

  useEffect(() => {
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
        await videoRef.current.play()
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve()
        })
      }

      setIsStreaming(true)
      setResult(null)

      // Bắt đầu gửi frame tự động mỗi 1.5s
      captureIntervalRef.current = setInterval(captureFrame, 1500)
    } catch (error) {
      console.error("Error starting stream:", error)
      toast({
        title: "Không thể bắt đầu stream",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      })
      retryTimeoutRef.current = setTimeout(() => {
        startStream()
      }, 5000)
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
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }
    setIsStreaming(false)
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const resultCanvas = resultCanvasRef.current
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
        formData.append("files", blob, "frame.jpg")

        const response = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        const firstResult = data[0]
        if (!firstResult || !firstResult.licensePlates || !firstResult.imageBase64) return

        const image = new Image()
        image.onload = () => {
          if (resultCanvas) {
            const ctx2 = resultCanvas.getContext("2d")
            if (ctx2) {
              resultCanvas.width = image.width
              resultCanvas.height = image.height
              ctx2.clearRect(0, 0, image.width, image.height)
              ctx2.drawImage(image, 0, 0)
            }
          }
        }
        image.src = `data:image/jpeg;base64,${firstResult.imageBase64}`

        const newResult = {
          id: `result-${Date.now()}`,
          licensePlates: firstResult.licensePlates,
          timestamp: firstResult.timestamp,
        }

        setResult(newResult)

        firstResult.licensePlates.forEach((plate, plateIndex) => {
          const newHistoryItem = {
            id: `${newResult.id}-plate-${plateIndex}`,
            licensePlate: plate,
            timestamp: newResult.timestamp,
            source: "camera",
            imageUrl: image.src,
          }
          setHistory((prev) => [newHistoryItem, ...prev])
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
      </div>

      <video ref={videoRef} className="w-full rounded border" autoPlay muted />
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={resultCanvasRef} className="w-full rounded border" />

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
