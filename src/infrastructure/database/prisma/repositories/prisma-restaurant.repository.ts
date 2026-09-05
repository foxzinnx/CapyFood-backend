import type { Restaurant } from "@/domain/entities/restaurant.entity.js";
import type { ListRestaurantsFilters, PaginatedResult, RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { RestaurantMapper } from "../mappers/restaurant.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaRestaurantRepository implements RestaurantRepository{
    async create(restaurant: Restaurant): Promise<void> {
        const data = RestaurantMapper.toPrisma(restaurant);

        await prisma.restaurant.create({ data });
    }

    async findById(id: string): Promise<Restaurant | null> {
        const raw = await prisma.restaurant.findUnique({
            where: { id },
            include: { businessHours: true }
        });

        if(!raw) return null;

        return RestaurantMapper.toDomain(raw);
    }

    async findByOwnerId(ownerId: string): Promise<Restaurant | null> {
        const raw = await prisma.restaurant.findUnique({
            where: { ownerId },
            include: { businessHours: true }
        });

        if(!raw) return null;

        return RestaurantMapper.toDomain(raw);
    }

    async findByMenuId(menuId: string): Promise<Restaurant | null> {
        const raw = await prisma.restaurant.findFirst({
            where: { menu: { id: menuId } },
            include: { businessHours: true }
        });

        if(!raw) return null;

        return RestaurantMapper.toDomain(raw);
    }

    async list(filters: ListRestaurantsFilters): Promise<PaginatedResult<Restaurant>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;
        const skip = (page - 1) * perPage;

        const where = {
            ...(filters.search && {
                name: { contains: filters.search, mode: 'insensitive' as const },
            }),
            ...(filters.city && {
                city: { contains: filters.city, mode: 'insensitive' as const },
            }),
            ...(filters.isOpen !== undefined && { isOpen: filters.isOpen })
        }

        const [raws, total] = await Promise.all([
            prisma.restaurant.findMany({
                where,
                include: { businessHours: true },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.restaurant.count({ where })
        ]);

        return {
            data: raws.map(RestaurantMapper.toDomain),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async findTopRated(limit: number): Promise<Restaurant[]> {
        const topRated = await prisma.review.groupBy({
            by: ['restaurantId'],
            _avg: { rating: true },
            _count: { rating: true },
            orderBy: { _avg: { rating: 'desc' } },
            take: limit
        });

        const restaurantIds = topRated.map((r) => r.restaurantId);

        const raws = await prisma.restaurant.findMany({
            where: { id: { in: restaurantIds } },
            include: { businessHours: true }
        });

        return restaurantIds
            .map((id) => raws.find((r) => r.id === id))
            .filter(Boolean)
            .map((raw) => RestaurantMapper.toDomain(raw!))
    }

    async save(restaurant: Restaurant): Promise<void> {
        const data = RestaurantMapper.toPrisma(restaurant);

        await prisma.$transaction([
            prisma.restaurant.update({
                where: { id: data.id },
                data
            }),
            prisma.businessHours.deleteMany({
                where: { restaurantId: data.id }
            }),
            prisma.businessHours.createMany({
                data: restaurant.businessHours.map((bh) => ({
                    restaurantId: data.id,
                    dayOfWeek: bh.dayOfWeek,
                    openTime: bh.openTime,
                    closeTime: bh.closeTime,
                    isActive: bh.isActive
                }))
            })
        ])
    }

    async delete(id: string): Promise<void> {
        await prisma.restaurant.delete({ where: { id } });
    }

}