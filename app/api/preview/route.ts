import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils";

// Define TypeScript interfaces
interface SkillsMap {
  [category: string]: string[];
}

interface ResumeData {
  user: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    summary: string;
  };
  skills: SkillsMap;
  experiences: Array<{
    company: string;
    position: string;
    location: string;
    start_year: string | number;
    end_year: string | number | null;
    description: string;
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_year: string | number;
    end_year: string | number | null;
  }>;
  projects: Array<{
    title: string;
    technologies: string;
    description: string;
    year: string | number;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    year: string | number;
  }>;
}

export async function GET(request: NextRequest) {
    const user_email = getEmailFromAuthToken(request);
    console.log("User email:", user_email);

    if (!user_email) {
        return NextResponse.json(
            { message: 'Unauthorized. Email not found.' },
            { status: 401 }
        );
    }

    try {
        // Fetch user ID
        const userResult = await db('SELECT id FROM users WHERE email = $1', [user_email]);
        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                { message: 'User not found with this email.' },
                { status: 404 }
            );
        }

        const userId = userResult[0].id;
        console.log("User ID:", userId);

        // Fetch user resume details
        const resumeResult = await db(
            `SELECT full_name, email, phone_number, linkedin_url, github_url, portfolio_url, summary 
            FROM resumes WHERE user_id = $1`,
            [userId]
        );

        if (!resumeResult || resumeResult.length === 0) {
            return NextResponse.json({ message: 'Resume not found' }, { status: 404 });
        }

        const resume = resumeResult[0];

        // Fetch skills - Modified to handle JSON structure
        const skillsResult = await db(
            `SELECT skill_name 
            FROM skills WHERE user_id = $1`,
            [userId]
        );

        // Process skills to handle JSON structure
        const processedSkills: SkillsMap = {}; // Explicitly typed
        skillsResult.forEach(row => {
            try {
                // If skill_name is stored as a JSON string in the database
                const skillData = typeof row.skill_name === 'string' 
                    ? JSON.parse(row.skill_name) 
                    : row.skill_name;
                
                // Merge into processedSkills object
                Object.entries(skillData).forEach(([category, skills]) => {
                    if (!processedSkills[category]) {
                        processedSkills[category] = [];
                    }
                    
                    // Handle if skills is an array or a single item
                    if (Array.isArray(skills)) {
                        processedSkills[category] = [...processedSkills[category], ...skills as string[]];
                    } else {
                        processedSkills[category].push(skills as string);
                    }
                });
            } catch (error) {
                console.error('Error processing skill:', row.skill_name, error);
                // For non-JSON skills, add to "Other" category
                if (!processedSkills["Other"]) {
                    processedSkills["Other"] = [];
                }
                processedSkills["Other"].push(row.skill_name);
            }
        });

        // Fetch experience
        const experienceResult = await db(
            `SELECT company, position, location AS exp_location, start_year AS exp_start, 
            end_year AS exp_end, description AS exp_desc 
            FROM experience WHERE user_id = $1`,
            [userId]
        );

        // Fetch education
        const educationResult = await db(
            `SELECT institution, degree, field_of_study, start_year AS edu_start, end_year AS edu_end 
            FROM education WHERE user_id = $1`,
            [userId]
        );

        // Fetch projects
        const projectsResult = await db(
            `SELECT name AS project_title, technologies, description AS project_desc, start_year AS project_year 
            FROM projects WHERE user_id = $1`,
            [userId]
        );

        // Fetch certifications
        const certificationsResult = await db(
            `SELECT name AS cert_title, issuer, issue_year AS cert_year 
            FROM certifications WHERE user_id = $1`,
            [userId]
        );

        // Structure the response
        const resumeData: ResumeData = {
            user: {
                name: resume.full_name,
                email: resume.email,
                phone: resume.phone_number,
                linkedin: resume.linkedin_url,
                github: resume.github_url,
                website: resume.portfolio_url,
                summary: resume.summary,
            },
            skills: processedSkills, // Now properly structured
            experiences: experienceResult.map(row => ({
                company: row.company,
                position: row.position,
                location: row.exp_location,
                start_year: row.exp_start,
                end_year: row.exp_end,
                description: row.exp_desc,
            })),
            educations: educationResult.map(row => ({
                institution: row.institution,
                degree: row.degree,
                field_of_study: row.field_of_study,
                start_year: row.edu_start,
                end_year: row.edu_end,
            })),
            projects: projectsResult.map(row => ({
                title: row.project_title,
                technologies: row.technologies,
                description: row.project_desc,
                year: row.project_year,
            })),
            certifications: certificationsResult.map(row => ({
                title: row.cert_title,
                issuer: row.issuer,
                year: row.cert_year,
            })),
        };

        console.log("Resume data:", resumeData); // Debugging
        return NextResponse.json(resumeData);
    } catch (error) {
        console.error('Error fetching resume data:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}