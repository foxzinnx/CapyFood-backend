import { RefreshToken } from "@/domain/entities/refresh-token.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { RefreshToken as PrismaRefreshToken } from "@/generated/prisma/client.js";

export class RefreshTokenMapper {
    static toDomain(raw: PrismaRefreshToken): RefreshToken {
        return RefreshToken.reconstitute(
            {
                userId: new UniqueEntityId(raw.userId),
                role: raw.role,
                tokenHash: raw.tokenHash,
                expiresAt: raw.expiresAt,
                revokedAt: raw.revokedAt,
                createdAt: raw.createdAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(token: RefreshToken){
        return {
            id: token.id.value,
            userId: token.userId.value,
            role: token.role,
            tokenHash: token.tokenHash,
            expiresAt: token.expiresAt,
            revokedAt: token.revokedAt,
            createdAt: token.createdAt
        }
    }
}