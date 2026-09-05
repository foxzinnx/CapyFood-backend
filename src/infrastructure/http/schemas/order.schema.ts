import z from "zod";

export const createOrderSchema = z.object({
    restaurantId: z.uuid(),
    items: z.array(
        z.object({
            menuItemId: z.uuid(),
            quantity: z.number().int().positive()
        }),
    )
    .min(1, 'The order must contain at least one item'),
    notes: z.string().optional()
});

export const orderStatusSchema = z.object({
    status: z.enum([
        'CONFIRMED',
        'PREPARING',
        'READY',
        'DELIVERING',
        'DELIVERED',
        'CANCELLED',
    ])
})

export const orderQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    perPage: z.coerce.number().int().positive().max(50).optional(),
})

export const orderIdSchema = z.object({
    orderId: z.uuid()
});