import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];
const PROTECTED_PATHS = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get("authToken")?.value;
  
  console.log(`Token exists: ${!!token}`);
  
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PATHS.includes(pathname);
  

  if (isPublicPath) {
    if (!token) {
      console.log("No token on public path, allowing access");
      return NextResponse.next();
    }
    

    try {
      const secretKey = new TextEncoder().encode(SECRET_KEY);
      const decoded = jose.decodeJwt(token);
      console.log("Token decoded successfully:", decoded);
      
      await jose.jwtVerify(token, secretKey);
      
      console.log("Valid token on public path, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      console.log("Invalid token on public path, error:", error);
      const response = NextResponse.next();
      response.cookies.delete("authToken");
      return response;
    }
  }
  

  if (isProtectedPath) {
    if (!token) {
      console.log("No token on protected path, redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    try {
      const secretKey = new TextEncoder().encode(SECRET_KEY);
      const { payload } = await jose.jwtVerify(token, secretKey);
      console.log("Valid token on protected path, allowing access");
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub as string);
      return response;
    } catch (error) {
      console.log("Invalid token on protected path, error:", error);
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("authToken");
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/login',
    '/auth/signup',
    '/dashboard'
  ],
};