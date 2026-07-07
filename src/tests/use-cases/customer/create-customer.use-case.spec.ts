import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer/create-customer.use-case.js";
import { CpfAlreadyInUseError } from "@/domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { FakeHasher } from "@/tests/fakes/fake-hasher.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let customerRepository: InMemoryCustomerRepository;
let hasher: FakeHasher;
let sut: CreateCustomerUseCase;

function makeInput(overrides: Partial<{ email: string; cpf: string }> = {}){
    return {
        name: 'Bryan Gomes',
        email: overrides.email ?? 'bryan@example.com',
        password: '123456',
        cpf: overrides.cpf ?? '52998224725',
        phone: '11999999999',
        birthDate: new Date('1995-01-01')
    }
}

describe('CreateCustomerUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        hasher = new FakeHasher();
        sut = new CreateCustomerUseCase(customerRepository, hasher)
    });

    it('should create a customer with valid data', async () => {
        const result = await sut.execute(makeInput());

        expect(result.isRight()).toBe(true);
        expect(customerRepository.items).toHaveLength(1);
    });

    it('should return the created customerId', async () => {
        const result = await sut.execute(makeInput());

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.customerId).toBe(customerRepository.items[0]?.id.value);
        }
    });

    it('should hash the password before storing', async () => {
        await sut.execute(makeInput());

        expect(customerRepository.items[0]?.password).toBe('hashed:123456')
    });

    it('should not allow creating a customer with an email already in use', async () => {
        await sut.execute(makeInput());

        const result = await sut.execute(makeInput({ email: 'bryan@example.com', cpf: '96090297011' }));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(EmailAlreadyInUseError)
        }
        expect(customerRepository.items).toHaveLength(1);
    });

    it('should not allow creating a customer with a CPF already in use', async () => {
        await sut.execute(makeInput());

        const result = await sut.execute(makeInput({ email: 'other@example.com', cpf: '52998224725' }));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(CpfAlreadyInUseError)
        }
        expect(customerRepository.items).toHaveLength(1)
    });

    it('should throw when email format is invalid', async () => {
        await expect(
            sut.execute(makeInput({ email: 'invalid-email' }))
        ).rejects.toThrow()
    });

    it('should throw when CPF is invalid', async () => {
        await expect(
            sut.execute(makeInput({ cpf: '00000000000' }))
        ).rejects.toThrow()
    });

    it('should throw when customer is younger than 18 years old', async () => {
        const underageBirthDate = new Date();
        underageBirthDate.setFullYear(underageBirthDate.getFullYear() - 10);

        await expect(
            sut.execute({ ...makeInput(), birthDate: underageBirthDate })
        ).rejects.toThrow();
    })
})