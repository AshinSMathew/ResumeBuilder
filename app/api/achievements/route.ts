import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEmailFromAuthToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  console.log(email)
  if (!email) {
      return NextResponse.json(
          { message: 'Unauthorized. Email not found.' },
          { status: 401 }
      );
  }
  const body = await request.json();
  const { achievements } = body;
    if (!Array.isArray(achievements) || achievements.length === 0) {
      return NextResponse.json(
        { message: 'Certification data are required.' },
        { status: 400 }
      );
    }
    const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found with this email.' },
        { status: 404 }
      );
    }
    const userId = userResult[0].id;

    try {
      for (let i = 0; i < achievements.length; i++) {
        const { title, organization, date, description } = achievements[i];
        await db`
          INSERT INTO achievements (user_id, title, organization, year, description)
          VALUES (${userId}, ${title}, ${organization}, ${date}, ${description})
        `;
      }
      return NextResponse.json(
        { message: 'Achievement details submitted successfully!' },
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