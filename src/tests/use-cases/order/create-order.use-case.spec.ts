// src/application/use-cases/order/create-order/__tests__/create-order.use-case.spec.ts

import { CreateOrderUseCase } from '@/application/use-cases/order/create-order/create-order.use-case.js'
import { MenuItemUnavailableError } from '@/domain/errors/menu-item-unavailable.error.js'
import { PaymentFailedError } from '@/domain/errors/payment-failed.error.js'
import { PaymentServiceUnavailableError } from '@/domain/errors/payment-service-unavailable.error.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found.error.js'
import { RestaurantClosedError } from '@/domain/errors/restaurant-closed.error.js'
import { FakePayFlowClient } from '@/tests/fakes/fake-payflow-client.js'
import { FakePayflowService } from '@/tests/fakes/fake-payflow-service.js'
import { makeCustomer, makeMenuItem, makeRestaurant } from '@/tests/helpers/make-order-test-entities.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { InMemoryMenuItemRepository } from '@/tests/repositories/in-memory-menu-item.repository.js'
import { InMemoryOrderRepository } from '@/tests/repositories/in-memory-order.repository.js'
import { InMemoryRestaurantOwnerRepository } from '@/tests/repositories/in-memory-restaurant-owner.repository.js'
import { InMemoryRestaurantRepository } from '@/tests/repositories/in-memory-restaurant.repository.js'
import { beforeEach, describe, expect, it } from 'vitest'

let customerRepository: InMemoryCustomerRepository
let restaurantRepository: InMemoryRestaurantRepository
let menuItemRepository: InMemoryMenuItemRepository
let orderRepository: InMemoryOrderRepository
let ownerRepository: InMemoryRestaurantOwnerRepository
let payFlowClient: FakePayFlowClient
let payFlowService: FakePayflowService
let sut: CreateOrderUseCase

describe('CreateOrderUseCase', () => {
    beforeEach(() => {
      customerRepository = new InMemoryCustomerRepository()
      restaurantRepository = new InMemoryRestaurantRepository()
      menuItemRepository = new InMemoryMenuItemRepository()
      orderRepository = new InMemoryOrderRepository()
      ownerRepository = new InMemoryRestaurantOwnerRepository()
      payFlowClient = new FakePayFlowClient()
      payFlowService = new FakePayflowService()
      sut = new CreateOrderUseCase(
        customerRepository,
        restaurantRepository,
        menuItemRepository,
        orderRepository,
        ownerRepository,
        payFlowService,
        payFlowClient,
      )
    })

    it('should create an order and approve the payment', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 2 }],
        })

        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
          expect(result.value.paymentStatus).toBe('PAID')
        }
        expect(orderRepository.items[0]!.isPaid).toBe(true)
        expect(orderRepository.items[0]!.payflowTransactionId).not.toBeNull()
    })

    it('should calculate the total correctly', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value, { price: 30 })

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 3 }],
        })

        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
          expect(result.value.total).toBe(90)
        }
    })

    it('should register customer and merchant in PayFlow on first order (lazy)', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        expect(customer.isRegisteredInPayFlow).toBe(false)

        await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        const updatedCustomer = await customerRepository.findById(customer.id.value)
        expect(updatedCustomer?.isRegisteredInPayFlow).toBe(true)
        expect(updatedCustomer?.payflowCustomerId).not.toBeNull()
    })

    it('should cancel the order and mark payment as FAILED when payment is denied', async () => {
        payFlowClient.shouldTransactionBeDenied = true
        payFlowClient.denialReason = 'Insufficient funds'

        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(PaymentFailedError)
        }
        expect(orderRepository.items[0]?.paymentStatus).toBe('FAILED')
        expect(orderRepository.items[0]?.status).toBe('CANCELLED')
    })

    it('should cancel the order when PayFlow is unavailable', async () => {
        payFlowClient.shouldFailTransaction = true

        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(PaymentServiceUnavailableError)
        }
        expect(orderRepository.items[0]?.paymentStatus).toBe('FAILED')
    })

    it('should return error when customer registration in PayFlow fails', async () => {
        payFlowService.shouldFailCustomerRegistration = true

        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(PaymentServiceUnavailableError)
        }
    })

    it('should not create an order for a non-existent customer', async () => {
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', {}, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: 'non-existent-id',
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })

    it('should not create an order for a non-existent restaurant', async () => {
        const customer = await makeCustomer(customerRepository)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: 'non-existent-id',
          items: [{ menuItemId: 'any-id', quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })

    it('should not create an order when the restaurant is closed', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', { isOpen: false }, ownerRepository)
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(RestaurantClosedError)
        }
    })

    it('should not create an order with an unavailable menu item', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value, { isAvailable: false })

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: menuItem.id.value, quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(MenuItemUnavailableError)
        }
    })

    it('should not create an order with a non-existent menu item', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')

        const result = await sut.execute({
          customerId: customer.id.value,
          restaurantId: restaurant.id.value,
          items: [{ menuItemId: 'non-existent-id', quantity: 1 }],
        })

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
          expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})