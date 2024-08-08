import { z } from "zod";
import { completePOSTUserSchema } from "../schemas/completeUserSchemas";

export type completePOSTUserInterface = z.infer<typeof completePOSTUserSchema>;