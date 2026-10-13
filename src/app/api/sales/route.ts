import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = await dbService.getInvoices();
    return NextResponse.json({ success: true, invoices });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching invoices";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    const invoice = await dbService.createSaleInvoice({
      customerId: body.customerId,
      invoiceDate: body.invoiceDate,
      items: body.items,
      discount: Number(body.discount || 0),
      taxRate: Number(body.taxRate || 0),
      paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
      paymentMethod: body.paymentMethod || "CASH",
      notes: body.notes,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing sale invoice";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
