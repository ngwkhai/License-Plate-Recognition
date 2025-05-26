"use client"

import { useState, useRef } from "react"
import { Upload, X, FileImage, FileVideo, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { RecognitionResult } from "@/components/recognition-result"
import { useLocalStorage } from "@/hooks/use-local-storage"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/avi", "video/quicktime", "video/x-matroska"]

export function FileUploader() {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const [history, setHistory] = useLocalStorage("license-plate-history", [])

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type) || ALLOWED_VIDEO_TYPES.includes(file.type),
    )

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Định dạng file không hợp lệ",
        description: "Chỉ chấp nhận các định dạng JPG, PNG, JPEG, MP4, AVI, MOV, MKV",
        variant: "destructive",
      })
    }

    setFiles(validFiles)

    // Create previews
    const newPreviews = []
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
    })

    setPreviews(newPreviews)
    setResults([])
  }

  const removeFile = (index) => {
    const newFiles = [...files]
    const newPreviews = [...previews]

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index])

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const resetAll = () => {
    // Revoke all object URLs to avoid memory leaks
    previews.forEach((url) => URL.revokeObjectURL(url))

    setFiles([])
    setPreviews([])
    setResults([])
    setProgress(0)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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

    let interval // Declare interval here

    try {
      // Simulate progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData,
        headers: {
          // Không cần Content-Type khi dùng FormData
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      clearInterval(interval)
      setProgress(100)

      // Xử lý response từ backend AI
      const results = data.results.map((apiResult, index) => ({
        id: `result-${Date.now()}-${index}`,
        filename: files[index].name,
        licensePlates: apiResult.licensePlates, // Backend trả về danh sách biển số
        boundingBoxes: apiResult.boundingBoxes, // Backend trả về danh sách bounding box
        timestamp: new Date().toISOString(),
        imageUrl: apiResult.imageUrl || previews[index],
        fileType: files[index].type,
      }))

      setResults(results)

      // Lưu vào lịch sử
      results.forEach(result => {
        result.licensePlates.forEach((plate, plateIndex) => {
          const newHistoryItem = {
            id: `${result.id}-plate-${plateIndex}`,
            licensePlate: plate,
            timestamp: result.timestamp,
            source: "upload",
            filename: result.filename,
            imageUrl: result.imageUrl,
            fileType: result.fileType,
          }
          setHistory(prevHistory => [newHistoryItem, ...prevHistory])
        })
      })

      const totalPlates = results.reduce((sum, result) => sum + result.licensePlates.length, 0)
      toast({
        title: "Tải lên thành công",
        description: `Đã nhận dạng ${totalPlates} biển số từ ${files.length} file`,
      })
      
    } catch (error) {
      console.error("Error uploading files:", error)
      clearInterval(interval)
      toast({
        title: "Lỗi khi tải lên",
        description: `Đã xảy ra lỗi: ${error.message}. Vui lòng kiểm tra backend AI có đang chạy không.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.mp4,.avi,.mov,.mkv"
          multiple
          className="hidden"
        />
        <Upload className="h-16 w-16 text-muted-foreground mb-6" />
        <h3 className="text-xl font-medium mb-2">Kéo thả hoặc nhấp để tải lên</h3>
        <p className="text-sm text-muted-foreground">Hỗ trợ JPG, PNG, JPEG, MP4, AVI, MOV, MKV</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="relative w-full h-48">
                    <video
                      src={preview}
                      controls
                      className="w-full h-full object-cover"
                      controlsList="nodownload"
                      preload="metadata"
                    >
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="p-4">
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
        <div className="flex justify-center gap-4">
          <Button onClick={uploadFiles} disabled={isLoading} className="w-full md:w-auto px-8 py-2">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Tải lên và nhận dạng"
            )}
          </Button>
          <Button variant="outline" onClick={resetAll} disabled={isLoading} className="w-full md:w-auto px-8 py-2">
            Xóa tất cả
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">{progress}% hoàn thành</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kết quả nhận dạng</h2>
            <Button variant="outline" size="sm" onClick={resetAll}>
              <X className="h-4 w-4 mr-2" />
              Thoát
            </Button>
          </div>
          <div className="space-y-6">
            {results.map((result, index) => (
              <RecognitionResult key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
