
import sequelize from "../src/lib/db.js";
import { User, Topic, Schedule, ScheduledPost } from "../src/lib/models.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from project root
const envPath = path.resolve(__dirname, "../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

async function syncDatabase() {
    try {
        console.log("Database URL is defined:", !!process.env.RENDER_DATABASE_URL);
        // console.log("DB URL:", process.env.RENDER_DATABASE_URL); // CAREFUL WITH SECRETS

        console.log("Authenticating...");
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        console.log("Syncing database...");
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error("Unable to connect to the database or sync:", error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
