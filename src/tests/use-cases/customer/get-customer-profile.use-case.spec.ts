import { GetCustomerProfileUseCase } from "@/application/use-cases/customer/get-customer-profile/get-customer-profile.use-case.js";
import { Customer } from "@/domain/entities/customer.entity.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let customerRepository: InMemoryCustomerRepository;
let sut: GetCustomerProfileUseCase;

describe('GetCustomerProfileUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        sut = new GetCustomerProfileUseCase(customerRepository)
    });

    it('should return the customer profile', async () => {
        const customer = Customer.create({
            name: 'Bryan Gomes',
            email: Email.create('bryan@example.com'),
            password: 'hashed-password',
            cpf: CPF.create('52998224725'),
            phone: '11999999999',
            birthDate: new Date('1995-01-01'),
        });
        await customerRepository.create(customer);

        const result = await sut.execute({ customerId: customer.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.name).toBe('Bryan Gomes');
            expect(result.value.email).toBe('bryan@example.com');
            expect(result.value.cpf).toBe('52998224725');
        }
    });

    it('should never expose the password in the output', async () => {
        const customer = Customer.create({
            name: 'Bryan Gomes',
            email: Email.create('bryan@example.com'),
            password: 'hashed-password',
            cpf: CPF.create('52998224725'),
            phone: '11999999999',
            birthDate: new Date('1995-01-01'),
        });
        await customerRepository.create(customer);

        const result = await sut.execute({ customerId: customer.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value).not.toHaveProperty('password')
        }
    });

    it('should return all primitive values, not VOs', async () => {
        const customer = Customer.create({
            name: 'Bryan Gomes',
            email: Email.create('bryan@example.com'),
            password: 'hashed-password',
            cpf: CPF.create('52998224725'),
            phone: '11999999999',
            birthDate: new Date('1995-01-01'),
        });
        await customerRepository.create(customer);

        const result = await sut.execute({ customerId: customer.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(typeof result.value.name).toBe('string');
            expect(typeof result.value.email,).toBe('string');
            expect(typeof result.value.cpf).toBe('string');
        }
    });

    it('should return error for a non-existent customer', async () => {
        const result = await sut.execute({ customerId: 'non-existent-id' });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    }) 
})