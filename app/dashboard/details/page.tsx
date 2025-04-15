"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import PersonalInfoForm from "@/components/resume/personal-info-form"
import EducationForm from "@/components/resume/education-form"
import SkillsForm from "@/components/resume/skills-form"
import ExperienceForm from "@/components/resume/experience-form"
import ProjectsForm from "@/components/resume/projects-form"
import CertificationsForm from "@/components/resume/certifications-form"
import AchievementsForm from "@/components/resume/achievements-form"
import { Toaster } from "@/components/ui/toaster"

export default function DetailsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal-info")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAndPreview = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      router.push("/dashboard/preview")
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Details</h1>
          <p className="text-muted-foreground">Fill in your information to create your resume</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Resume Information</CardTitle>
            <CardDescription>Complete all sections to create a comprehensive resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <TabsList className="flex w-full min-w-max">
                  <TabsTrigger value="personal-info" className="flex-1">
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">
                    Education
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex-1">
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="flex-1">
                    Experience
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex-1">
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="certifications" className="flex-1">
                    Certifications
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="flex-1">
                    Achievements
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="personal-info" className="space-y-4">
                <PersonalInfoForm />
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <EducationForm />
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <SkillsForm />
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <ExperienceForm />
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <ProjectsForm />
              </TabsContent>

              <TabsContent value="certifications" className="space-y-4">
                <CertificationsForm />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <AchievementsForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button onClick={handleSaveAndPreview} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-white"></span>
                Showing Preview...
              </>
            ) : (
              "Show Preview"
            )}
          </Button>
        </div>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
