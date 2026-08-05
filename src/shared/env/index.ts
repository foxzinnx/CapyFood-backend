import z from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3333),

    DATABASE_URL: z.url({ error: "DATABASE_URL must be a valid URL" }),

    JWT_SECRET: z.string({
        error: (issue) =>
            issue.input === undefined
                ?   "JWT_SECRET is required" 
                :   "JWT_SECRET must have at least 32 characters for security"
        })
        .min(32, 'JWT_SECRET must have at least 32 characters for security'),
    
    JWT_EXPIRES_IN: z.string().default('7d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).default(10),

    CLOUDINARY_CLOUD_NAME: z.string({ error: 'CLOUDINARY_CLOUD_NAME is required' }),
    CLOUDINARY_API_KEY: z.string({ error: 'CLOUDINARY_API_KEY is required' }),
    CLOUDINARY_API_SECRET: z.string({ error: 'CLOUDINARY_API_SECRET is required' }),

    PAYFLOW_URL: z.url({ error: 'PAYFLOW_URL is required' }),
    PAYFLOW_API_KEY: z.string({ error: 'PAYFLOW_API_KEY is required' }),
    PAYFLOW_WEBHOOK_SECRET: z.string({ error: 'PAYFLOW_WEBHOOK_SECRET is required' }),
    PAYFLOW_PASSWORD_SECRET: z.string({ error: 'PAYFLOW_PASSWORD_SECRET is required' })
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success){
    console.error('Invalid environment variables: \n');

    const errors = parsed.error.flatten().fieldErrors;

    Object.entries(errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`)
    });

    console.error('\n Fix the errors above and restart the server.\n')
    process.exit(1)
}

export type Env = z.infer<typeof envSchema>;
export const env: Env = parsed.data;