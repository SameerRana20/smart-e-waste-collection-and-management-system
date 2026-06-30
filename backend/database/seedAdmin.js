import "dotenv/config"
import mysql from "mysql2/promise"
import bcrypt from "bcrypt"

// One-time admin seeding script.
// Creates an admin account if one doesn't already exist, using credentials from .env.
// Run with: npm run seed-admin

const seedAdmin = async () => {
    let connection
    try {
        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, ADMIN_FULL_NAME, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env before seeding an admin")
        }

        connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: 3306
        })

        // Check if this admin username already exists
        const [existing] = await connection.query(
            "SELECT admin_id FROM admins WHERE username = ?",
            [ADMIN_USERNAME]
        )

        if (existing.length > 0) {
            console.log(`Admin "${ADMIN_USERNAME}" already exists. Skipping.`)
            return
        }

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

        await connection.query(
            "INSERT INTO admins (full_name, username, password_hash) VALUES (?, ?, ?)",
            [ADMIN_FULL_NAME || "Admin", ADMIN_USERNAME, passwordHash]
        )

        console.log(`Admin "${ADMIN_USERNAME}" created successfully.`)

    } catch (error) {
        console.error("Admin seeding failed: ", error)
        process.exitCode = 1
    } finally {
        if (connection) await connection.end()
    }
}

seedAdmin()