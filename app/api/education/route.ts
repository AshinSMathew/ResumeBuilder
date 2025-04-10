import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    // Get the request body as JSON
    const body = await request.json();
    const { educations } = body;
    
    // Validate the input data
    if (!Array.isArray(educations) || educations.length === 0) {
      return NextResponse.json(
        { message: 'Education data is required.' },
        { status: 400 }
      );
    }

    const userResult = await db`SELECT id FROM users WHERE email = ${email}`;
    
    // Check if the user exists
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    
    const userId = userResult[0].id;

    // Check if a user_data record already exists for this user
    const userDataResult = await db`SELECT id FROM user_data WHERE user_id = ${userId}`;

    if (userDataResult && userDataResult.length > 0) {
      // Update existing record
      await db`
        UPDATE user_data 
        SET education = ${JSON.stringify(educations)}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      // Insert new record
      await db`
        INSERT INTO user_data (user_id, education)
        VALUES (${userId}, ${JSON.stringify(educations)})
      `;
    }

    return NextResponse.json(
      { message: 'Education details submitted successfully!' },
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

export async function GET(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
    return NextResponse.json(
      { message: 'Unauthorized. Email not found.' },
      { status: 401 }
    );
  }

  try {
    const userResult = await db`SELECT id FROM users WHERE email = ${email}`;
    
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    
    const userId = userResult[0].id;

    const userDataResult = await db`
      SELECT education FROM user_data WHERE user_id = ${userId}
    `;
    
    if (!userDataResult || userDataResult.length === 0) {
      return NextResponse.json(
        { educations: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { educations: userDataResult[0].education || [] },
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