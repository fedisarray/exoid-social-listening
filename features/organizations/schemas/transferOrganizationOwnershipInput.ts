import { z } from "zod";
export const transferOrganizationOwnershipInputSchema = z
  .object({ userId: z.uuid() })
  .strict();
export type TransferOrganizationOwnershipInput = z.infer<
  typeof transferOrganizationOwnershipInputSchema
>;
