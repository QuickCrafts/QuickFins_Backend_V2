import { z } from "zod";

const mainUserSchema = z.object({
  _id: z.object({}),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid Email" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
  firstName: z.string({ required_error: "First Name is required" }),
  lastName: z.string({ required_error: "Last Name is required" }),
  bornDate: z
    .string({
      required_error: "Born Date is required",
    })
    .refine(
      (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      { message: "Invalid Date" }
    ),
});

// We don't need to store the password in the database or provide the Id
export const databasePOSTUserSchema = mainUserSchema.omit({
  password: true,
  _id: true,
});

// Since we don't store the password, we can't retrieve it
export const databaseGETUserSchema = mainUserSchema.omit({ password: true });

// We make the update schema the same as the post one but with all fields being optional
export const databasePUTUserSchema = databasePOSTUserSchema.partial();
