import type { Hasher } from "@/application/ports/hasher.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import type { CreateRestaurantOwnerInput } from "./create-restaurant-owner.input.js";
import type { CreateRestaurantOwnerOutput } from "./create-restaurant-owner.output.js";
import { left, right, type Either } from "@/shared/either.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { CnpjAlreadyInUseError } from "@/domain/errors/cnpj-already-in-use.error.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";

type CreateRestaurantOwnerResult = Either<
    EmailAlreadyInUseError | CnpjAlreadyInUseError,
    CreateRestaurantOwnerOutput
>

export class CreateRestaurantOwnerUseCase{
    constructor(
        private readonly ownerRepository: RestaurantOwnerRepository,
        private readonly hasher: Hasher
    ){}

    async execute(input: CreateRestaurantOwnerInput): Promise<CreateRestaurantOwnerResult>{
        const email = Email.create(input.email);
        const cnpj = CNPJ.create(input.cnpj);
        
        const emailAlreadyInUse = await this.ownerRepository.findByEmail(email.value);
        if(emailAlreadyInUse){
            return left(new EmailAlreadyInUseError())
        }

        const cnpjAlreadyInUse = await this.ownerRepository.findByCnpj(cnpj.value);
        if(cnpjAlreadyInUse){
            return left(new CnpjAlreadyInUseError())
        }

        const hashedPassword = await this.hasher.hash(input.password);

        const owner = RestaurantOwner.create({
            name: input.name,
            email,
            password: hashedPassword,
            cnpj,
            phone: input.phone,
            birthDate: input.birthDate
        });

        await this.ownerRepository.create(owner);

        return right({ ownerId: owner.id.value });
    }
}