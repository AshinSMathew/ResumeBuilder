import { type NextRequest, NextResponse } from "next/server"
import {db} from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phoneNumber, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await db`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password,10);

    // Insert new user
    const newUsers = await db`
      INSERT INTO users (name, email, phone_number, password_hash) 
      VALUES (${name}, ${email}, ${phoneNumber}, ${passwordHash}) 
      RETURNING id, name, email, phone_number, created_at
    `

    const newUser = newUsers[0]

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phone_number,
          createdAt: newUser.created_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

