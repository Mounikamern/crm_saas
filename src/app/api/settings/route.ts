import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await dbService.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await dbService.updateSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
