import sequelize from "@/lib/db.js";

export async function POST(request) {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });

    console.log("Database initialized successfully");
    return Response.json({
      success: true,
      message: "Database initialized successfully",
    });
  } catch (error) {
    console.log("Database initialization error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
