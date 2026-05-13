import z from "zod";

export const createRestaurantSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    phone: z.string().min(10).max(11),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().length(2),
    zipCode: z.string().length(8)
});

export const listRestaurantsSchema = z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    isOpen: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional(),
    perPage: z.coerce.number().int().positive().max(50).optional(),
});

export const updateRestaurantHoursSchema = z.object({
    businessHours: z.array(
        z.object({
            dayOfWeek: z.number().int().min(0).max(6),
            openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid format, use HH:MM'),
            closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid format, use HH:MM'),
            isActive: z.boolean(),
        })
    )
});

export const getTopRatedRestaurantsSchema = z.object({
    limit: z.coerce.number().int().positive().max(30).optional(),
})

export const restaurantIdSchema = z.object({
    restaurantId: z.uuid()
})
