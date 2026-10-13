import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await dbService.getInvoiceById(id);
    const settings = await dbService.getSettings();

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
