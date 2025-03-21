import { NextRequest, NextResponse } from 'next/server';
import {db} from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils"

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
        const { educations } = body; // Expecting an object with resumeId and an array of education
        // Validate the input data
        if (!Array.isArray(educations) || educations.length === 0) {
            return NextResponse.json(
                { message: 'Education data are required.' },
                { status: 400 }
            );
        }

        const userResult = await db('SELECT id FROM users WHERE email = $1', [email]);
        
        // Check if the user exists
        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                { message: 'User not found with this email.' },
                { status: 404 }
            );
        }
        
        const userId = userResult[0].id;
        console.log(userId)

        // Insert each education record into the database
        for (let i = 0; i < educations.length; i++) {
            const { institution, degree, fieldOfStudy, startDate, endDate, description } = educations[i];
            await db`
                INSERT INTO education (user_id, institution, degree, field_of_study, start_year, end_year, description) 
                VALUES (${userId}, ${institution}, ${degree}, ${fieldOfStudy},  ${startDate},  ${endDate}, ${description})
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