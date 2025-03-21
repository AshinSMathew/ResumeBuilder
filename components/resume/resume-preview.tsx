"use client"

import { useState, useEffect, forwardRef } from "react"

interface User {
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  github?: string
  website?: string
  summary?: string
}

interface Skill {
  category: string
  skills: string
}

interface Experience {
  company: string
  position: string
  location: string
  start_year: string
  end_year?: string
  description: string
}

interface Education {
  institution: string
  degree: string
  field_of_study?: string
  start_year: string
  end_year?: string
}

interface Project {
  title: string
  technologies: string
  description: string
  year: string
}

interface Certification {
  title: string
  issuer: string
  year: string
}

interface ResumeData {
  user?: User
  skills?: Skill[]
  experiences?: Experience[]
  educations?: Education[]
  projects?: Project[]
  certifications?: Certification[]
}

interface ResumePreviewProps {
  forwardedRef?: React.RefObject<HTMLDivElement>
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ forwardedRef }, ref) => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const fetchResumeData = async () => {
        try {
          const response = await fetch("/api/preview")
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to fetch resume data")
          }
          const data = await response.json()
          setResumeData(data)
          setLoading(false)
        } catch (error) {
          console.error("Error fetching resume:", error)
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          setError(errorMessage)
          setLoading(false)
        }
      }

      fetchResumeData()
    }, [])

    if (loading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
            <p className="text-black">Loading resume data...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )
    }

    if (!resumeData) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p className="text-black">No resume data found. Please create your resume.</p>
        </div>
      )
    }

    const userData = resumeData.user || {}

    // Process skills data
    const groupedSkills: Record<string, string[]> = {}

    if (resumeData.skills && resumeData.skills.length > 0) {
      resumeData.skills.forEach((item) => {
        if (!groupedSkills[item.category]) {
          groupedSkills[item.category] = []
        }
        groupedSkills[item.category].push(item.skills)
      })
    }

    // Use the forwarded ref from parent or the one from forwardRef
    const resolvedRef = forwardedRef || ref

    return (
      <div ref={resolvedRef} className="bg-white p-6 shadow-md rounded-lg print:shadow-none font-['Georgia']">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <header className="border-b border-black pb-4 text-center">
            <h1 className="text-3xl font-bold text-black uppercase tracking-wide">{userData.name || "John Doe"}</h1>

            <div className="mt-3 text-black">
              <p className="text-sm">
                {userData.email && userData.email}
                {userData.email && userData.phone && " | "}
                {userData.phone && userData.phone}
              </p>

              <p className="mt-1 text-sm">
                {userData.linkedin && <span>{userData.linkedin}</span>}
                {userData.linkedin && (userData.github || userData.website) && " | "}
                {userData.github && <span>{userData.github}</span>}
                {userData.github && userData.website && " | "}
                {userData.website && <span>{userData.website}</span>}
              </p>
            </div>
          </header>

          {/* Summary */}
          {userData.summary && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Professional Summary
              </h2>
              <p className="text-black text-sm leading-relaxed">{userData.summary}</p>
            </section>
          )}

          {/* Skills */}
          {Object.keys(groupedSkills).length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Skills
              </h2>
              <div className="text-sm">
                {Object.entries(groupedSkills).map(([category, skills], index) => (
                  <div key={category} className="mb-2">
                    <span className="font-bold text-black">{category}: </span>
                    <span className="text-black">{skills.join(", ")}</span>
                    {index < Object.entries(groupedSkills).length - 1 && <br />}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {resumeData.experiences && resumeData.experiences.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experiences.map((exp, index) => (
                  <div key={index} className="text-black">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{exp.position}</h3>
                      <span className="text-sm">
                        {exp.start_year} - {exp.end_year || "Present"}
                      </span>
                    </div>

                    <div className="text-sm italic">
                      {exp.company}
                      {exp.location ? `, ${exp.location}` : ""}
                    </div>

                    <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
                      {(exp.description || "")
                        .split("\n")
                        .filter((bullet) => bullet.trim())
                        .map((bullet, i) => (
                          <li key={i}>{bullet.trim()}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resumeData.educations && resumeData.educations.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Education
              </h2>
              <div className="space-y-3">
                {resumeData.educations.map((edu, index) => (
                  <div key={index} className="text-black">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{edu.degree}</h3>
                      <span className="text-sm">
                        {edu.start_year} - {edu.end_year || "Present"}
                      </span>
                    </div>
                    <p className="text-sm">{edu.institution}</p>
                    {edu.field_of_study && <p className="text-sm italic">{edu.field_of_study}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Projects
              </h2>
              <div className="space-y-3">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="text-black">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{project.title}</h3>
                      <span className="text-sm">{project.year}</span>
                    </div>

                    <p className="text-sm">
                      <span className="font-bold">Technologies: </span>
                      {project.technologies}
                    </p>

                    <p className="mt-1 text-sm">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Certifications
              </h2>
              <div className="space-y-2">
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className="text-black">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{cert.title}</h3>
                      <span className="text-sm">{cert.year}</span>
                    </div>
                    <p className="text-sm">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    )
  }
)

ResumePreview.displayName = "ResumePreview"

export default ResumePreview