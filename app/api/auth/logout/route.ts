// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the authentication cookie
  cookies().delete('authToken');
  
  // Return success response
  return NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
}