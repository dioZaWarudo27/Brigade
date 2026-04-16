import { z } from 'zod';
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);

export const workoutSchema = z.object({
    exercise: z.string().min(1, "Exercise name is required").max(100, "Exercise name too long").transform(sanitizeHtml),
    sets: z.coerce.number().int("Sets must be a whole number").nonnegative("Sets cannot be negative"),
    reps: z.coerce.number().int("Reps must be a whole number").nonnegative("Reps cannot be negative"),
    weight: z.coerce.number().nonnegative("Weight cannot be negative"),
    body_part: z.string().max(50).transform(sanitizeHtml).optional()
});
export const tdeeSchema = z.object({
    username: z.string().max(50, { message: 'Username cannot exceed 50 characters' }).transform(sanitizeHtml),
    gender: z.string().transform(sanitizeHtml),
    age: z.coerce.number().int().positive(), 
    weight: z.coerce.number().positive().transform((val) => Number(val.toFixed(2))),
    height: z.coerce.number().positive().transform((val) => Number(val.toFixed(2))),
    activity_level: z.string(),
    goal: z.string().transform(sanitizeHtml),
    bodyfat: z.coerce.number()
    .positive()
    .optional() // Add this before the transform
    .transform((val) => val !== undefined ? Number(val.toFixed(2)) : undefined)

});
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type tdeeInput = z.infer<typeof tdeeSchema>