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
      loopCapture()
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

  const loopCapture = async () => {
    while (isStreaming) {
      await captureFrame()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve()

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
          if (!firstResult || !firstResult.licensePlates || !firstResult.imageBase64) return resolve()

          const imageData = `data:image/jpeg;base64,${firstResult.imageBase64}`

          const newResult = {
            id: `result-${Date.now()}`,
            licensePlates: firstResult.licensePlates,
            timestamp: firstResult.timestamp,
            imageData,
          }

          setResult(newResult)

          firstResult.licensePlates.forEach((plate, plateIndex) => {
            const newHistoryItem = {
              id: `${newResult.id}-plate-${plateIndex}`,
              licensePlate: plate,
              timestamp: newResult.timestamp,
              source: "camera",
              imageUrl: imageData,
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
          resolve()
        }
      }, "image/jpeg")
    })
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

      <canvas ref={canvasRef} className="w-full rounded border" />

      {result?.licensePlates?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Biển số nhận dạng:</h4>
          <img src={result.imageData} alt="Biển số" className="rounded border w-full max-w-xl" />
          <ul className="bg-gray-100 p-3 rounded space-y-1 text-sm mt-2">
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
