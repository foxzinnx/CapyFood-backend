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

type CreateOrderResult = Either<
    ResourceNotFoundError | RestaurantClosedError | MenuItemUnavailableError,
    CreateOrderOutput
>

export class CreateOrderUseCase {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository,
        private readonly orderRepository: OrderRepository
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

        return right({ orderId: order.id.value, total: order.total });
    }
}