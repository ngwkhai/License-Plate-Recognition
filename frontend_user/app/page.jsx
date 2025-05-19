"use client"

import { useState } from "react"
import { MainAppLayout } from "@/components/main-app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { CameraViewer } from "@/components/camera-viewer"
import { LicenseSearch } from "@/components/license-search"
import { HistoryView } from "@/components/history-view"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"

export default function HomePage() {
  const [showHistory, setShowHistory] = useState(false)

  if (showHistory) {
    return (
      <MainAppLayout>
        <div className="container mx-auto px-4 py-8">
          <HistoryView onClose={() => setShowHistory(false)} />
        </div>
      </MainAppLayout>
    )
  }

  return (
    <MainAppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nhận dạng Biển số xe</h1>
          <Button variant="outline" className="gap-2" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" />
            Lịch sử tra cứu
          </Button>
        </div>

        <Tabs defaultValue="upload" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Tải lên ảnh/video</TabsTrigger>
            <TabsTrigger value="camera">Camera thời gian thực</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <FileUploader />
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <CameraViewer />
          </TabsContent>
        </Tabs>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Tra cứu thủ công</h2>
          <LicenseSearch />
        </div>
      </div>
    </MainAppLayout>
  )
}
