  "use client"

  import type React from "react"
  import { useState, useEffect, forwardRef, useCallback } from "react"
  import { Loader2 } from "lucide-react"

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
      location?: string
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

  const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ forwardedRef }, ref) => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchResumeData = useCallback(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/preview`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch resume data")
        }
        
        const apiData = await response.json()
        
        const transformedData: ResumeData = {
          user: apiData.user,
          skills: apiData.skills,
          educations: apiData.educations?.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startYear || edu.startDate,
            endDate: edu.endYear || edu.endDate,
            description: edu.description || ""
          })) || [],
          experiences: apiData.experiences?.map((exp: any) => ({
            company: exp.company,
            position: exp.position,
            location: exp.location,
            startDate: exp.startYear || exp.startDate,
            endDate: exp.endYear || exp.endDate,
            current: exp.current || false,
            description: exp.description || ""
          })) || [],
          projects: apiData.projects?.map((proj: any) => ({
            name: proj.title || proj.name,
            technologies: proj.technologies,
            description: proj.description || "",
            startDate: proj.year || proj.startDate,
            link: proj.link
          })) || [],
          certifications: apiData.certifications?.map((cert: any) => ({
            name: cert.title || cert.name,
            issuer: cert.issuer,
            date: cert.year || cert.date,
            description: cert.description
          })) || [],
          achievements: apiData.achievements?.map((ach: any) => ({
            title: ach.title,
            organization: ach.organization || "",
            date: ach.date,
            description: ach.description || ""
          })) || []
        }
        
        setResumeData(transformedData)
        setError(null)
      } catch (error) {
        console.error("Error fetching resume:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }, [])

    useEffect(() => {
      fetchResumeData()
    }, [fetchResumeData])

    const resolvedRef = forwardedRef || ref

    const formatBulletPoints = (description: string) => {
      return description
        .split("\n")
        .filter((line) => line.trim())
        .map((line, i) => (
          <li key={i} className="mb-1 text-[12pt]" style={{ lineHeight: "1.4" }}>
            {line.trim()}
          </li>
        ))
    }

    if (loading && !resumeData) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <p className="text-black">Loading resume data...</p>
          </div>
        </div>
      )
    }

    if (error && !resumeData) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )
    }

    if (!resumeData) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-black">No resume data found. Please create your resume.</p>
        </div>
      )
    }

    return (
      <div className="flex justify-center">
        <div
          ref={resolvedRef}
          className="mx-auto bg-white font-['Calibri'] text-gray-900 shadow-md"
          style={{
          //   width: "210mm",
          //   minHeight: "297mm", 
            padding: "10mm",
            boxSizing: "border-box",
            position: "relative",
            lineHeight: "1",
            pageBreakAfter: "always",
            // pageBreakInside: "avoid",
          }}
        >
          {/* Header - Name */}
          <h1
            className="mb-2 text-center font-bold"
            style={{
              fontSize: "24pt",
              color: "#2c3e50",
            }}
          >
            {resumeData.user?.name || "John Doe"}
          </h1>

          {/* Contact Information Line */}
          <div
            className="mb-4 text-center"
            style={{
              fontSize: "11pt",
              color: "#4a5568",
            }}
          >
            {resumeData.user?.location && <span>{resumeData.user.location} | </span>}
            {resumeData.user?.email && <span>{resumeData.user.email} | </span>}
            {resumeData.user?.phone && <span>{resumeData.user.phone}</span>}
            {resumeData.user?.phone && resumeData.user?.website && <span> | </span>}
            {resumeData.user?.website && (
              <span>
                <a href={resumeData.user.website} className="text-blue-800 hover:underline">
                  {resumeData.user.website}
                </a>
              </span>
            )}
          </div>

          {/* LinkedIn and GitHub */}
          {(resumeData.user?.linkedin || resumeData.user?.github) && (
            <div
              className="mb-6 text-center"
              style={{
                fontSize: "11pt",
                color: "#4a5568",
              }}
            >
              {resumeData.user?.linkedin && (
                <span>
                  <a href={resumeData.user.linkedin} className="text-blue-800 hover:underline">
                    linkedin.com/in/{resumeData.user.linkedin.split("/").pop()}
                  </a>
                  {resumeData.user?.github && " | "}
                </span>
              )}
              {resumeData.user?.github && (
                <span>
                  <a href={resumeData.user.github} className="text-blue-800 hover:underline">
                    github.com/{resumeData.user.github.split("/").pop()}
                  </a>
                </span>
              )}
            </div>
          )}

          {/* Summary */}
          {resumeData.user?.summary && (
            <section className="mb-5">
              <h2
                className="mb-2 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                PROFESSIONAL SUMMARY
              </h2>
              <p
                className="mb-2"
                style={{
                  fontSize: "12pt",
                  lineHeight: "1.4",
                  color: "#4a5568",
                }}
              >
                {resumeData.user.summary}
              </p>
            </section>
          )}

          {/* Experience Section */}
          {resumeData.experiences && resumeData.experiences.length > 0 && (
            <section className="mb-5">
              <h2
                className="mb-3 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                EXPERIENCE
              </h2>
              {resumeData.experiences.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: "13pt",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {exp.position}
                      </span>
                      {exp.company && <span style={{ fontSize: "11pt", color: "#4a5568" }}>, {exp.company}</span>}
                      {exp.location && (
                        <span style={{ fontSize: "11pt", color: "#4a5568" }}>
                          {" – "}
                          {exp.location}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "11pt",
                        color: "#718096",
                        fontWeight: "normal",
                      }}
                    >
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <ul className="mt-2 list-disc pl-5" style={{ color: "#4a5568" }}>
                      {formatBulletPoints(exp.description)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education Section */}
          {resumeData.educations && resumeData.educations.length > 0 && (
            <section className="mb-6">
              <h2
                className="mb-3 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                EDUCATION
              </h2>
              {resumeData.educations.map((edu, index) => (
                <div key={index} className="mb-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: "13pt",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {edu.institution}
                      </span>
                      {edu.degree && (
                        <span style={{ fontSize: "11pt", color: "#4a5568" }}>
                          {", "}
                          {edu.degree}
                        </span>
                      )}
                      {edu.fieldOfStudy && (
                        <span style={{ fontSize: "11pt", color: "#4a5568" }}>
                          {" in "}
                          {edu.fieldOfStudy}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "11pt",
                        color: "#718096",
                        fontWeight: "normal",
                      }}
                    >
                      {edu.startDate} – {edu.endDate || "Present"}
                    </span>
                  </div>
                  {edu.description && (
                    <ul className="mt-2 list-disc pl-5" style={{ color: "#4a5568" }}>
                      {formatBulletPoints(edu.description)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects Section */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <section className="mb-6">
              <h2
                className="mb-2 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                PROJECTS
              </h2>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: "13pt",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {project.name}
                      </span>
                    </div>
                    {project.link && (
                      <span style={{ fontSize: "11pt" }}>
                        <a href={project.link} className="text-blue-800 hover:underline">
                          {project.link}
                        </a>
                      </span>
                    )}
                  </div>
                  <ul className="mt-2 list-disc pl-5" style={{ color: "#4a5568" }}>
                    {formatBulletPoints(project.description)}
                  </ul>
                  {project.technologies && (
                    <p
                      className="mb-1 pl-5"
                      style={{
                        fontSize: "12pt",
                        color: "#4a5568",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>Tools Used: </span>
                      {project.technologies}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Achievement Section */}
          {resumeData.achievements && resumeData.achievements.length > 0 && (
            <section className="mb-5">
              <h2
                className="mb-2 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                ACHIEVEMENTS
              </h2>
              {resumeData.achievements.map((ach, index) => (
                <div key={index} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: "12pt",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {ach.title}
                      </span>
                      <span style={{ fontSize: "11pt", color: "#4a5568" }}>
                        {", "}
                        {ach.organization}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "10pt",
                        color: "#718096",
                        fontWeight: "normal",
                      }}
                    >
                      {ach.date}
                    </span>
                  </div>
                  {ach.description && (
                    <p
                      className="mb-1 pl-5"
                      style={{
                        fontSize: "11pt",
                        color: "#4a5568",
                      }}
                    >
                      {ach.description}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Technologies/Skills Section */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <section className="mb-5">
              <h2
                className="mb-2 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                SKILLS
              </h2>
              <div className="pl-1">
                {resumeData.skills.map((skillGroup, index) => (
                  <div
                    key={index}
                    className="mb-2"
                    style={{
                      fontSize: "11pt",
                      color: "#4a5568",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#2c3e50" }}>{skillGroup.category}:</span>
                    <span className="ml-1">
                      {Array.isArray(skillGroup.skills) ? skillGroup.skills.join(", ") : skillGroup.skills}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications Section */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <section className="mb-5">
              <h2
                className="mb-2 border-b border-gray-300 pb-1"
                style={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                CERTIFICATIONS
              </h2>
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <span
                      style={{
                        fontSize: "12pt",
                        fontWeight: "bold",
                        color: "#2c3e50",
                      }}
                    >
                      {cert.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10pt",
                        color: "#718096",
                        fontWeight: "normal",
                      }}
                    >
                      {cert.date}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "11pt",
                      color: "#4a5568",
                    }}
                  >
                    {cert.issuer}
                  </p>
                  {cert.description && (
                    <p
                      className="mb-1 pl-5"
                      style={{
                        fontSize: "11pt",
                        color: "#4a5568",
                      }}
                    >
                      {cert.description}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  })

  ResumePreview.displayName = "ResumePreview"

  export default ResumePreview