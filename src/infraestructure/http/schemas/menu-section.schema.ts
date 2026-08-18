import { z } from 'zod';

export const createMenuSectionSchema = z.object({
    name: z.string().min(2).max(60),
    description: z.string().max(200).optional()
});

export const updateMenuSectionSchema = z.object({
    name: z.string().min(2).max(60).optional(),
    description: z.string().max(200).nullable().optional(),
    isActive: z.boolean().optional()
});

export const reorderMenuSectionSchema = z.object({
    sections: z
        .array(
            z.object({
                sectionId: z.uuid(),
                position: z.number().int().min(0)
            }),
        )
        .min(1, 'Specify at least one section to reorder.')
});

export const sectionIdSchema = z.object({
    sectionId: z.uuid()
});