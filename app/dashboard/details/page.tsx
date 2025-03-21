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

export default function DetailsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal-info")

  const handleSaveAndPreview = () => {
    // In a real app, you would save the form data here
    router.push("/dashboard/preview")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Details</h1>
          <p className="text-muted-foreground">Fill in your information to create your resume</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resume Information</CardTitle>
            <CardDescription>Complete all sections to create a comprehensive resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="personal-info">Personal</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

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
          <Button variant="outline">Save Draft</Button>
          <Button onClick={handleSaveAndPreview}>Save & Preview</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

