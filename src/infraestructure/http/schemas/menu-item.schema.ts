import z from "zod";

export const createMenuItemSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive()
});

export const updateMenuItemSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    price: z.number().positive().optional(),
    isAvailable: z.boolean().optional()
});

export const getFeaturedMenuItems = z.object({
    limit: z.coerce.number().int().positive().max(30).optional()
})

export const menuItemIdSchema = z.object({
    menuItemId: z.uuid()
})