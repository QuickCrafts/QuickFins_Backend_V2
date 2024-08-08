import {z} from "zod";
import { createAuthUserSchema } from "../schemas/authUserSchemas";


export type createAuthUserInterface = z.infer<typeof createAuthUserSchema>;