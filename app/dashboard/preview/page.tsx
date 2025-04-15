"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Edit, Download, Share, Loader2 } from "lucide-react"
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

      // Get the resume container
      const resumeContainer = resumeRef.current

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Get dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calculate the number of pages needed
      const containerHeight = resumeContainer.scrollHeight
      const containerWidth = resumeContainer.scrollWidth
      const scale = pdfWidth / containerWidth
      const scaledHeight = containerHeight * scale
      const totalPages = Math.ceil(scaledHeight / pdfHeight)

      // Create canvas for each page
      for (let i = 0; i < totalPages; i++) {
        // Only add a new page if it's not the first page
        if (i > 0) {
          pdf.addPage()
        }

        // Calculate the portion of the container to capture for this page
        const yPosition = (pdfHeight / scale) * i

        // Create a clone of the container to manipulate for this page
        const tempContainer = resumeContainer.cloneNode(true) as HTMLElement
        tempContainer.style.transform = `translateY(-${yPosition}px)`
        tempContainer.style.height = `${pdfHeight / scale}px`
        tempContainer.style.overflow = "hidden"

        // Temporarily append to the document to capture
        document.body.appendChild(tempContainer)

        // Capture this portion as canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          windowHeight: pdfHeight / scale,
          y: yPosition,
        })

        // Remove the temporary element
        document.body.removeChild(tempContainer)

        // Add the image to the PDF
        const imgData = canvas.toDataURL("image/png")
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      }

      // Save the PDF
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
