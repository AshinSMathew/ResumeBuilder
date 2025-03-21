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
  const { certifications } = body;
    if (!Array.isArray(certifications) || certifications.length === 0) {
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
      // Insert each certification into the database
      for (let i = 0; i < certifications.length; i++) {
        const { name, issuer, date, expiryDate, credentialId, credentialURL, description } = certifications[i];

        // Insert the certification
        await db`
        INSERT INTO certifications (user_id, name, issuer, issue_year, credential_id, credential_url, description)
        VALUES (${userId}, ${name}, ${issuer}, ${date}, ${credentialId}, ${credentialURL}, ${description})
        `;
      }
      return NextResponse.json(
        { message: 'Certification details submitted successfully!' },
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