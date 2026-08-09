import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { Name } from "@/domain/value-objects/name.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { RestaurantOwner as PrismaRestaurantOwner } from "@/generated/prisma/client.js";

export class RestaurantOwnerMapper{
    static toDomain(raw: PrismaRestaurantOwner): RestaurantOwner {
        return RestaurantOwner.reconstitute(
            {
                name: Name.create(raw.name),
                email: Email.create(raw.email),
                password: raw.password,
                cnpj: CNPJ.create(raw.cnpj),
                phone: raw.phone,
                birthDate: raw.birthDate,
                payflowMerchantId: raw.payflowMerchantId,
                payflowWalletId: raw.payflowWalletId,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
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
            payflowMerchantId: owner.payflowMerchantId ?? undefined,
            payflowWalletId: owner.payflowWalletId ?? undefined,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        }
    }
}