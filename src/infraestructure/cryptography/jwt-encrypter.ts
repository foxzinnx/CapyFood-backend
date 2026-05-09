import type { Encrypter } from "@/application/ports/encrypter.js";
import jwt, { type SignOptions } from 'jsonwebtoken';

export class JwtEncrypter implements Encrypter {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor(){
        this.secret = process.env.JWT_SECRET!
        this.expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
    }
    
    async encrypt(payload: Record<string, unknown>): Promise<string> {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as SignOptions);
    }
}