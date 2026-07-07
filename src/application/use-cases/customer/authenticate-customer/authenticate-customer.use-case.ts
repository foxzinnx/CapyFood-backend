import type { Encrypter } from "@/application/ports/encrypter.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { AuthenticateCustomerInput } from "./authenticate-customer.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error.js";
import type { AuthenticateCustomerOutput } from "./authenticate-customer.output.js";
import type { Hasher } from "@/application/ports/hasher.js";
import { Email } from "@/domain/value-objects/email.vo.js";

type AuthenticateCustomerResult = Either<
    InvalidCredentialsError,
    AuthenticateCustomerOutput
>

export class AuthenticateCustomerUseCase{
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly hasher: Hasher,
        private readonly encrypter: Encrypter
    ){}

    async execute(input: AuthenticateCustomerInput): Promise<AuthenticateCustomerResult> {
        const email = Email.create(input.email);

        const customer = await this.customerRepository.findByEmail(email.value);
        if(!customer){
            return left(new InvalidCredentialsError());
        }

        const passwordMatch = await this.hasher.compare(input.password, customer.password);
        if(!passwordMatch){
            return left(new InvalidCredentialsError());
        }

        const accessToken = await this.encrypter.encrypt({
            sub: customer.id.value,
            role: 'CUSTOMER',
        });

        return right({ accessToken });
    }
}