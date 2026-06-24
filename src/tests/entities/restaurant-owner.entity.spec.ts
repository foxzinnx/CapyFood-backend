import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { describe, expect, it } from "vitest";

function makeOwnerProps(overrides: Partial<{
    name: string;
    birthDate: Date
}> = {}){
    return {
        name: overrides.name ?? 'John Doe',
        email: Email.create('john@example.com'),
        password: 'hashed-password',
        cnpj: CNPJ.create('11222333000181'),
        phone: '11999999999',
        birthDate: overrides.birthDate ?? new Date('1990-01-01')
    }
}

describe('RestaurantOwner', () => {
    describe('create', () => {
        it('should create a restaurant owner with valid data', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());

            expect(owner.name.value).toBe('John Doe');
            expect(owner.email.value).toBe('john@example.com');
            expect(owner.cnpj.value).toBe('11222333000181');
        });

        it('should set createdAt and updatedAt on creation', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());

            expect(owner.createdAt).toBeInstanceOf(Date);
            expect(owner.updatedAt).toBeInstanceOf(Date);
        });

        it('should trim the name', () => {
            const owner = RestaurantOwner.create(makeOwnerProps({ name: '    John Doe  ' }));

            expect(owner.name.value).toBe('John Doe');
        });

        it('should throw when owner is younger than 18 years old', () => {
            const underageBirthDate = new Date();
            underageBirthDate.setFullYear(underageBirthDate.getFullYear() - 17);

            expect(() => RestaurantOwner.create(makeOwnerProps({ birthDate: underageBirthDate }))).toThrow();
        });

        it('should create owner when exactly 18 years old today', () => {
            const exactlyEighteen = new Date();
            exactlyEighteen.setFullYear(exactlyEighteen.getFullYear() - 18);

            const owner = RestaurantOwner.create(
                makeOwnerProps({ birthDate: exactlyEighteen })
            )

            expect(owner).toBeDefined();
        });

        it('should throw when birthday this year has not happened yet', () => {
            const today = new Date();

            const birthDate = new Date(
                today.getFullYear() - 18,
                today.getMonth() + 1,
                today.getDate()
            )

            expect(() => RestaurantOwner.create(makeOwnerProps({ birthDate }))).toThrow();
        })

        it('should throw when name is empty', () => {
            expect(() => RestaurantOwner.create(makeOwnerProps({ name: '' }))).toThrow();
        })
    });

    describe('updateName', () => {
        it('should update the name and touch updatedAt', async () => {
            const owner = RestaurantOwner.create(makeOwnerProps());
            const previousUpdatedAt = owner.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            owner.updateName('Bryan Joe');
            
            expect(owner.name.value).toBe('Bryan Joe');
            expect(owner.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });

        it('should throw when updating to an invalid name', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());

            expect(() => owner.updateName('')).toThrow();
        })
    });

    describe('updateEmail', () => {
        it('should update the email', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());
            const newEmail = Email.create('new@example.com');

            owner.updateEmail(newEmail);

            expect(owner.email.value).toBe('new@example.com');
        })
    });

    describe('updatePassword', () => {
        it('should update the password', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());

            owner.updatePassword('new-hashed-password');

            expect(owner.password).toBe('new-hashed-password')
        })
    });

    describe('updatePhone', () => {
        it('should update the phone', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());

            owner.updatePhone('11888888888');

            expect(owner.phone).toBe('11888888888');
        })
    });

    describe('updateBirthDate', () => {
        it('should update birthDate when still +18', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());
            const newBirthDate = new Date('1995-05-05');

            owner.updateBirthDate(newBirthDate);

            expect(owner.birthDate).toEqual(newBirthDate)
        });

        it('should throw when updating to an underage birthDate', () => {
            const owner = RestaurantOwner.create(makeOwnerProps());
            const underageBirthDate = new Date();
            underageBirthDate.setFullYear(underageBirthDate.getFullYear() - 10);

            expect(() => owner.updateBirthDate(underageBirthDate)).toThrow();
        })
    })
})