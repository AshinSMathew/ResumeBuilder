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

    const userDataResult = await db('SELECT certifications FROM user_data WHERE user_id = $1', [userId]);
    
    if (userDataResult.length > 0 && userDataResult[0].certifications) {
      return NextResponse.json(
        { certifications: userDataResult[0].certifications },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { certifications: [] },
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
  const { certifications } = body;
  
  if (!Array.isArray(certifications)) {
    return NextResponse.json(
      { message: 'Certifications data must be an array.' },
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
        SET certifications = ${JSON.stringify(certifications)}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      await db`
        INSERT INTO user_data (user_id, certifications)
        VALUES (${userId}, ${JSON.stringify(certifications)})
      `;
    }

    return NextResponse.json(
      { message: 'Certifications saved successfully!', certifications },
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