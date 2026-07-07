import type { Hasher } from "@/application/ports/hasher.js";
import { CpfAlreadyInUseError } from "@/domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CreateCustomerOutput } from "./create-customer.output.js";
import type { CreateCustomerInput } from "./create-customer.input.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Customer } from "@/domain/entities/customer.entity.js";

type CreateCustomerResult = Either<
    EmailAlreadyInUseError | CpfAlreadyInUseError,
    CreateCustomerOutput
>

export class CreateCustomerUseCase{
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly hasher: Hasher
    ){}

    async execute(input: CreateCustomerInput): Promise<CreateCustomerResult>{
        const email = Email.create(input.email);
        const cpf = CPF.create(input.cpf);

        const emailAlreadyInUse = await this.customerRepository.findByEmail(input.email);
        if(emailAlreadyInUse){
            return left(new EmailAlreadyInUseError());
        }

        const cpfAlreadyInUse = await this.customerRepository.findByCpf(input.cpf);
        if(cpfAlreadyInUse){
            return left(new CpfAlreadyInUseError());
        }

        const hashedPassword = await this.hasher.hash(input.password);

        const customer = Customer.create({
            name: input.name,
            email,
            password: hashedPassword,
            cpf,
            phone: input.phone,
            birthDate: input.birthDate
        });

        await this.customerRepository.create(customer);

        return right({ customerId: customer.id.value })
    }
}