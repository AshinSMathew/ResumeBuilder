import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEmailFromAuthToken } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const skillsData = body;

  // Validate the input
  if (!Array.isArray(skillsData)) {
    return NextResponse.json(
      { message: 'Invalid input. Expected an array of skills.' },
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
    // Transform skillsData into a JSON object
    const skillsJson = skillsData.reduce((acc, [category, ...skills]) => {
      acc[category] = skills;
      return acc;
    }, {});

    // Check if the user already has a row in the skills table
    const existingSkills = await db(
      'SELECT skills FROM skills WHERE user_id = $1',
      [userId]
    );

    if (existingSkills.length > 0) {
      // Update the existing row
      await db(
        `UPDATE skills
         SET skill_name = $1
         WHERE user_id = $2`,
        [JSON.stringify(skillsJson), userId]
      );
    } else {
      // Insert a new row
      await db(
        `INSERT INTO skills (user_id, skill_name)
         VALUES ($1, $2)`,
        [userId, JSON.stringify(skillsJson)]
      );
    }

    return NextResponse.json(
      { message: 'Skills details submitted successfully!' },
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