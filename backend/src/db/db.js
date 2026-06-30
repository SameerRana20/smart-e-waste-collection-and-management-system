import mysql from "mysql2/promise"

let connection

const connectDB = async ()=> {
    try {
         connection =  mysql.createPool({
             
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit:0,
            multipleStatements: true
        })

        console.log("MySQL Connected Successfully")

    } catch(error){
        console.log("Connection ERROR: ", error)
        process.exit(1)
    }
}

export { connection };
export default connectDB
    
 