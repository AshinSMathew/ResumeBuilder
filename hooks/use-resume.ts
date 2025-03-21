"use client"

import { useState } from "react"

interface ResumeData {
  id?: number
  title: string
  fullName: string
  email: string
  phoneNumber: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
  summary: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skillCategories: SkillCategory[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  achievements: AchievementEntry[]
}

interface EducationEntry {
  id?: number
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  description: string
}

interface ExperienceEntry {
  id?: number
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface SkillCategory {
  id?: number
  name: string
  skills: Skill[]
}

interface Skill {
  id?: number
  name: string
}

interface ProjectEntry {
  id?: number
  name: string
  link: string
  startDate: string
  endDate: string
  description: string
  technologies: string
}

interface CertificationEntry {
  id?: number
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
  description: string
}

interface AchievementEntry {
  id?: number
  title: string
  organization: string
  date: string
  description: string
}

export function useResume() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a new resume
  const createResume = async (resumeData: Partial<ResumeData>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create resume")
      }

      return data.resume
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create resume")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get a resume by ID with all its data
  const getResume = async (resumeId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch resume")
      }

      return data.resume
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch resume")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update a resume
  const updateResume = async (resumeId: string, resumeData: Partial<ResumeData>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update resume")
      }

      return data.resume
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update resume")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Add an education entry
  const addEducation = async (resumeId: string, educationData: Omit<EducationEntry, "id">) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}/education`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(educationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add education")
      }

      return data.education
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add education")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Add an experience entry
  const addExperience = async (resumeId: string, experienceData: Omit<ExperienceEntry, "id">) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}/experience`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experienceData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add experience")
      }

      return data.experience
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add experience")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Add a skill category with skills
  const addSkillCategory = async (resumeId: string, categoryData: { name: string; skills: string[] }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add skill category")
      }

      return data.category
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add skill category")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Add a project
  const addProject = async (resumeId: string, projectData: Omit<ProjectEntry, "id">) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${resumeId}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add project")
      }

      return data.project
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add project")
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createResume,
    getResume,
    updateResume,
    addEducation,
    addExperience,
    addSkillCategory,
    addProject,
  }
}

