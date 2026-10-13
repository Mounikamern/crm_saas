import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await dbService.getCustomers();
    return NextResponse.json({ success: true, customers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching customers";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    const customer = await dbService.createCustomer({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      gstin: body.gstin,
      customerType: body.customerType || "RETAIL",
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating customer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
