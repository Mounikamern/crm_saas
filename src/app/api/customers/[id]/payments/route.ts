import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const body = await req.json();

    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    const customer = await dbService.recordCustomerPayment({
      customerId,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || "CASH",
      notes: body.notes,
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error recording customer payment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
