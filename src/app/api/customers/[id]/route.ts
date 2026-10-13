import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dbService.deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting customer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
