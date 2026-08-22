import { MenuSection } from "@/domain/entities/menu-section.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

function makeSectionProps(overrides: Partial<{ name: string; position: number }> = {}){
    return {
        name: overrides.name ?? 'Combos do momento',
        description: 'Se tem combo esquece! É na CapyFood.',
        position: overrides.position ?? 0,
        isActive: true,
        menuId: new UniqueEntityId()
    }
}

describe('MenuSection', () => {
    describe('create', () => {
        it('should create a menu section with valid data', () => {
            const section = MenuSection.create(makeSectionProps());

            expect(section.name.value).toBe('Combos do momento');
            expect(section.position).toBe(0);
            expect(section.isActive).toBe(true);
        });

        it('should set createdAt and updatedAt on creation', () => {
            const section = MenuSection.create(makeSectionProps());

            expect(section.createdAt).toBeInstanceOf(Date);
            expect(section.updatedAt).toBeInstanceOf(Date);
        });

        it('should default isActive to true when not provided', () => {
            const props = makeSectionProps();
            const section = MenuSection.create({
                ...props,
                isActive: undefined as unknown as boolean
            });

            expect(section.isActive).toBe(true);
        });

        it('should create section without description', () => {
            const section = MenuSection.create({
                name: 'Combos do momento',
                position: 0,
                isActive: true,
                menuId: new UniqueEntityId()
            });

            expect(section.description).toBeNull();
        });

        it('should throw when name is too short', () => {
            expect(() => MenuSection.create(makeSectionProps({ name: 'A' }))).toThrow();
        });

        it('should throw when name is empty', () => {
            expect(() => MenuSection.create(makeSectionProps({ name: '' }))).toThrow();
        });
    });

    describe('updateDetails', () => {
        it('should update the name', () => {
            const section = MenuSection.create(makeSectionProps());
            
            section.updateDetails({ name: 'Lançamentos' });

            expect(section.name.value).toBe('Lançamentos');
        });

        it('should update the description', () => {
            const section = MenuSection.create(makeSectionProps());

            section.updateDetails({ description: 'Atualizada' });

            expect(section.description).toBe('Atualizada');
        });

        it('should set description to null when explictly passed as null', () => {
            const section = MenuSection.create(makeSectionProps());
            
            section.updateDetails({ description: null });

            expect(section.description).toBeNull();
        });

        it('should keep current values when only one field is updated', () => {
            const section = MenuSection.create(makeSectionProps());

            section.updateDetails({ name: 'Atualizado' });

            expect(section.name.value).toBe('Atualizado');
            expect(section.description).toBe('Se tem combo esquece! É na CapyFood.');
        });

        it('should update updatedAt when details change', async () => {
            const section = MenuSection.create(makeSectionProps());
            const previousUpdatedAt = section.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            section.updateDetails({ name: 'Novo nome' });

            expect(section.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });

        it('should throw when updating to an invalid name', () => {
            const section = MenuSection.create(makeSectionProps());

            expect(() => section.updateDetails({ name: 'A' })).toThrow();
        });
    });

    describe('updatePosition', () => {
        it('should update the position', () => {
            const section = MenuSection.create(makeSectionProps({ position: 0 }));

            section.updatePosition(3);

            expect(section.position).toBe(3);
        });

        it('should update updatedAt when position changes', async () => {
            const section = MenuSection.create(makeSectionProps());
            const previousUpdatedAt = section.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            section.updatePosition(2);

            expect(section.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });
    });

    describe('activate / deactivate', () => {
        it('should deactivate the section', () => {
            const section = MenuSection.create(makeSectionProps());

            section.deactivate();

            expect(section.isActive).toBe(false);
        });

        it('should activate the section again', () => {
            const section = MenuSection.create({ ...makeSectionProps(), isActive: false });

            section.activate();

            expect(section.isActive).toBe(true);
        });
    });

    describe('toOutputDTO', () => {
        it('should return name as primitive string, not the Name VO', () => {
            const section = MenuSection.create(makeSectionProps());

            const dto = section.toOutputDTO();

            expect(typeof dto.name).toBe('string');
            expect(dto.name).toBe('Combos do momento');
        });

        it('should return all fields correctly', () => {
            const menuId = new UniqueEntityId();
            const section = MenuSection.create({
                name: 'Combos do momento',
                description: 'Os melhores combos',
                position: 0,
                isActive: true,
                menuId
            });

            const dto = section.toOutputDTO();

            expect(dto.id).toBe(section.id.value);
            expect(dto.name).toBe('Combos do momento');
            expect(dto.description).toBe('Os melhores combos');
            expect(dto.position).toBe(0);
            expect(dto.isActive).toBe(true);
            expect(dto.menuId).toBe(menuId.value);
        })
    })
})