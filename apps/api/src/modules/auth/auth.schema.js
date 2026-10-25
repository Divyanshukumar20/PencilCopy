import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters from zod schema")
      .max(100),

    email: z
      .string()
      .trim()
      .email("Invalid email from zod schema"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters from zod schema")
      .max(100),

    confirmPassword: z
      .string()
  })

  .refine((data) => data.password === data.confirmPassword, {

    message: "Passwords do not match from zod schema",

    path: ["confirmPassword"]

  });