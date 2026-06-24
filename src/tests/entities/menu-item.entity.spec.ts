import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

function makeMenuItemProps(overrides: Partial<{ name: string; price: number}> = {}){
    return {
        name: overrides.name ?? 'Pizza de Calabresa',
        description: 'Pizza de Calabresa brasileira',
        price: overrides.price ?? 39.9,
        imageUrl: null,
        isAvailable: true,
        menuId: new UniqueEntityId()
    }
}

describe('MenuItem', () => {
    describe('create', () => {
        it('should create a menu item with valid data', () => {
            const item = MenuItem.create(makeMenuItemProps());

            expect(item.name.value).toBe('Pizza de Calabresa');
            expect(item.price).toBe(39.9);
            expect(item.isAvailable).toBe(true);
        });

        it('should set createdAt and updatedAt on creation', () => {
            const item = MenuItem.create(makeMenuItemProps());

            expect(item.createdAt).toBeInstanceOf(Date);
            expect(item.updatedAt).toBeInstanceOf(Date);
        });

        it('should default isAvailable to true when not provided', () => {
            const props = makeMenuItemProps();
            const item = MenuItem.create({ ...props, isAvailable: undefined as unknown as boolean });

            expect(item.isAvailable).toBe(true);
        });

        it('should throw when price is zero', () => {
            expect(() => MenuItem.create(makeMenuItemProps({ price: 0 }))).toThrow('The item\'s price must be greater than zero.')
        });

        it('should throw when price is negative', () => {
            expect(() => MenuItem.create(makeMenuItemProps({ price: -10 }))).toThrow('The item\'s price must be greater than zero.')
        });

        it('should throw when name is invalid', () => {
            expect(() => MenuItem.create(makeMenuItemProps({ name: 'P' }))).toThrow()
        })
    });

    describe('updateImage', () => {
        it('should update the image url', () => {
            const item = MenuItem.create(makeMenuItemProps());

            item.updateImage('https://capyfood.com.br/images/imagem.jpg');

            expect(item.imageUrl).toBe('https://capyfood.com.br/images/imagem.jpg')
        })
    });

    describe('updateDetails', () => {
        it('should update name, description and price', () => {
            const item = MenuItem.create(makeMenuItemProps());

            item.updateDetails({
                name: 'Pizza Pepperoni',
                description: 'Diretamente da Italia',
                price: 45
            });

            expect(item.name.value).toBe('Pizza Pepperoni');
            expect(item.description).toBe('Diretamente da Italia');
            expect(item.price).toBe(45);
        });

        it('should update only the provided fields', () => {
            const item = MenuItem.create(makeMenuItemProps());

            item.updateDetails({ price: 50 });

            expect(item.name.value).toBe('Pizza de Calabresa');
            expect(item.price).toBe(50);
        });

        it('should throw when updating to an invalid price', () => {
            const item = MenuItem.create(makeMenuItemProps());

            expect(() => item.updateDetails({ price: -5 })).toThrow('Invalid price')
        });

        it('should throw when updating to an invalid name', () => {
            const item = MenuItem.create(makeMenuItemProps());

            expect(() => item.updateDetails({ name: '' })).toThrow();
        });
    });

    describe('enable / disable', () => {
        it('should disable the item', () => {
            const item = MenuItem.create(makeMenuItemProps());

            item.disable();

            expect(item.isAvailable).toBe(false);
        });

        it('should enable the item again', () => {
            const item = MenuItem.create(makeMenuItemProps());

            item.disable();
            item.enable();

            expect(item.isAvailable).toBe(true);
        })
    });

    describe('toOutputDTO', () => {
        it('should return name as a primitive string, not the name VO', () => {
            const item = MenuItem.create(makeMenuItemProps());

            const dto = item.toOutputDTO();

            expect(typeof dto.name).toBe('string');
            expect(dto.name).toBe('Pizza de Calabresa')
        })
    })
})