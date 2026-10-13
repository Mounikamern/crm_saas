import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [batchSummaries, dashboardStats] = await Promise.all([
      dbService.getBatchProfitSummaries(),
      dbService.getDashboardStats(),
    ]);

    return NextResponse.json({
      success: true,
      batchSummaries,
      dashboardStats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching analytics";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
