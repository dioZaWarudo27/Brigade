import {z} from 'zod'
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);

export const registerSchema = z.object({
    email: z.email("Please provide a valid email").toLowerCase().transform(sanitizeHtml),
    password: z.string().min(8, 'Password must be at least 8 characters long').transform(sanitizeHtml),
    confirmPassword: z.string().transform(sanitizeHtml)
}).refine((data) => data.password === data.confirmPassword,{
    message: "Passwords do not match",
    path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email" }).toLowerCase().transform(sanitizeHtml),
  password: z.string().min(1, { error: "Password is required" }).transform(sanitizeHtml),
}); 

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;