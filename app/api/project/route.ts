import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEmailFromAuthToken } from "@/lib/utils";

// GET endpoint to fetch projects
export async function GET(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    const userDataResult = await db('SELECT projects FROM user_data WHERE user_id = $1', [userId]);
    
    if (userDataResult.length > 0 && userDataResult[0].projects) {
      return NextResponse.json(
        { projects: userDataResult[0].projects },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { projects: [] },
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

// POST endpoint to save projects
export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { projects } = body;
  
  if (!Array.isArray(projects)) {
    return NextResponse.json(
      { message: 'Projects data must be an array.' },
      { status: 400 }
    );
  }

  try {
    // Get user ID
    const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    // Check if user_data record exists
    const userDataResult = await db('SELECT id FROM user_data WHERE user_id = $1', [userId]);
    
    if (userDataResult.length > 0) {
      // Update existing record
      await db`
        UPDATE user_data 
        SET projects = ${JSON.stringify(projects)}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      // Create new record
      await db`
        INSERT INTO user_data (user_id, projects)
        VALUES (${userId}, ${JSON.stringify(projects)})
      `;
    }

    return NextResponse.json(
      { message: 'Projects saved successfully!', projects },
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