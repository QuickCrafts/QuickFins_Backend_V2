import {
  databaseGETUserSchema,
  databasePOSTUserSchema,
  databasePUTUserSchema,
} from "./databaseUserSchemas";
import { createAuthUserSchema } from "./authUserSchemas";

// We can use the database schemas to create a complete user schema

export const completePOSTUserSchema = databasePOSTUserSchema
  .merge(createAuthUserSchema)
  .omit({ authId: true });
