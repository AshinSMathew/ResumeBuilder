import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils";

interface ResumeData {
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary?: string;
    location?: string;
  };
  skills?: {
    category: string;
    skills: string[];
  }[];
  educations?: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  experiences?: {
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }[];
  projects?: {
    name: string;
    technologies: string;
    description: string;
    startDate: string;
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }[];
  achievements?: {
    title: string;
    organization: string;
    date: string;
    description: string;
  }[];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable cache completely

export async function GET(request: NextRequest) {
  const userEmail = getEmailFromAuthToken(request);
  
  if (!userEmail) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    const userResult = await db('SELECT id, name, email, phone_number FROM users WHERE email = $1', [userEmail]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    const [
      personalDetails,
      userDataResult,
      skillsResult
    ] = await Promise.all([
      db('SELECT * FROM personal_details WHERE user_id = $1', [userId]),
      db('SELECT * FROM user_data WHERE user_id = $1', [userId]),
      db('SELECT skill_name FROM skills WHERE user_id = $1', [userId])
    ]);

    const userData = userDataResult[0] || {};
    const personalDetail = personalDetails[0] || {};
    const skills = skillsResult.flatMap(row => {
      try {
        const skillData = row.skill_name;
        if (!skillData) return [];
        
        return Object.entries(skillData).map(([category, skills]) => ({
          category,
          skills: Array.isArray(skills) ? skills : [skills]
        }));
      } catch (error) {
        console.error('Error processing skill:', error);
        return [];
      }
    });

    const parseJsonbField = (field: any) => {
      try {
        return field ? field : [];
      } catch (error) {
        console.error('Error parsing JSONB field:', error);
        return [];
      }
    };

    const experiences = parseJsonbField(userData.experience);
    const educations = parseJsonbField(userData.education);
    const projects = parseJsonbField(userData.projects);
    const certifications = parseJsonbField(userData.certifications);
    const achievements = parseJsonbField(userData.achievements);

    // Transform the data to match the expected structure in the ResumePreview component
    const resumeData: ResumeData = {
      user: {
        name: personalDetail.full_name || userResult[0].name,
        email: personalDetail.email || userResult[0].email,
        phone: personalDetail.phone_number || userResult[0].phone_number,
        linkedin: personalDetail.linkedin_url,
        github: personalDetail.github_url,
        website: personalDetail.portfolio_url,
        summary: personalDetail.summary,
        location: personalDetail.location
      },
      skills: skills.length > 0 ? skills : undefined,
      // Map API data to expected format in the component
      experiences: experiences.length > 0 ? experiences.map((exp: any) => ({
        company: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: exp.startYear || exp.startDate,
        endDate: exp.endYear || exp.endDate,
        current: exp.current || false,
        description: exp.description || ""
      })) : undefined,
      educations: educations.length > 0 ? educations.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startYear || edu.startDate,
        endDate: edu.endYear || edu.endDate,
        description: edu.description || ""
      })) : undefined,
      projects: projects.length > 0 ? projects.map((proj: any) => ({
        name: proj.title || proj.name,
        technologies: proj.technologies,
        description: proj.description || "",
        startDate: proj.year || proj.startDate,
        link: proj.link
      })) : undefined,
      certifications: certifications.length > 0 ? certifications.map((cert: any) => ({
        name: cert.title || cert.name,
        issuer: cert.issuer,
        date: cert.year || cert.date,
        description: cert.description
      })) : undefined,
      achievements: achievements.length > 0 ? achievements.map((ach: any) => ({
        title: ach.title,
        organization: ach.organization || "",
        date: ach.date,
        description: ach.description || ""
      })) : undefined
    };

    // Set cache control headers to prevent browser caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(resumeData, {
      headers: headers
    });
  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}