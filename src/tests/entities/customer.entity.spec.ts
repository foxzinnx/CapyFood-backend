import { Customer } from "@/domain/entities/customer.entity.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { describe, expect, it } from "vitest";

function makeCustomerProps(overrides: Partial<{
    name: string;
    birthDate: Date;
}> = {}){
    return {
        name: overrides.name ?? 'Bryan Joe',
        email: Email.create('bryan@example.com'),
        password: 'hashed-password',
        cpf: CPF.create('38580460000'),
        phone: '11999999999',
        birthDate: overrides.birthDate ?? new Date('1995-01-01')
    }
}

describe('Customer', () => {
    describe('create', () => {
        it('should create a customer with valid data', () => {
            const customer = Customer.create(makeCustomerProps());

            expect(customer.name.value).toBe('Bryan Joe');
            expect(customer.email.value).toBe('bryan@example.com');
            expect(customer.cpf.value).toBe('38580460000');
        });

        it('should set createdAt and updatedAt on creation', () => {
            const customer = Customer.create(makeCustomerProps());

            expect(customer.createdAt).toBeInstanceOf(Date);
            expect(customer.updatedAt).toBeInstanceOf(Date);
        });

        it('should throw when customer is younger than 18 years old', () => {
            const underageBirthDate = new Date();
            underageBirthDate.setFullYear(underageBirthDate.getFullYear() - 17);

            expect(() =>
                Customer.create(makeCustomerProps({ birthDate: underageBirthDate }))
            ).toThrow();
        });

        it('should throw when name is invalid', () => {
            expect(() => Customer.create(makeCustomerProps({ name: 'J' }))).toThrow();
        });
    });

    describe('updateName', () => {
        it('should update the name', () => {
            const customer = Customer.create(makeCustomerProps());

            customer.updateName('New Name');

            expect(customer.name.value).toBe('New Name');
        })
    });

    describe('updateEmail', () => {
        it('should update the email', () => {
            const customer = Customer.create(makeCustomerProps());
            const newEmail = Email.create('new@example.com');

            customer.updateEmail(newEmail);

            expect(customer.email.value).toBe('new@example.com');
        })
    });

    describe('updatePassword', () => {
        it('should update the password', () => {
            const customer = Customer.create(makeCustomerProps());

            customer.updatePassword('new-hashed-password');

            expect(customer.password).toBe('new-hashed-password');
        });
    });

    describe('updateBirthDate', () => {
        it('should throw when updating to an underage birthDate', () => {
            const customer = Customer.create(makeCustomerProps());
            const underageBirthDate = new Date();
            underageBirthDate.setFullYear(underageBirthDate.getFullYear() - 5);

            expect(() => customer.updateBirthDate(underageBirthDate)).toThrow();
        });

        it('should update birthDate when still +18', () => {
            const customer = Customer.create(makeCustomerProps());
            const newBirthDate = new Date('1990-03-03');

            customer.updateBirthDate(newBirthDate);

            expect(customer.birthDate).toEqual(newBirthDate)
        })
    });

    describe('toOutputDTO', () => {
        it('should return primitive values, never exposing password', () => {
            const customer = Customer.create(makeCustomerProps());

            const dto = customer.toOutputDTO();

            expect(dto).toEqual({
                id: customer.id.value,
                name: 'Bryan Joe',
                email: 'bryan@example.com',
                cpf: '38580460000',
                phone: '11999999999',
                birthDate: customer.birthDate,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt
            });

            expect(dto).not.toHaveProperty('password')
        })
    })
})