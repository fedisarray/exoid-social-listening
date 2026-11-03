"use server";
import { requireUser } from "@/lib/auth/dal";
import { startCollectionInputSchema } from "../schemas/startCollectionInput";
import {
  startCollectionOutputSchema,
  type StartCollectionOutput,
} from "../schemas/startCollectionOutput";
import { startCollection as execute } from "../use-cases/startCollection";
export async function startCollection(
  raw: unknown,
): Promise<StartCollectionOutput> {
  const input = startCollectionInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return startCollectionOutputSchema.parse(output);
}
