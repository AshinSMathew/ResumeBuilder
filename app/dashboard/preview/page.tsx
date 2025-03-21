"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Edit, Download, Share } from "lucide-react"
import ResumePreview from "@/components/resume/resume-preview"
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function PreviewPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("preview")
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleEdit = () => {
    router.push("/dashboard/details")
  }

  const handleDownload = async () => {
    if (!resumeRef.current) return
    
    try {
      setIsDownloading(true)
      
      // Create a PNG from the resume element
      const dataUrl = await toPng(resumeRef.current, { 
        quality: 1,
        backgroundColor: 'white',
        style: {
          margin: '0',
          padding: '0'
        }
      })
      
      // Create PDF with proper dimensions
      const imgProps = await getImageProperties(dataUrl)
      const pdf = new jsPDF({
        orientation: imgProps.height > imgProps.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [imgProps.width, imgProps.height]
      })
      
      // Add the image to the PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height)
      
      // Save the PDF with the user's name or a default name
      pdf.save('resume.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Helper function to get image dimensions
  const getImageProperties = (dataUrl: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }
      img.src = dataUrl
    })
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
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