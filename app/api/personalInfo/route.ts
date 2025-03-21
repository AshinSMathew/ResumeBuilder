import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
    const user_email = getEmailFromAuthToken(request);
    
    if (!user_email) {
        return NextResponse.json(
            { message: 'Unauthorized. Email not found.' },
            { status: 401 }
        );
    }
    try {
        const body = await request.json();
        const { fullName, email, phoneNumber, linkedIn, github, portfolio, summary } = body;

        // Validate the input data
        if (!fullName || !email) {
            return NextResponse.json(
                { message: 'Full Name and Email are required.' },
                { status: 400 }
            );
        }

        // Look up the user ID from the users table using the email
        const userResult = await db('SELECT id FROM users WHERE email = $1', [user_email]);
        
        // Check if the user exists
        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                { message: 'User not found with this email.' },
                { status: 404 }
            );
        }
        
        const userId = userResult[0].id;

        // Insert the data into the database with the looked-up user ID
        const result = await db(
            'INSERT INTO resumes (full_name, email, phone_number, linkedin_url, github_url, portfolio_url, summary, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [fullName, email, phoneNumber, linkedIn, github, portfolio, summary, userId]
        );

        return NextResponse.json(
            { message: 'Personal information submitted successfully!' },
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