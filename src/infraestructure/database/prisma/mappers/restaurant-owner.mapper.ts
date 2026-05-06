import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { RestaurantOwner as PrismaRestaurantOwner } from "@/generated/prisma/client.js";

export class RestaurantOwnerMapper{
    static toDomain(raw: PrismaRestaurantOwner): RestaurantOwner {
        return RestaurantOwner.create(
            {
                name: raw.name,
                email: Email.create(raw.email),
                password: raw.password,
                cnpj: CNPJ.create(raw.cnpj),
                phone: raw.phone,
                birthDate: raw.birthDate,
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(owner: RestaurantOwner){
        return {
            id: owner.id.value,
            name: owner.name.value,
            email: owner.email.value,
            password: owner.password,
            cnpj: owner.cnpj.value,
            phone: owner.phone,
            birthDate: owner.birthDate,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        }
    }
}