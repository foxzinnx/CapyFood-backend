import type { Hasher } from "@/application/ports/hasher.js";
import bcrypt from "bcryptjs";

export class BcryptHasher implements Hasher {
    private readonly saltRounds: number;

    constructor(){
        this.saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    }

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.saltRounds)
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed)
    }
}