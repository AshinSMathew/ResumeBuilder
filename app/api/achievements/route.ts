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
    const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    const userDataResult = await db('SELECT achievements FROM user_data WHERE user_id = $1', [userId]);
    
    if (userDataResult.length > 0 && userDataResult[0].achievements) {
      return NextResponse.json(
        { achievements: userDataResult[0].achievements },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { achievements: [] },
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
  const { achievements } = body;
  
  if (!Array.isArray(achievements)) {
    return NextResponse.json(
      { message: 'Achievements data must be an array.' },
      { status: 400 }
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

    const userDataResult = await db('SELECT id FROM user_data WHERE user_id = $1', [userId]);
    
    if (userDataResult.length > 0) {
      await db`
        UPDATE user_data 
        SET achievements = ${JSON.stringify(achievements)}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      await db`
        INSERT INTO user_data (user_id, achievements)
        VALUES (${userId}, ${JSON.stringify(achievements)})
      `;
    }

    return NextResponse.json(
      { message: 'Achievements saved successfully!', achievements },
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