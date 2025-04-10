import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEmailFromAuthToken } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    // Fetch the user ID
    const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    // Get skills for the user
    const skillsResult = await db(
      'SELECT skill_name FROM skills WHERE user_id = $1',
      [userId]
    );

    if (skillsResult.length === 0) {
      return NextResponse.json(
        { categories: [] },
        { status: 200 }
      );
    }

    // Transform the JSONB data to match frontend expectations
    const skillData = skillsResult[0].skill_name;
    const categories = Object.entries(skillData).map(([name, skills]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      skills: Array.isArray(skills) ? skills : []
    }));

    return NextResponse.json(
      { categories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const categories = body.categories;

  // Validate the input
  if (!Array.isArray(categories)) {
    return NextResponse.json(
      { message: 'Invalid input. Expected an array of categories.' },
      { status: 400 }
    );
  }

  // Fetch the user ID
  const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
  if (!userResult || userResult.length === 0) {
    return NextResponse.json(
      { message: 'User not found with this email.' },
      { status: 404 }
    );
  }
  const userId = userResult[0].id;

  try {
    // Transform categories into a JSON object
    const skillsJson = categories.reduce((acc, category) => {
      acc[category.name] = category.skills;
      return acc;
    }, {});

    // Check if the user already has a row in the skills table
    const existingSkills = await db(
      'SELECT id FROM skills WHERE user_id = $1',
      [userId]
    );

    if (existingSkills.length > 0) {
      // Update the existing row
      await db(
        `UPDATE skills
         SET skill_name = $1
         WHERE user_id = $2`,
        [skillsJson, userId]
      );
    } else {
      // Insert a new row
      await db(
        `INSERT INTO skills (user_id, skill_name)
         VALUES ($1, $2)`,
        [userId, skillsJson]
      );
    }

    return NextResponse.json(
      { message: 'Skills saved successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}