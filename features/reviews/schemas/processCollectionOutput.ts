import { z } from "zod";
export const processCollectionOutputSchema = z.object({ worked: z.boolean() });
