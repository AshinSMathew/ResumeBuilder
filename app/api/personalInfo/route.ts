import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getEmailFromAuthToken } from "@/lib/utils"

export async function GET(request: NextRequest) {
    const user_email = getEmailFromAuthToken(request);
    
    if (!user_email) {
        return NextResponse.json(
            { message: 'Unauthorized. Email not found.' },
            { status: 401 }
        );
    }

    try {
        const userResult = await db('SELECT id FROM users WHERE email = $1', [user_email]);
        
        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                { message: 'User not found with this email.' },
                { status: 404 }
            );
        }
        
        const userId = userResult[0].id;

        const detailsResult = await db(
            'SELECT full_name, email, phone_number, linkedin_url, github_url, portfolio_url, summary FROM personal_details WHERE user_id = $1',
            [userId]
        );

        if (detailsResult.length === 0) {
            return NextResponse.json(
                { message: 'No personal details found.', data: null },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { 
                message: 'Personal details fetched successfully',
                data: {
                    fullName: detailsResult[0].full_name,
                    email: detailsResult[0].email,
                    phoneNumber: detailsResult[0].phone_number,
                    linkedIn: detailsResult[0].linkedin_url,
                    github: detailsResult[0].github_url,
                    portfolio: detailsResult[0].portfolio_url,
                    summary: detailsResult[0].summary
                }
            },
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

        if (!fullName || !email) {
            return NextResponse.json(
                { message: 'Full Name and Email are required.' },
                { status: 400 }
            );
        }

        const userResult = await db('SELECT id FROM users WHERE email = $1', [user_email]);
        
        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                { message: 'User not found with this email.' },
                { status: 404 }
            );
        }
        
        const userId = userResult[0].id;

        const existingDetails = await db(
            'SELECT id FROM personal_details WHERE user_id = $1',
            [userId]
        );

        if (existingDetails.length > 0) {
            await db(
                `UPDATE personal_details 
                 SET full_name = $1, email = $2, phone_number = $3, 
                     linkedin_url = $4, github_url = $5, portfolio_url = $6, 
                     summary = $7, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $8`,
                [fullName, email, phoneNumber, linkedIn, github, portfolio, summary, userId]
            );
        } else {
            await db(
                'INSERT INTO personal_details (full_name, email, phone_number, linkedin_url, github_url, portfolio_url, summary, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [fullName, email, phoneNumber, linkedIn, github, portfolio, summary, userId]
            );
        }

        return NextResponse.json(
            { message: 'Personal information saved successfully!' },
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