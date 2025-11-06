import sequelize from "./db.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    await sequelize.sync({ alter: true }); // or { force: true } to rebuild everything
    console.log("✅ Tables synced");
  } catch (error) {
    console.error("Database init error:", error);
  }
})();
