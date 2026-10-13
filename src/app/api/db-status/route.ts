import { NextResponse } from "next/server";
import { isPostgresConnected } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connected = await isPostgresConnected();
    return NextResponse.json({
      success: true,
      postgresConnected: connected,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      provider: "PostgreSQL with Prisma ORM",
      mode: connected ? "PostgreSQL Active" : "Local Persistent JSON Cache (Zero-Config)",
      message: connected
        ? "Connected to PostgreSQL database successfully!"
        : "PostgreSQL server not detected on localhost:5432. Running in zero-config offline mode with full functionality and sample data. To connect your PostgreSQL, ensure your Postgres instance is running and run `npx prisma db push`.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking DB status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
