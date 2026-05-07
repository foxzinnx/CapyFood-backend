import { Customer } from "@/domain/entities/customer.entity.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Customer as PrismaCustomer } from "@/generated/prisma/client.js";

export class CustomerMapper{
    static toDomain(raw: PrismaCustomer): Customer {
        return Customer.create(
            {
                name: raw.name,
                email: Email.create(raw.email),
                password: raw.password,
                cpf: CPF.create(raw.cpf),
                phone: raw.phone,
                birthDate: raw.birthDate
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
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        }
    }
}