import type { Encrypter } from "@/application/ports/encrypter.js";
import { env } from "@/shared/env/index.js";
import jwt, { type SignOptions } from 'jsonwebtoken';

export class JwtEncrypter implements Encrypter {
    async encrypt(payload: Record<string, unknown>): Promise<string> {
        return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
    }
}