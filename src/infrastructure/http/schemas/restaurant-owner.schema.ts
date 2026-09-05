import z from "zod";

export const registerOwnerSchema = z.object({
    name: z.string('Name is required').min(2),
    email: z.email('Email is required'),
    password: z.string('Password is required').min(6),
    cnpj: z.string().length(14, 'CNPJ must have 14 digits without formatting.'),
    phone: z.string().min(10).max(11),
    birthDate: z.coerce.date()
});

export const authenticateOwnerSchema = z.object({
    email: z.email('Email is required'),
    password: z.string('Password is required')
})