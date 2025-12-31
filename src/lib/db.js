import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const sequelize = new Sequelize(process.env.RENDER_DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  protocol: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // REQUIRED for Render
    },
  },
});

export default sequelize;
