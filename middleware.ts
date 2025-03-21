import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

// Use the same secret key as in your login route
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Define exact paths for better matching
const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];
const PROTECTED_PATHS = ['/dashboard']; // Add more protected routes as needed

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token if it exists
  const token = request.cookies.get("authToken")?.value;
  
  // Log all cookies to debug
  console.log("All cookies:", request.cookies.getAll());
  console.log(`Middleware processing: ${pathname}, Token exists: ${!!token}`);
  
  // Check if current path is public or protected
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PATHS.includes(pathname);
  
  // STEP 1: Handle public paths (login, signup)
  if (isPublicPath) {
    // If no token on public path, just allow access (normal case for login)
    if (!token) {
      console.log("No token on public path, allowing access");
      return NextResponse.next();
    }
    
    // If token exists on public path, verify and redirect if valid
    try {
      const secretKey = new TextEncoder().encode(SECRET_KEY);
      // Using jose.decodeJwt first to avoid verification errors
      const decoded = jose.decodeJwt(token);
      console.log("Token decoded successfully:", decoded);
      
      // Verify the token
      await jose.jwtVerify(token, secretKey);
      
      // Valid token on login/signup page, redirect to dashboard
      console.log("Valid token on public path, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      // Invalid token on public path, clear it and allow access
      console.log("Invalid token on public path, error:", error);
      const response = NextResponse.next();
      response.cookies.delete("authToken");
      return response;
    }
  }
  
  // STEP 2: Handle protected paths (dashboard, etc.)
  if (isProtectedPath) {
    // No token on protected path, redirect to login
    if (!token) {
      console.log("No token on protected path, redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    // Token exists, verify it
    try {
      const secretKey = new TextEncoder().encode(SECRET_KEY);
      const { payload } = await jose.jwtVerify(token, secretKey);
      // Valid token on protected path, allow access
      console.log("Valid token on protected path, allowing access");
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub as string);
      return response;
    } catch (error) {
      // Invalid token on protected path, redirect to login
      console.log("Invalid token on protected path, error:", error);
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("authToken");
      return response;
    }
  }
  
  // STEP 3: Handle all other paths
  // For homepage and all non-specified paths, allow access
  return NextResponse.next();
}

// Configure the middleware to run only on the paths we need to check
export const config = {
  matcher: [
    '/auth/login',
    '/auth/signup',
    '/dashboard'
  ],
};