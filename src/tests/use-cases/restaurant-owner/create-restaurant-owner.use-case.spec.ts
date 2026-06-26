import { CreateRestaurantOwnerUseCase } from "@/application/use-cases/create-restaurant-owner/create-restaurant-owner.use-case.js";
import { CnpjAlreadyInUseError } from "@/domain/errors/cnpj-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { FakeHasher } from "@/tests/fakes/fake-hasher.js";
import { InMemoryRestaurantOwnerRepository } from "@/tests/repositories/in-memory-restaurant-owner.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let ownerRepository: InMemoryRestaurantOwnerRepository;
let hasher: FakeHasher;
let sut: CreateRestaurantOwnerUseCase;

function makeInput(overrides: Partial<{ email: string; cnpj: string }> = {}){
    return {
        name: 'John Doe',
        email: overrides.email ?? 'john@example.com',
        password: '123456',
        cnpj: overrides.cnpj ?? '11222333000181',
        phone: '11999999999',
        birthDate: new Date('1990-01-01')
    }
}

describe('CreateRestaurantOwnerUseCase', () => {
    beforeEach(() => {
        ownerRepository = new InMemoryRestaurantOwnerRepository();
        hasher = new FakeHasher();
        sut = new CreateRestaurantOwnerUseCase(ownerRepository, hasher)
    });

    it('should create a restaurant owner with valid data', async () => {
        const result = await sut.execute(makeInput());

        expect(result.isRight()).toBe(true);
        expect(ownerRepository.items).toHaveLength(1);
    });

    it('should hash the password before storing', async () => {
        await sut.execute(makeInput());

        expect(ownerRepository.items[0]?.password).toBe('hashed:123456');
    });

    it('should return the created ownerId', async () => {
        const result = await sut.execute(makeInput());

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.ownerId).toBe(ownerRepository.items[0]?.id.value)
        }
    });

    it('should not allow creating an owner with an email already in use', async () => {
        await sut.execute(makeInput());

        const result = await sut.execute(makeInput({ email: 'john@example.com', cnpj: '33536966000105' }));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(EmailAlreadyInUseError)
        }
        expect(ownerRepository.items).toHaveLength(1)
    });

    it('should not allow creating an owner with a CNPJ already in use', async () => {
        await sut.execute(makeInput({ cnpj: '11222333000181' }));

        const result = await sut.execute(makeInput({ email: 'another@example.com', cnpj: '11222333000181' }));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(CnpjAlreadyInUseError)
        }
        expect(ownerRepository.items).toHaveLength(1);
    });

    it('should throw when email format is invalid', async () => {
        await expect(
            sut.execute(makeInput({ email: 'invalid-email' }))
        ).rejects.toThrow();
    });

    it('should throw when CNPJ format is invalid', async () => {
        await expect(
            sut.execute(makeInput({ cnpj: '00000000000000' }))
        ).rejects.toThrow()
    });

    it('should throw when owner is younger than 18 years old', async () => {
        const today = new Date();
        const underageBirthDate = new Date(
            today.getFullYear() - 10,
            today.getMonth(),
            today.getDate()
        );

        await expect(
            sut.execute({ ...makeInput(), birthDate: underageBirthDate })
        ).rejects.toThrow()
    })
})