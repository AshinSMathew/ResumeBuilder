"use client"

import { useState, useEffect, forwardRef } from "react"

interface Education {
  id?: number
  institution: string
  degree: string
  fieldOfStudy?: string
  startDate: string
  endDate?: string
  description?: string
}

interface Experience {
  id?: number
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  current?: boolean
  description: string
}

interface Project {
  name: string
  technologies: string
  description: string
  startDate: string
  link?: string
}

interface Certification {
  name: string
  issuer: string
  date: string
  description?: string
  credentialId?: string
  credentialURL?: string
}

interface Achievement {
  title: string
  organization: string
  date: string
  description: string
}

interface ResumeData {
  user?: {
    name?: string
    email?: string
    phone?: string
    linkedin?: string
    github?: string
    website?: string
    summary?: string
  }
  skills?: {
    category: string
    skills: string[]
  }[]
  educations?: Education[]
  experiences?: Experience[]
  projects?: Project[]
  certifications?: Certification[]
  achievements?: Achievement[]
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
            throw new Error('Failed to fetch resume data')
          }
          const data = await response.json()
          setResumeData(data)
        } catch (error) {
          console.error("Error fetching resume:", error)
          setError(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
          setLoading(false)
        }
      }

      fetchResumeData()
    }, [])

    const resolvedRef = forwardedRef || ref

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

    return (
      <div ref={resolvedRef} className="bg-white p-6 shadow-md rounded-lg print:shadow-none font-['Georgia']">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <header className="border-b border-black pb-4 text-center">
            <h1 className="text-3xl font-bold text-black uppercase tracking-wide">
              {resumeData.user?.name || "Your Name"}
            </h1>

            <div className="mt-3 text-black">
              <p className="text-sm">
                {resumeData.user?.email && resumeData.user.email}
                {resumeData.user?.email && resumeData.user?.phone && " | "}
                {resumeData.user?.phone && resumeData.user.phone}
              </p>

              <p className="mt-1 text-sm">
                {resumeData.user?.linkedin && <span>{resumeData.user.linkedin}</span>}
                {resumeData.user?.linkedin && (resumeData.user?.github || resumeData.user?.website) && " | "}
                {resumeData.user?.github && <span>{resumeData.user.github}</span>}
                {resumeData.user?.github && resumeData.user?.website && " | "}
                {resumeData.user?.website && <span>{resumeData.user.website}</span>}
              </p>
            </div>
          </header>

          {/* Summary */}
          {resumeData.user?.summary && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Professional Summary
              </h2>
              <p className="text-black text-sm leading-relaxed">{resumeData.user.summary}</p>
            </section>
          )}

          {/* Skills */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Skills
              </h2>
              <div className="text-sm">
                {resumeData.skills.map((skillGroup, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-bold text-black">{skillGroup.category}: </span>
                    <span className="text-black">{skillGroup.skills.join(", ")}</span>
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
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
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
                        {edu.startDate} - {edu.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-sm">{edu.institution}</p>
                    {edu.fieldOfStudy && <p className="text-sm italic">{edu.fieldOfStudy}</p>}
                    {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
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
                      <h3 className="font-bold">{project.name}</h3>
                      <span className="text-sm">{project.startDate}</span>
                    </div>

                    <p className="text-sm">
                      <span className="font-bold">Technologies: </span>
                      {project.technologies}
                    </p>

                    {project.link && (
                      <p className="text-sm">
                        <span className="font-bold">Link: </span>
                        <a href={project.link} className="text-blue-600 hover:underline">
                          {project.link}
                        </a>
                      </p>
                    )}

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
                      <h3 className="font-bold">{cert.name}</h3>
                      <span className="text-sm">{cert.date}</span>
                    </div>
                    <p className="text-sm">{cert.issuer}</p>
                    {cert.description && <p className="text-sm mt-1">{cert.description}</p>}
                    {cert.credentialId && (
                      <p className="text-sm">
                        <span className="font-bold">Credential ID: </span>
                        {cert.credentialId}
                      </p>
                    )}
                    {cert.credentialURL && (
                      <p className="text-sm">
                        <span className="font-bold">URL: </span>
                        <a href={cert.credentialURL} className="text-blue-600 hover:underline">
                          {cert.credentialURL}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {resumeData.achievements && resumeData.achievements.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-black uppercase tracking-wide border-b border-black pb-1">
                Achievements
              </h2>
              <div className="space-y-2">
                {resumeData.achievements.map((ach, index) => (
                  <div key={index} className="text-black">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold">{ach.title}</h3>
                      <span className="text-sm">{ach.date}</span>
                    </div>
                    <p className="text-sm italic">{ach.organization}</p>
                    <p className="text-sm mt-1">{ach.description}</p>
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