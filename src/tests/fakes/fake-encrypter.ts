import type { Encrypter } from "@/application/ports/encrypter.js";

export class FakeEncrypter implements Encrypter {
    async encrypt(payload: Record<string, unknown>): Promise<string> {
        return JSON.stringify(payload);
    }

}