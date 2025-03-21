import { initializeDatabase } from "./db"

// This script initializes the database tables
async function main() {
  try {
    console.log("Initializing database...")
    await initializeDatabase()
    console.log("Database initialization complete!")
    process.exit(0)
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  }
}

main()

