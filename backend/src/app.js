import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


import router from "./routes/user.routes.js"
import collectorRouter from "./routes/collector.routes.js"
import adminRouter from "./routes/admin.routes.js"
import requestRoutes from "./routes/request.routes.js";

 

app.use("/api/v1/user", router)
app.use("/api/v1/collector", collectorRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/requests", requestRoutes);

export { app }
