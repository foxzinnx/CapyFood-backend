import { Customer } from "@/domain/entities/customer.entity.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { Name } from "@/domain/value-objects/name.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Customer as PrismaCustomer } from "@/generated/prisma/client.js";

export class CustomerMapper{
    static toDomain(raw: PrismaCustomer): Customer {
        return Customer.reconstitute(
            {
                name: Name.create(raw.name),
                email: Email.create(raw.email),
                password: raw.password,
                cpf: CPF.create(raw.cpf),
                phone: raw.phone,
                birthDate: raw.birthDate,
                payflowCustomerId: raw.payflowCustomerId,
                payflowWalletId: raw.payflowWalletId,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(customer: Customer){
        return {
            id: customer.id.value,
            name: customer.name.value,
            email: customer.email.value,
            password: customer.password,
            cpf: customer.cpf.value,
            phone: customer.phone,
            birthDate: customer.birthDate,
            payflowCustomerId: customer.payflowCustomerId ?? null,
            payflowWalletId: customer.payflowWalletId ?? null,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        }
    }
}