import z from "zod";

export const refreshSessionSchema = z.object({
    refreshToken: z.string({ error: 'refreshToken is required' })
});

export const logoutSchema = z.object({
    refreshToken: z.string({ error: 'refreshToken is required' })
});