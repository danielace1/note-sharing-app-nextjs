import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW() AS current_time`);

    return Response.json({
      success: true,
      message: "Database connection successful",
      databaseTime: result.rows[0]?.current_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
