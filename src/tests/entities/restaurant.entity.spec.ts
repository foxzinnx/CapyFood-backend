import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

function makeRestaurantProps(overrides: Partial<{ isOpen: boolean }> = {}){
    return {
        name: 'Capybaras Restaurant',
        description: 'Best pizza in town',
        phone: '11999999999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: overrides.isOpen ?? false,
        ownerId: new UniqueEntityId()
    }
}

describe('Restaurant', () => {
    describe('create', () => {
        it('should create a restaurant with valid data', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            expect(restaurant.name.value).toBe('Capybaras Restaurant');
            expect(restaurant.city).toBe('São Paulo');
        });

        it('should default isOpen to false when not provided', () => {
            const props = makeRestaurantProps();
            const restaurant = Restaurant.create({ ...props, isOpen: undefined as unknown as boolean });

            expect(restaurant.isOpen).toBe(false);
        });

        it('should default businessHours to an empty array', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            expect(restaurant.businessHours).toEqual([]);
        });

        it('should set createdAt and updatedAt on creation', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            expect(restaurant.createdAt).toBeInstanceOf(Date);
            expect(restaurant.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('open / close / toggleStatus', () => {
        it('should open the restaurant', () => {
            const restaurant = Restaurant.create(makeRestaurantProps({ isOpen: false }));

            restaurant.open();

            expect(restaurant.isOpen).toBe(true);
        });

        it('should close the restaurant', () => {
            const restaurant = Restaurant.create(makeRestaurantProps({ isOpen: true }));

            restaurant.close();

            expect(restaurant.isOpen).toBe(false);
        });

        it('should toggle from closed to open', () => {
            const restaurant = Restaurant.create(makeRestaurantProps({ isOpen: false }));

            restaurant.toggleStatus();

            expect(restaurant.isOpen).toBe(true);
        });

        it('should toggle from open to closed', () => {
            const restaurant = Restaurant.create(makeRestaurantProps({ isOpen: true }));

            restaurant.toggleStatus();

            expect(restaurant.isOpen).toBe(false);
        });

        it('should update updatedAt when status change', async () => {
            const restaurant = Restaurant.create(makeRestaurantProps());
            const previousUpdatedAt = restaurant.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            restaurant.toggleStatus();

            expect(restaurant.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });
    });

    describe('updateLogo', () => {
        it('should update the logo URL', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            restaurant.updateLogo('https://example.com/logo.png');

            expect(restaurant.logoUrl).toBe('https://example.com/logo.png');
        });
    });

    describe('updateBusinessHours', () => {
        it('should replace business hours entirely', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            const newHours = [
                { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isActive: true },
                { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isActive: true },
            ]

            restaurant.updateBusinessHours(newHours);

            expect(restaurant.businessHours).toHaveLength(2);
            expect(restaurant.businessHours[0]?.dayOfWeek).toBe(1);
        });

        it('should allow clearing all business hours', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            restaurant.updateBusinessHours([
                {dayOfWeek: 1, openTime: '18:00', closeTime: '18:00', isActive: true}
            ]);
            restaurant.updateBusinessHours([]);

            expect(restaurant.businessHours).toEqual([]);
        });
    });

    describe('updateInfo', () => {
        it('should update only the provided fields', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            restaurant.updateInfo({ name: 'New Name', city: 'Rio de Janeiro' });

            expect(restaurant.name.value).toBe('New Name');
            expect(restaurant.city).toBe('Rio de Janeiro');
            expect(restaurant.state).toBe('SP');
        });

        it('should update updatedAt', async () => {
            const restaurant = Restaurant.create(makeRestaurantProps());
            const previousUpdatedAt = restaurant.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            restaurant.updateInfo({ name: 'Updated Name' });

            expect(restaurant.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });
    });

    describe('toOutputDTO', () => {
        it('should expose id as a primitive string and businessHours as an array', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());

            const dto = restaurant.toOutputDTO();

            expect(typeof dto.id).toBe('string');
            expect(dto.id).toBe(restaurant.id.value);
            expect(dto.businessHours).toEqual([]);
        });

        it('should include businessHours in the DTO', () => {
            const restaurant = Restaurant.create(makeRestaurantProps());
            restaurant.updateBusinessHours([
                { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isActive: true }
            ]);

            const dto = restaurant.toOutputDTO();

            expect(dto.businessHours).toHaveLength(1);
        })
    })
})