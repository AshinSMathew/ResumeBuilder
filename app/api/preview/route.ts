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
  };
  skills?: {
    category: string;
    skills: string[];
  }[];
  experiences?: {
    company: string;
    position: string;
    location?: string;
    startYear: string;
    endYear?: string;
    description: string;
  }[];
  educations?: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear: string;
    endYear?: string;
  }[];
  projects?: {
    title: string;
    technologies: string;
    description: string;
    year: string;
  }[];
  certifications?: {
    title: string;
    issuer: string;
    year: string;
  }[];
  achievements?: {
    title: string;
    date: string;
    description: string;
  }[];
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userEmail = getEmailFromAuthToken(request);
  
  if (!userEmail) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    // Fetch user ID
    const userResult = await db('SELECT id, name, email, phone_number FROM users WHERE email = $1', [userEmail]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    // Fetch all data in parallel
    const [
      personalDetails,
      userDataResult,
      skillsResult
    ] = await Promise.all([
      db('SELECT * FROM personal_details WHERE user_id = $1', [userId]),
      db('SELECT * FROM user_data WHERE user_id = $1', [userId]),
      db('SELECT skill_name FROM skills WHERE user_id = $1', [userId])
    ]);

    // Process user data
    const userData = userDataResult[0] || {};
    const personalDetail = personalDetails[0] || {};

    // Process skills data
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

    // Process JSONB data from user_data
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

    // Structure the response
    const resumeData: ResumeData = {
      user: {
        name: personalDetail.full_name || userResult[0].name,
        email: personalDetail.email || userResult[0].email,
        phone: personalDetail.phone_number || userResult[0].phone_number,
        linkedin: personalDetail.linkedin_url,
        github: personalDetail.github_url,
        website: personalDetail.portfolio_url,
        summary: personalDetail.summary
      },
      skills: skills.length > 0 ? skills : undefined,
      experiences: experiences.length > 0 ? experiences : undefined,
      educations: educations.length > 0 ? educations : undefined,
      projects: projects.length > 0 ? projects : undefined,
      certifications: certifications.length > 0 ? certifications : undefined,
      achievements: achievements.length > 0 ? achievements : undefined
    };

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}