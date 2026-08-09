import z from "zod";

export const depositToWalletSchema = z.object({
    amountInCents: z
        .number({ error: 'AmountInCents is required' })
        .int('The value must be an integer in cents')
        .positive('The deposit amount must be greater than zero'),
    method: z.enum(['PIX', 'TED', 'BOLETO']).optional()
})