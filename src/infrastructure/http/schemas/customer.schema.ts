import z from "zod";

export const registerCustomerSchema = z.object({
    name: z.string('Name is required').min(2),
    email: z.email('Email is required'),
    password: z.string('Password is required').min(6),
    cpf: z.string().length(11, 'CPF must have 11 digits without formatted'),
    phone: z.string().min(10).max(11),
    birthDate: z.coerce.date()
});

export const authenticateCustomerSchema = z.object({
    email: z.email('Email is required'),
    password: z.string()
})