import { NextResponse, type NextRequest } from "next/server";
import { requireCollectionWorker } from "@/lib/auth/dal";
import { processCollection } from "@/features/reviews/use-cases/processCollection";
import { processCollectionOutputSchema } from "@/features/reviews/schemas/processCollectionOutput";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest): Promise<NextResponse> {
  const context = await requireCollectionWorker(
    request.headers.get("authorization"),
  );
  if (!context)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const output = await processCollection(context);
  return NextResponse.json(processCollectionOutputSchema.parse(output));
}
