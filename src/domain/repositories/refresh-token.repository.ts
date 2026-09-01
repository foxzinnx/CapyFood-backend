import type { RefreshToken } from "../entities/refresh-token.entity.js";

export interface RefreshTokenRepository {
    create(token: RefreshToken): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
    save(token: string): Promise<void>;
    revokeAllByUserId(userId: string): Promise<void>;
}