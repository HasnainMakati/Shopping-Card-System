import dotenv from "dotenv";
dotenv.config()
import { app } from "./app.js";
import { db } from "./db/index.js"

db.query("SELECT 1")
    .then(() => {
        console.log("Database connect successfully")

        app.listen(process.env.PORT || 4000, () => {
            console.log(`Server running port on ${process.env.PORT}`)
        })
    }).catch((err) => {
        console.log("Database connection failed", err);
        process.exit(1)
    });