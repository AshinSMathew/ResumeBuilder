"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Edit, Download, Share } from "lucide-react"
import ResumePreview from "@/components/resume/resume-preview"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function PreviewPage() {
  const router = useRouter()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleEdit = () => {
    router.push("/dashboard/details")
  }

  const handleDownload = async () => {
    if (!resumeRef.current) return

    try {
      setIsDownloading(true)
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const canvasRatio = canvas.height / canvas.width
      const pdfRatio = pdfHeight / pdfWidth
      
      let imgWidth = pdfWidth
      let imgHeight = pdfWidth * canvasRatio

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight
        imgWidth = pdfHeight / canvasRatio
      }
      pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth) / 2, (pdfHeight - imgHeight) / 2, imgWidth, imgHeight)
      pdf.save("resume.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resume Preview</h1>
            <p className="text-muted-foreground">Preview and download your resume</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin inline-block">↻</span>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
            <Button size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border p-0">
          <ResumePreview forwardedRef={resumeRef} />
        </Card>
      </div>
    </DashboardLayout>
  )
}