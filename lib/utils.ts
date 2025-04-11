import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEmailFromAuthToken(request: NextRequest): string | null {
    try {
        const authToken = request.cookies.get('authToken')?.value;

        if (!authToken) {
            console.log('authToken cookie not found.');
            return null;
        }
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET as string) as { email?: string };
        if (decoded && decoded.email) {
            console.log('Email extracted from authToken:', decoded.email);
            return decoded.email;
        } else {
            console.log('Email not found in authToken payload.');
            return null;
        }
    } catch (error) {
        console.error('Error decoding authToken:', error);
        return null;
    }
}

