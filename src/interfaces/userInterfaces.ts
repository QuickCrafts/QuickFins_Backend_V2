import { z } from "zod";
import { mainUserSchema, databaseUserSchema } from "../schemas/userSchemas";
//We import schemas as the interfaces will be generated from them
//This lets us keep the schemas and interfaces in sync

export type mainUserInterface = z.infer<typeof mainUserSchema>;

export type databaseUserInterface = z.infer<typeof databaseUserSchema>;