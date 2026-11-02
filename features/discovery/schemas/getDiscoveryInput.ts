import { z } from "zod";
export const getDiscoveryInputSchema = z.object({ id: z.uuid() });
