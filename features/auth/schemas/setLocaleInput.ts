import { z } from "zod";
export const setLocaleInputSchema = z.enum(["it", "en"]);
