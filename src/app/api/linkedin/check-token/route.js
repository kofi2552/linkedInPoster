import { User } from "@/lib/models.js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if LinkedIn access token is stored and still valid
    const now = new Date();
    const expiresAt = user.linkedinTokenExpiresAt
      ? new Date(user.linkedinTokenExpiresAt)
      : null;

    const isValid =
      user.linkedinAccessToken &&
      expiresAt &&
      expiresAt.getTime() > now.getTime();

    return NextResponse.json({
      connected: isValid,
      expiresAt,
    });
  } catch (error) {
    console.error("Error checking LinkedIn token:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
