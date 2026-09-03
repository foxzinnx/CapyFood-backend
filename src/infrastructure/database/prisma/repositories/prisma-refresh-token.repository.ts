import type { RefreshToken } from "@/domain/entities/refresh-token.entity.js";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token.repository.js";
import { RefreshTokenMapper } from "../mappers/refresh-token.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    async create(token: RefreshToken): Promise<void> {
        const data = RefreshTokenMapper.toPrisma(token);
        await prisma.refreshToken.create({ data });
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const raw = await prisma.refreshToken.findUnique({
            where: { tokenHash }
        });
        if(!raw) return null;

        return RefreshTokenMapper.toDomain(raw);
    }

    async save(token: RefreshToken): Promise<void> {
        const data = RefreshTokenMapper.toPrisma(token);

        await prisma.refreshToken.update({
            where: { id: data.id },
            data
        });
    }

    async revokeAllByUserId(userId: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() }
        })
    }
    
}