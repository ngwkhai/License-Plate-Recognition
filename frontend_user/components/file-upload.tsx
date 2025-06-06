"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileImage, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { RecognitionResult } from "@/components/recognition-result"
import { useSearchHistory } from "@/hooks/use-search-history"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/avi"]

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { addToHistory } = useSearchHistory()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type) || ALLOWED_VIDEO_TYPES.includes(file.type),
    )

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Định dạng file không hợp lệ",
        description: "Chỉ chấp nhận các định dạng JPG, PNG, JPEG, MP4, AVI",
        variant: "destructive",
      })
    }

    setFiles(validFiles)

    // Create previews
    const newPreviews: string[] = []
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
    })

    setPreviews(newPreviews)
    setResults([])
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    const newPreviews = [...previews]

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index])

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "Không có file nào được chọn",
        description: "Vui lòng chọn ít nhất một file để tải lên",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setProgress(0)

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Simulate API call
      // In a real application, you would use FormData to send files to your backend
      // const formData = new FormData();
      // files.forEach(file => formData.append('files', file));
      // const response = await fetch('your-api-endpoint', { method: 'POST', body: formData });
      // const data = await response.json();

      // Simulate API response after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(interval)
      setProgress(100)

      // Mock results
      const mockResults = files.map((file, index) => ({
        id: `result-${Date.now()}-${index}`,
        filename: file.name,
        licensePlate: `${Math.floor(Math.random() * 90) + 10}A-${Math.floor(Math.random() * 90000) + 10000}`,
        boundingBox: {
          x: Math.floor(Math.random() * 50) + 25,
          y: Math.floor(Math.random() * 50) + 25,
          width: Math.floor(Math.random() * 100) + 100,
          height: Math.floor(Math.random() * 50) + 30,
        },
        timestamp: new Date().toISOString(),
      }))

      setResults(mockResults)

      // Add to history
      mockResults.forEach((result) => {
        addToHistory({
          id: result.id,
          licensePlate: result.licensePlate,
          timestamp: result.timestamp,
          source: "upload",
          filename: result.filename,
        })
      })

      toast({
        title: "Tải lên thành công",
        description: `Đã nhận dạng ${files.length} file`,
      })
    } catch (error) {
      toast({
        title: "Lỗi khi tải lên",
        description: "Đã xảy ra lỗi khi tải lên file. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.mp4,.avi"
          multiple
          className="hidden"
        />
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Kéo thả hoặc nhấp để tải lên</h3>
        <p className="text-sm text-muted-foreground mt-1">Hỗ trợ JPG, PNG, JPEG, MP4, AVI</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0 relative">
                {files[index].type.startsWith("image/") ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video src={preview} controls className="w-full h-48 object-cover" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="p-3">
                  <div className="flex items-center">
                    {files[index].type.startsWith("image/") ? (
                      <FileImage className="h-4 w-4 mr-2" />
                    ) : (
                      <FileVideo className="h-4 w-4 mr-2" />
                    )}
                    <p className="text-sm truncate">{files[index].name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={uploadFiles} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Đang xử lý..." : "Tải lên và nhận dạng"}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-center text-sm text-muted-foreground">{progress}% hoàn thành</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold">Kết quả nhận dạng</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <RecognitionResult key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
