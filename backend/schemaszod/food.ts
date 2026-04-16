import { z } from 'zod';
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);

export const foodLogSchema = z.object({
    food_name: z.string().min(1, "Food name is required").max(100).transform(sanitizeHtml),
    calories: z.coerce.number().nonnegative("Calories cannot be negative").max(10000),
    protein: z.coerce.number().nonnegative().max(1000),
    carbs: z.coerce.number().nonnegative().max(1000),
    fat: z.coerce.number().nonnegative().max(1000),
    serving_description: z.coerce.number().positive().max(10000).default(100)
});

export type FoodLogInput = z.infer<typeof foodLogSchema>;
