import { z } from 'zod';
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);
export const createPostSchema = z.object({
    // 1. Content is already a string, so standard validation works
    content: z.string().max(2200, { message: "Post exceeds character limit" }).transform(sanitizeHtml).optional(),

    gym_id: z.string().optional().transform((val) => {
        if (!val || val.trim() === "") return undefined;
        return parseInt(val, 10);
    }),

    workoutIds: z.string().optional().transform((val, ctx) => {
        // If it's missing or an empty array string, just return undefined
        if (!val || val === "[]") return undefined; 
        
        try {
            const parsed = JSON.parse(val);
            // Make sure they actually sent an array, not just a random JSON object
            if (!Array.isArray(parsed)) {
                throw new Error("Parsed data is not an array");
            }
            // Ensure every item inside the array is a number
            return parsed.map(Number); 
        }catch (err) {
            // If JSON.parse fails, we tell Zod to reject the request
            ctx.addIssue({ 
                code: z.ZodIssueCode.custom, 
                message: "workoutIds must be a valid stringified array" 
            });
            return z.NEVER; 
        }
    })
});



export type CreatePostInput = z.infer<typeof createPostSchema>;