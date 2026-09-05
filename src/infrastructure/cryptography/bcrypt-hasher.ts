import type { Hasher } from "@/application/ports/hasher.js";
import { env } from "@/shared/env/index.js";
import bcrypt from "bcryptjs";

export class BcryptHasher implements Hasher {
    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS)
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed)
    }
}