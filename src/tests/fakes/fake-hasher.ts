import type { Hasher } from "@/application/ports/hasher.js";

export class FakeHasher implements Hasher{
    async hash(plain: string): Promise<string> {
        return `hashed:${plain}`;
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return hashed === `hashed:${plain}`
    }

}