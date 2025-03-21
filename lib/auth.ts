// File: lib/auth.ts
import { jwtVerify } from "jose"

// This should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return payload
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(request: Request) {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  const token = authHeader.split(" ")[1]
  return await verifyToken(token)
}

// Client-side helper to get the current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem("authToken")
  
  if (!token) {
    return null
  }
  
  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error("Failed to get user")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Client-side helper to logout
export const logout = () => {
  localStorage.removeItem("authToken")
  window.location.href = "/auth/login"
}