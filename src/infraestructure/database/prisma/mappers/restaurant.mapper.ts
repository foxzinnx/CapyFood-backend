import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Restaurant as PrismaRestaurant, BusinessHours as PrismaBusinessHours } from "@/generated/prisma/client.js";

type PrismaRestaurantWithHours = PrismaRestaurant & {
    businessHours?: PrismaBusinessHours[]
}

export class RestaurantMapper{
    static toDomain(raw: PrismaRestaurantWithHours): Restaurant {
        return Restaurant.create(
            {
                name: raw.name,
                description: raw.description,
                logoUrl: raw.logoUrl,
                phone: raw.phone,
                address: raw.address,
                city: raw.city,
                state: raw.state,
                zipCode: raw.zipCode,
                isOpen: raw.isOpen,
                ownerId: new UniqueEntityId(raw.id),
                businessHours: (raw.businessHours ?? []).map((bh) => ({
                    dayOfWeek: bh.dayOfWeek,
                    openTime: bh.openTime,
                    closeTime: bh.closeTime,
                    isActive: bh.isActive
                }))
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(restaurant: Restaurant){
        return {
            id: restaurant.id.value,
            name: restaurant.name.value,
            description: restaurant.description ?? null,
            logoUrl: restaurant.logoUrl ?? null,
            phone: restaurant.phone,
            address: restaurant.address,
            city: restaurant.city,
            state: restaurant.state,
            zipCode: restaurant.zipCode,
            isOpen: restaurant.isOpen,
            ownerId: restaurant.ownerId.value,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt
        }
    }
}