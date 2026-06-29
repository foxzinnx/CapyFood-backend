import { CreateRestaurantUseCase } from "@/application/use-cases/create-restaurant/create-restaurant.use-case.js";
import { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { RestaurantAlreadyExistsError } from "@/domain/errors/restaurant-already-exists.error.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { InMemoryRestaurantOwnerRepository } from "@/tests/repositories/in-memory-restaurant-owner.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let ownerRepository: InMemoryRestaurantOwnerRepository;
let sut: CreateRestaurantUseCase;

async function makeOwner(){
    const owner = RestaurantOwner.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: 'hashed',
        cnpj: CNPJ.create('11222333000181'),
        phone: '11999999999',
        birthDate: new Date('1990-01-01'),
    });
    await ownerRepository.create(owner);
    return owner;
}

function makeInput(ownerId: string){
    return {
        ownerId,
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
    }
}

describe('CreateRestaurantUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        ownerRepository = new InMemoryRestaurantOwnerRepository();
        sut = new CreateRestaurantUseCase(ownerRepository, restaurantRepository);
    });

    it('should create a restaurant for an existing owner', async () => {
        const owner = await makeOwner();

        const result = await sut.execute(makeInput(owner.id.value));

        expect(result.isRight()).toBe(true);
        expect(restaurantRepository.items).toHaveLength(1);
    });

    it('should create the restaurant closed by default', async () => {
        const owner = await makeOwner();

        await sut.execute(makeInput(owner.id.value));

        expect(restaurantRepository.items).toHaveLength(1);
    });

    it('should not allow creating a restaurant for a non-existing owner', async () => {
        const result = await sut.execute(makeInput('non-existing-id'));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow an owner to create a second restaurant', async () => {
        const owner = await makeOwner();
        await sut.execute(makeInput(owner.id.value));

        const result = await sut.execute(makeInput(owner.id.value));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(RestaurantAlreadyExistsError)
        }
        expect(restaurantRepository.items).toHaveLength(1);
    })
})