import type { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import { RestaurantOwnerMapper } from "../mappers/restaurant-owner.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaRestaurantOwnerRepository implements RestaurantOwnerRepository{
    async create(owner: RestaurantOwner): Promise<void> {
        const data = RestaurantOwnerMapper.toPrisma(owner);
        await prisma.restaurantOwner.create({ data });
    }

    async findById(id: string): Promise<RestaurantOwner | null> {
        const raw = await prisma.restaurantOwner.findUnique({
            where: { id }
        });

        if(!raw) return null;

        return RestaurantOwnerMapper.toDomain(raw);
    }

    async findByEmail(email: string): Promise<RestaurantOwner | null> {
        const raw = await prisma.restaurantOwner.findUnique({
            where: { email }
        });

        if(!raw) return null;

        return RestaurantOwnerMapper.toDomain(raw);
    }

    async findByCnpj(cnpj: string): Promise<RestaurantOwner | null> {
        const raw = await prisma.restaurantOwner.findUnique({
            where: { cnpj }
        });

        if(!raw) return null;

        return RestaurantOwnerMapper.toDomain(raw);
    }

    async save(owner: RestaurantOwner): Promise<void> {
        const data = RestaurantOwnerMapper.toPrisma(owner);

        await prisma.restaurantOwner.update({
            where: { id: data.id },
            data
        })
    }

}