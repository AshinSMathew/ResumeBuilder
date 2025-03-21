import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEmailFromAuthToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  const email = getEmailFromAuthToken(request);
  if (!email) {
      return NextResponse.json(
          { message: 'Unauthorized. Email not found.' },
          { status: 401 }
      );
  }
  const body = await request.json();
  const { experiences } = body;
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return NextResponse.json(
        { message: 'Experience data are required.' },
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
      // Insert each experience into the database
      for (let i = 0; i < experiences.length; i++) {
        const { company, position, location, startDate, endDate, current, description } = experiences[i];
        await db`
          INSERT INTO experience (user_id, company, position, location, start_year, end_year, is_current, description)
          VALUES(${userId}, ${company}, ${position}, ${location}, ${startDate}, ${endDate}, ${current}, ${description})
        `;
      }

      return NextResponse.json(
        { message: 'Experience details submitted successfully!' },
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