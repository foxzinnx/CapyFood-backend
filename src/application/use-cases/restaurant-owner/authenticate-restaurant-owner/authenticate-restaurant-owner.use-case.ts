import type { Encrypter } from "@/application/ports/encrypter.js";
import type { Hasher } from "@/application/ports/hasher.js";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { AuthenticateRestaurantOwnerOutput } from "./authenticate-restaurant-owner.output.js";
import type { AuthenticateRestaurantOwnerInput } from "./authenticate-restaurant-owner.input.js";
import { Email } from "@/domain/value-objects/email.vo.js";

type AuthenticateRestaurantOwnerResult = Either<
    InvalidCredentialsError,
    AuthenticateRestaurantOwnerOutput
>

export class AuthenticateRestaurantOwnerUseCase{
    constructor(
        private readonly ownerRepository: RestaurantOwnerRepository,
        private readonly hasher: Hasher,
        private readonly encrypter: Encrypter
    ){}

    async execute(input: AuthenticateRestaurantOwnerInput): Promise<AuthenticateRestaurantOwnerResult>{
        const email = Email.create(input.email);

        const owner = await this.ownerRepository.findByEmail(email.value);
        if(!owner){
            return left(new InvalidCredentialsError());
        }

        const passwordMatch = await this.hasher.compare(input.password, owner.password);
        if(!passwordMatch){
            return left(new InvalidCredentialsError());
        }

        const accessToken = await this.encrypter.encrypt({
            sub: owner.id.value,
            role: 'OWNER'
        });

        return right({ accessToken });
    }
}