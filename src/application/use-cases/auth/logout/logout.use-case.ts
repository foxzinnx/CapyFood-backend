import type { TokenHasher } from "@/application/ports/token-hasher.js";
import type { RefreshTokenRepository } from "@/domain/repositories/refresh-token.repository.js";
import { right, type Either } from "@/shared/either.js";
import type { LogoutInput } from "./logout.input.js";

type LogoutResult = Either<never, void>;

export class LogoutUseCase{
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly tokenHasher: TokenHasher
    ){}

    async execute(input: LogoutInput): Promise<LogoutResult>{
        const tokenHash = this.tokenHasher.hash(input.refreshToken);

        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if(storedToken && !storedToken.isRevoked){
            storedToken.revoke();
            await this.refreshTokenRepository.save(storedToken);
        }

        return right(undefined);
    }
}