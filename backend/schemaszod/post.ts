import { z } from 'zod';
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);
export const postSchema = z.object({
    content: z.string().max(2000, "Post content cannot exceed 2000 characters").transform(sanitizeHtml).optional(),
    gym_id: z.coerce.number().optional(),
    workoutIds: z.string().optional().transform((val) => {
        if (!val) return [];
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch {
            return [];
        }
    })
});

export type PostInput = z.infer<typeof postSchema>;
