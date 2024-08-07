import { z } from "zod";

export const mainUserSchema = z.object({
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

// We don't need to store the password in the database
export const databaseUserSchema = mainUserSchema.omit({ password: true });
