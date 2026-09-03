import type { TokenHasher } from "@/application/ports/token-hasher.js";
import { createHash, randomBytes } from "node:crypto";

export class CryptoTokenHasher implements TokenHasher {
    hash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    generateToken(): string {
        return randomBytes(40).toString('hex');
    }

}