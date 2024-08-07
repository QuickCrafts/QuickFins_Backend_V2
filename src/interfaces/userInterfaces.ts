import { z } from "zod";
import { databasePOSTUserSchema, databaseGETUserSchema, databasePUTUserSchema } from "../schemas/userSchemas";
//We import schemas as the interfaces will be generated from them
//This lets us keep the schemas and interfaces in sync

export type databasePOSTUserInterface = z.infer<typeof databasePOSTUserSchema>;

export type databaseGETUserInterface = z.infer<typeof databaseGETUserSchema>;

export type databasePUTUserInterface = z.infer<typeof databasePUTUserSchema>;