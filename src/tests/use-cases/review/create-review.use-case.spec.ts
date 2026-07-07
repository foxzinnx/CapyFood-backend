import { CreateReviewUseCase } from "@/application/use-cases/create-review/create-review.use-case.js"
import { Customer } from "@/domain/entities/customer.entity.js"
import { Restaurant } from "@/domain/entities/restaurant.entity.js"
import { CannotReviewOwnRestaurantError } from "@/domain/errors/cannot-review-own-restaurant.error.js"
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js"
import { ReviewAlreadyExistsError } from "@/domain/errors/review-already-exists.error.js"
import { CPF } from "@/domain/value-objects/cpf.vo.js"
import { Email } from "@/domain/value-objects/email.vo.js"
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js"
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js"
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js"
import { InMemoryReviewRepository } from "@/tests/repositories/in-memory-review.repository.js"
import { beforeEach, describe, expect, it } from "vitest"

let customerRepository: InMemoryCustomerRepository
let restaurantRepository: InMemoryRestaurantRepository
let reviewRepository: InMemoryReviewRepository
let sut: CreateReviewUseCase

async function makeCustomer(
  customerRepository: InMemoryCustomerRepository,
  overrides: Partial<{ email: string; cpf: string }> = {},
): Promise<Customer> {
  const customer = Customer.create({
    name: 'Bryan Gomes',
    email: Email.create(overrides.email ?? 'bryan@example.com'),
    password: 'hashed-password',
    cpf: CPF.create(overrides.cpf ?? '52998224725'),
    phone: '11999999999',
    birthDate: new Date('1995-01-01'),
  })
  await customerRepository.create(customer)
  return customer
}

async function makeRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    ownerId: string
): Promise<Restaurant> {
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

describe('CreateReviewUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository()
        restaurantRepository = new InMemoryRestaurantRepository()
        reviewRepository = new InMemoryReviewRepository()
        sut = new CreateReviewUseCase(
        customerRepository,
        restaurantRepository,
        reviewRepository,
        )
    });

    it('should create a review with valid data', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            rating: 5,
            description: 'Ótima comida.'
        });

        expect(result.isRight()).toBe(true);
        expect(reviewRepository.items).toHaveLength(1)
    });

    it('should create a review without description', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            rating: 5
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBeNull();
        }
        expect(reviewRepository.items).toHaveLength(1)
    });

    it('should return the review output DTO', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            rating: 5
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(typeof result.value.rating).toBe('number');
            expect(result.value.customerId).toBe(customer.id.value);
            expect(result.value.restaurantId).toBe(restaurant.id.value)
        }
    });

    it('should not allow a customer to review the same restaurant twice', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            rating: 3
        });

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            rating: 5
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ReviewAlreadyExistsError)
        }
        expect(reviewRepository.items).toHaveLength(1);
    });

    it('should not allow the owner to review their own restaurant', async () => {
        const owner = await makeCustomer(customerRepository, { email: 'other@example.com', cpf: '71428793860' });
        const restaurant = await makeRestaurant(restaurantRepository, owner.id.value);

        const result = await sut.execute({
            customerId: owner.id.value,
            restaurantId: restaurant.id.value,
            rating: 5
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(CannotReviewOwnRestaurantError)
        }
    });

    it('should not create a review for a non-existent customer', async () => {
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            customerId: 'non-existent',
            restaurantId: restaurant.id.value,
            rating: 5
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not create a review for a non-existent restaurant', async () => {
        const customer = await makeCustomer(customerRepository);

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: 'non-existent',
            rating: 5
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should throw when rating is out of range', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        await expect(
            sut.execute({
                customerId: customer.id.value,
                restaurantId: restaurant.id.value,
                rating: 6
            })
        ).rejects.toThrow()
    })
})