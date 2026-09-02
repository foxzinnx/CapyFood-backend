import { InvalidRefreshTokenError } from "@/domain/errors/invalid-refresh-token.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { RefreshSessionOutput } from "./refresh-session.output.js";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token.repository.js";
import type { TokenHasher } from "@/application/ports/token-hasher.js";
import type { GenerateTokenPairService } from "@/application/services/generate-token-pair.service.js";
import type { RefreshSessionInput } from "./refresh-session.input.js";

type RefreshSessionResult = Either<InvalidRefreshTokenError, RefreshSessionOutput>;

export class RefreshSessionUseCase{
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly tokenHasher: TokenHasher,
        private readonly generateTokenPair: GenerateTokenPairService
    ){}

    async execute(input: RefreshSessionInput): Promise<RefreshSessionResult> {
        const tokenHash = this.tokenHasher.hash(input.refreshToken);

        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if(!storedToken){
            return left(new InvalidRefreshTokenError());
        }

        if(storedToken.isRevoked){
            await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId.value);
            return left(new InvalidRefreshTokenError());
        }

        if(storedToken.isExpired){
            return left(new InvalidRefreshTokenError());
        }

        storedToken.revoke();
        await this.refreshTokenRepository.save(storedToken);

        const tokens = await this.generateTokenPair.execute(
            storedToken.userId.value,
            storedToken.role
        );

        return right(tokens);
    }
}