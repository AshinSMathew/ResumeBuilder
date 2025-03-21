"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import sql from "@/lib/db"

// Personal Info
export async function updatePersonalInfo(resumeId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Update the resume
    await sql`
      UPDATE resumes 
      SET 
        full_name = ${data.fullName}, 
        email = ${data.email}, 
        phone_number = ${data.phoneNumber}, 
        linkedin_url = ${data.linkedIn}, 
        github_url = ${data.github}, 
        portfolio_url = ${data.portfolio}, 
        summary = ${data.summary},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(resumeId)}
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error updating personal info:", error)
    return { error: "Failed to update personal information" }
  }
}

// Education
export async function addEducation(resumeId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Create new education entry
    await sql`
      INSERT INTO education 
      (resume_id, institution, degree, field_of_study, start_date, end_date, description) 
      VALUES (
        ${Number.parseInt(resumeId)}, 
        ${data.institution}, 
        ${data.degree}, 
        ${data.fieldOfStudy}, 
        ${data.startDate ? new Date(data.startDate) : null}, 
        ${data.endDate ? new Date(data.endDate) : null}, 
        ${data.description}
      )
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error adding education:", error)
    return { error: "Failed to add education" }
  }
}

export async function updateEducation(educationId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Find the education entry
    const educationEntries = await sql`
      SELECT e.id, r.user_id 
      FROM education e 
      JOIN resumes r ON e.resume_id = r.id 
      WHERE e.id = ${Number.parseInt(educationId)}
    `

    if (educationEntries.length === 0 || educationEntries[0].user_id !== user.id) {
      throw new Error("Unauthorized")
    }

    // Update education entry
    await sql`
      UPDATE education 
      SET 
        institution = ${data.institution}, 
        degree = ${data.degree}, 
        field_of_study = ${data.fieldOfStudy}, 
        start_date = ${data.startDate ? new Date(data.startDate) : null}, 
        end_date = ${data.endDate ? new Date(data.endDate) : null}, 
        description = ${data.description},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(educationId)}
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error updating education:", error)
    return { error: "Failed to update education" }
  }
}

export async function deleteEducation(educationId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Find the education entry
    const educationEntries = await sql`
      SELECT e.id, r.user_id 
      FROM education e 
      JOIN resumes r ON e.resume_id = r.id 
      WHERE e.id = ${Number.parseInt(educationId)}
    `

    if (educationEntries.length === 0 || educationEntries[0].user_id !== user.id) {
      throw new Error("Unauthorized")
    }

    // Delete education entry
    await sql`
      DELETE FROM education 
      WHERE id = ${Number.parseInt(educationId)}
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting education:", error)
    return { error: "Failed to delete education" }
  }
}

// Experience
export async function addExperience(resumeId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Create new experience entry
    await sql`
      INSERT INTO experience 
      (resume_id, company, position, location, start_date, end_date, is_current, description) 
      VALUES (
        ${Number.parseInt(resumeId)}, 
        ${data.company}, 
        ${data.position}, 
        ${data.location}, 
        ${data.startDate ? new Date(data.startDate) : null}, 
        ${data.endDate ? new Date(data.endDate) : null}, 
        ${data.current || false}, 
        ${data.description}
      )
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error adding experience:", error)
    return { error: "Failed to add experience" }
  }
}

// Skills
export async function addSkillCategory(resumeId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Create new skill category
    const categories = await sql`
      INSERT INTO skill_categories 
      (resume_id, name) 
      VALUES (${Number.parseInt(resumeId)}, ${data.name}) 
      RETURNING id
    `

    const categoryId = categories[0].id

    // Add skills if provided
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      for (const skill of data.skills) {
        await sql`
          INSERT INTO skills (category_id, name) 
          VALUES (${categoryId}, ${skill})
        `
      }
    }

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error adding skill category:", error)
    return { error: "Failed to add skill category" }
  }
}

// Projects
export async function addProject(resumeId: string, data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Create new project
    await sql`
      INSERT INTO projects 
      (resume_id, name, link, start_date, end_date, description, technologies) 
      VALUES (
        ${Number.parseInt(resumeId)}, 
        ${data.name}, 
        ${data.link}, 
        ${data.startDate ? new Date(data.startDate) : null}, 
        ${data.endDate ? new Date(data.endDate) : null}, 
        ${data.description}, 
        ${data.technologies}
      )
    `

    revalidatePath(`/dashboard/details`)
    return { success: true }
  } catch (error) {
    console.error("Error adding project:", error)
    return { error: "Failed to add project" }
  }
}

export async function createNewResume(title: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const newResumes = await sql`
      INSERT INTO resumes (title, user_id) 
      VALUES (${title || "Untitled Resume"}, ${user.id}) 
      RETURNING id
    `

    revalidatePath(`/dashboard`)
    redirect(`/dashboard/details?resumeId=${newResumes[0].id}`)
  } catch (error) {
    console.error("Error creating resume:", error)
    return { error: "Failed to create resume" }
  }
}

export async function deleteResume(resumeId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if the resume belongs to the user
    const resumes = await sql`
      SELECT id FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Unauthorized")
    }

    // Delete the resume
    await sql`
      DELETE FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)}
    `

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return { error: "Failed to delete resume" }
  }
}

export async function getResume(resumeId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the resume
    const resumes = await sql`
      SELECT * FROM resumes 
      WHERE id = ${Number.parseInt(resumeId)} AND user_id = ${user.id}
    `

    if (resumes.length === 0) {
      throw new Error("Resume not found")
    }

    const resume = resumes[0]

    // Get education entries
    const education = await sql`
      SELECT * FROM education 
      WHERE resume_id = ${Number.parseInt(resumeId)} 
      ORDER BY start_date DESC NULLS LAST
    `

    // Get experience entries
    const experience = await sql`
      SELECT * FROM experience 
      WHERE resume_id = ${Number.parseInt(resumeId)} 
      ORDER BY start_date DESC NULLS LAST
    `

    // Get skill categories
    const categories = await sql`
      SELECT * FROM skill_categories 
      WHERE resume_id = ${Number.parseInt(resumeId)}
    `

    // Get skills for each category
    const skillCategories = await Promise.all(
      categories.map(async (category) => {
        const skills = await sql`
          SELECT * FROM skills 
          WHERE category_id = ${category.id}
        `

        return {
          ...category,
          skills,
        }
      }),
    )

    // Get projects
    const projects = await sql`
      SELECT * FROM projects 
      WHERE resume_id = ${Number.parseInt(resumeId)} 
      ORDER BY start_date DESC NULLS LAST
    `

    // Get certifications
    const certifications = await sql`
      SELECT * FROM certifications 
      WHERE resume_id = ${Number.parseInt(resumeId)} 
      ORDER BY issue_date DESC NULLS LAST
    `

    // Get achievements
    const achievements = await sql`
      SELECT * FROM achievements 
      WHERE resume_id = ${Number.parseInt(resumeId)} 
      ORDER BY date DESC NULLS LAST
    `

    // Combine all data
    return {
      ...resume,
      education,
      experience,
      skillCategories,
      projects,
      certifications,
      achievements,
    }
  } catch (error) {
    console.error("Error fetching resume:", error)
    return null
  }
}

export async function getUserResumes() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const resumes = await sql`
      SELECT * FROM resumes 
      WHERE user_id = ${user.id} 
      ORDER BY updated_at DESC
    `

    return resumes
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return []
  }
}

