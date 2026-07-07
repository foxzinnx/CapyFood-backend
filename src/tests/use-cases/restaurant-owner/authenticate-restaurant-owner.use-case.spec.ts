import { AuthenticateRestaurantOwnerUseCase } from "@/application/use-cases/restaurant-owner/authenticate-restaurant-owner/authenticate-restaurant-owner.use-case.js";
import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { FakeEncrypter } from "@/tests/fakes/fake-encrypter.js";
import { FakeHasher } from "@/tests/fakes/fake-hasher.js";
import { InMemoryRestaurantOwnerRepository } from "@/tests/repositories/in-memory-restaurant-owner.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let ownerRepository: InMemoryRestaurantOwnerRepository;
let hasher: FakeHasher;
let encrypter: FakeEncrypter;
let sut: AuthenticateRestaurantOwnerUseCase;

describe('AuthenticateRestaurantOwnerUseCase', () => {
    beforeEach(async () => {
        ownerRepository = new InMemoryRestaurantOwnerRepository();
        hasher = new FakeHasher();
        encrypter = new FakeEncrypter();
        sut = new AuthenticateRestaurantOwnerUseCase(ownerRepository, hasher, encrypter);

        const owner = RestaurantOwner.create({
            name: 'John Doe',
            email: Email.create('john@example.com'),
            password: await hasher.hash('123456'),
            cnpj: CNPJ.create('88917362000192'),
            phone: '11999999999',
            birthDate: new Date('1990-01-01')
        });

        await ownerRepository.create(owner);
    });

    it('should authenticate with valid credentials', async () => {
        const result = await sut.execute({
            email: 'john@example.com',
            password: '123456'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.accessToken).toBeDefined();
        }
    });

    it('should generate a token with sub and OWNER role', async () => {
        const result = await sut.execute({
            email: 'john@example.com',
            password: '123456'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            const payload = JSON.parse(result.value.accessToken);
            expect(payload.role).toBe('OWNER');
            expect(payload.sub).toBe(ownerRepository.items[0]?.id.value)
        }
    });

    it('should normalize email casing before lookup', async () => {
        const result = await sut.execute({
            email: 'JOHN@EXAMPLE.COM',
            password: '123456',
        });

        expect(result.isRight()).toBe(true);
    });

    it('should not authenticate with a non-existent email', async () => {
        const result = await sut.execute({
            email: 'unknown@example.com',
            password: '123456',
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(InvalidCredentialsError)
        }
    });

    it('should not authenticate with a wrong password', async () => {
        const result = await sut.execute({
            email: 'john@example.com',
            password: '12424144'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(InvalidCredentialsError)
        }
    });

    it('should return the same error for unknown email and wrong password', async () => {
        const resultUnknownEmail = await sut.execute({
            email: 'unknown@example.com',
            password: '123456',
        });

        const resultWrongPassword = await sut.execute({
            email: 'john@example.com',
            password: 'wrong-password',
        });

        expect(resultUnknownEmail.isLeft() && resultWrongPassword.isLeft()).toBe(true);
        if(resultUnknownEmail.isLeft() && resultWrongPassword.isLeft()){
            expect(resultUnknownEmail.value.message).toBe(resultWrongPassword.value.message)
        }
    })
})