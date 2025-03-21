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
  const { projects } = body;
    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { message: 'Project data are required.' },
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
      for (let i = 0; i < projects.length; i++) {
        const { name, link, startDate, description, technologies } = projects[i];

        await db
          `INSERT INTO projects (user_id, name, link, start_year, description, technologies)
          VALUES (${userId}, ${name}, ${link}, ${startDate}, ${description}, ${technologies})
          `;
      }

      return NextResponse.json(
        { message: 'Project details submitted successfully!' },
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