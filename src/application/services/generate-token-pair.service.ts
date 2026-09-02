import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token.repository.js";
import type { Encrypter } from "../ports/encrypter.js";
import type { TokenHasher } from "../ports/token-hasher.js";
import { RefreshToken, type UserRole } from "@/domain/entities/refresh-token.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class GenerateTokenPairService {
    constructor(
        private readonly encrypter: Encrypter,
        private readonly tokenHasher: TokenHasher,
        private readonly refreshTokenRepository: RefreshTokenRepository
    ){}

    async execute(userId: string, role: UserRole): Promise<TokenPair>{
        const accessToken = await this.encrypter.encrypt({ sub: userId, role });

        const rawRefreshToken = this.tokenHasher.generateToken();
        const tokenHash = this.tokenHasher.hash(rawRefreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

        const refreshToken = RefreshToken.create({
            userId: new UniqueEntityId(userId),
            role,
            tokenHash,
            expiresAt
        });

        await this.refreshTokenRepository.create(refreshToken);

        return { accessToken, refreshToken: rawRefreshToken }
    }
}