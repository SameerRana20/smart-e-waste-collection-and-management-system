import "dotenv/config"
import mysql from "mysql2/promise"
import fs from "fs"

// One-time DB setup script.
// Run with: npm run setup-db

const setupDb = async () => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306,
            multipleStatements: true
        })

        const schemaSQL = fs.readFileSync(process.cwd() + "/database/schema.sql", "utf8")

        await connection.query(schemaSQL)
        console.log("Database and Tables Created...!")

    } catch (error) {
        console.error("Database setup failed: ", error)
        process.exitCode = 1
    } finally {
        if (connection) await connection.end()
    }
}

setupDb()