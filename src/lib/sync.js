import sequelize from "./db.js";
import "./models.js";

async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await sequelize.sync({ alter: true }); // or { force: true } for a full rebuild
    console.log("✅ All models synced successfully.");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
}

syncDB();
