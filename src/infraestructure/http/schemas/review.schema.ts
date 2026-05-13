import z from "zod";

export const createReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    description: z.string().max(500).optional()
});

export const updateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    description: z.string().max(500).optional()
});

export const reviewQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    perPage: z.coerce.number().int().positive().max(50).optional(),
})

export const reviewIdSchema = z.object({
    reviewId: z.uuid()
})