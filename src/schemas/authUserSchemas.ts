import {z} from "zod";

export const createAuthUserSchema = z.object({
    email: z.string({required_error: "Email is required"}).email({message: "Invalid email"}),
    password: z.string({required_error: "Password is required"}),
});