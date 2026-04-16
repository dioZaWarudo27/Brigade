import { z } from 'zod';
import DOMPurify from "isomorphic-dompurify";

// 1. Create a reusable sanitizer transform
const sanitizeHtml = (val: string) => DOMPurify.sanitize(val);

// Schema for Comments
export const commentSchema = z.object({
    post_id: z.coerce.number().positive(),
    content: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment too long").transform(sanitizeHtml),
    parent_id: z.coerce.number().optional().nullable()
});

// Schema for Chat Messages
export const chatMessageSchema = z.object({
    content: z.string().trim().max(5000, "Message is too long").transform(sanitizeHtml).optional(),
    // Images are handled via req.files check in server.ts, 
    // but we cap the string content here.
});

export const maxAiChar = z.object({
    userMessage: z.string().trim().max(1000, "Message is too long").transform(sanitizeHtml)
})

export type CommentInput = z.infer<typeof commentSchema>;
export type aichar = z.infer<typeof maxAiChar>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
