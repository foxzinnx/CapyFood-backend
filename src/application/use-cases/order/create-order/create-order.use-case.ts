import { MenuItemUnavailableError } from "@/domain/errors/menu-item-unavailable.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { RestaurantClosedError } from "@/domain/errors/restaurant-closed.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CreateOrderOutput } from "./create-order.output.js";
import type { CreateOrderInput } from "./create-order.input.js";
import { OrderItem } from "@/domain/entities/order-item.entity.js";
import { Order } from "@/domain/entities/order.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { PaymentFailedError } from "@/domain/errors/payment-failed.error.js";
import { PaymentServiceUnavailableError } from "@/domain/errors/payment-service-unavailable.error.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import { payflowService } from "@/infrastructure/payment/payflow.service.js";
import { payFlowClient } from "@/infrastructure/payment/payflow.client.js";
import type { PayFlowService } from "@/application/ports/payflow-service.js";
import type { PayFlowClient } from "@/application/ports/payflow-client.js";

type CreateOrderResult = Either<
    | ResourceNotFoundError 
    | RestaurantClosedError 
    | MenuItemUnavailableError
    | PaymentFailedError
    | PaymentServiceUnavailableError,
    CreateOrderOutput
>

export class CreateOrderUseCase {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository,
        private readonly orderRepository: OrderRepository,
        private readonly ownerRepository: RestaurantOwnerRepository,
        private readonly payFlowService: PayFlowService,
        private readonly payFlowClient: PayFlowClient
    ){}

    async execute(input: CreateOrderInput): Promise<CreateOrderResult>{
        const customer = await this.customerRepository.findById(input.customerId);
        if(!customer){
            return left(new ResourceNotFoundError('Customer'));
        }

        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(!restaurant.isOpen){
            return left(new RestaurantClosedError());
        }

        const menuItemIds = input.items.map((i) => i.menuItemId)
        const menuItems = await this.menuItemRepository.findMenuItemsByIds(menuItemIds);

        const orderItems: OrderItem[] = [];

        for(const itemInput of input.items){
            const menuItem = menuItems.find((m) => m.id.value === itemInput.menuItemId)

            if(!menuItem){
                return left(new ResourceNotFoundError('Menu item'));
            }

            if(!menuItem.isAvailable){
                return left(new MenuItemUnavailableError(menuItem.name.value));
            }

            orderItems.push(
                OrderItem.create({
                    menuItemId: menuItem.id,
                    menuItemName: menuItem.name.value,
                    quantity: itemInput.quantity,
                    unitPrice: menuItem.price
                })
            )
        }

        const order = Order.create({
            customerId: new UniqueEntityId(input.customerId),
            restaurantId: new UniqueEntityId(input.restaurantId),
            items: orderItems,
            notes: input.notes ?? null
        });

        await this.orderRepository.create(order);

        const owner = await this.ownerRepository.findById(restaurant.ownerId.value);
        if(!owner){
            order.markPaymentFailed();
            await this.orderRepository.save(order);
            return left(new PaymentServiceUnavailableError());
        }

        const customerPayFlow = await this.payFlowService.ensureCustomerRegistered(
            customer,
            this.customerRepository
        );

        if(customerPayFlow.isLeft()){
            order.markPaymentFailed();
            await this.orderRepository.save(order);
            return left(new PaymentServiceUnavailableError());
        }

        const merchantPayFlow = await this.payFlowService.ensureMerchantRegistered(
            owner,
            restaurant.name.value,
            this.ownerRepository
        );

        if(merchantPayFlow.isLeft()){
            order.markPaymentFailed();
            await this.orderRepository.save(order);
            return left(new PaymentServiceUnavailableError());
        }

        const amountInCents = Math.round(order.total * 100);

        const transactionResult = await this.payFlowClient.createTransaction({
            customerId: customerPayFlow.value.customerId,
            merchantId: merchantPayFlow.value.merchantId,
            amountInCents,
            idempotencyKey: order.id.value,
            description: `CapyFood - order at ${restaurant.name.value}`,
            metadata: {
                orderId: order.id.value,
                restaurantId: restaurant.id.value,
                source: 'capyfood'
            }
        });

        if(transactionResult.isLeft()){
            order.markPaymentFailed();
            await this.orderRepository.save(order);
            return left(new PaymentServiceUnavailableError());
        }

        const transaction = transactionResult.value;

        if(transaction.status === 'FAILED'){
            order.markPaymentFailed();
            await this.orderRepository.save(order);
            return left(
                new PaymentFailedError(transaction.denialReason ?? 'Payment refused')
            )
        }

        order.linkTransaction(transaction.id);
        await this.orderRepository.save(order);

        return right({ 
            orderId: order.id.value,
            total: order.total,
            paymentStatus: order.paymentStatus
        });
    }
}