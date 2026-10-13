import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const data = await dbService.getDealers();
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching dealers";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.storeName || !body.ownerName || !body.phone || !body.address || !body.city) {
      return NextResponse.json(
        { success: false, error: "Store Name, Owner Name, Phone, Address, and City are required" },
        { status: 400 }
      );
    }

    const dealer = await dbService.registerDealer(body);
    return NextResponse.json({ success: true, dealer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error registering dealer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.dealerId) {
      return NextResponse.json({ success: false, error: "dealerId is required" }, { status: 400 });
    }

    const activeDealer = await dbService.switchDealer(body.dealerId);
    return NextResponse.json({ success: true, activeDealer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error switching dealer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
