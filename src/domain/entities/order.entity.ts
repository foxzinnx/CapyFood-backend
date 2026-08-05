import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";
import type { OrderItem, OrderItemOutputDTO } from "./order-item.entity.js";

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERING'
    | 'DELIVERED'
    | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderProps {
    customerId: UniqueEntityId;
    restaurantId: UniqueEntityId;
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    notes?: string | null;
    payflowTransactionId: string | null;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderOutputDTO {
  id: string
  customerId: string
  restaurantId: string
  status: OrderStatus
  total: number
  notes: string | null
  items: OrderItemOutputDTO[]
  createdAt: Date
  updatedAt: Date
}

export class Order extends Entity<OrderProps>{
    private constructor(props: OrderProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(props: Omit<OrderProps, 'total' | 'status' | 'createdAt' | 'updatedAt'> & { status?: OrderStatus }, id?: UniqueEntityId): Order {
        const validatedItems = Order.validateAndCalculateItems(props.items);

        return new Order(
            {
                ...props,
                items: validatedItems.items,
                total: validatedItems.total,
                status: props.status ?? 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            id
        )
    }

    static reconstitute(props: OrderProps, id: UniqueEntityId): Order {
        return new Order(props, id);
    }

    get customerId(): UniqueEntityId { return this._props.customerId }
    get restaurantId(): UniqueEntityId { return this._props.restaurantId }
    get items(): OrderItem[] { return this._props.items }
    get status(): OrderStatus { return this._props.status }
    get total(): number { return this._props.total }
    get notes(): string | null { return this._props.notes ?? null }
    get payflowTransactionId(): string | null { return this._props.payflowTransactionId }
    get paymentStatus(): PaymentStatus { return this._props.paymentStatus }
    get isPaid(): boolean { return this._props.paymentStatus === 'PAID' }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    linkTransaction(transactionId: string): void {
        this._props.payflowTransactionId = transactionId;
        this._props.paymentStatus = 'PAID';
        this._props.updatedAt = new Date();
    }

    markPaymentFailed(): void {
        this._props.paymentStatus = 'FAILED';
        this._props.status = 'CANCELLED';
        this._props.updatedAt = new Date();
    }

    markPaymentRefunded(): void {
        this._props.paymentStatus = 'REFUNDED';
        this._props.updatedAt = new Date();
    }

    confirm(): void { this.setStatus('CONFIRMED') }
    startPreparing(): void { this.setStatus('PREPARING') }
    markReady(): void { this.setStatus('READY') }
    startDelivering(): void { this.setStatus('DELIVERING') }
    deliver(): void { this.setStatus('DELIVERED') }
    cancel(): void { this.setStatus('CANCELLED') }

    private static validateAndCalculateItems(items: OrderItem[]) {
        if(items.length === 0){
            throw new Error('The order must contain at least one item.')
        }

        const total = parseFloat(
            items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
        );

        return { items, total }
    }

    private setStatus(status: OrderStatus): void {
        this._props.status = status;
        this._props.updatedAt = new Date();
    }

    toOutputDTO(): OrderOutputDTO {
        return {
            id: this.id.value,
            customerId: this._props.customerId.value,
            restaurantId: this._props.restaurantId.value,
            status: this._props.status,
            total: this._props.total,
            notes: this.notes,
            items: this._props.items.map((item) => item.toOutputDTO()),
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt,
        }
    }
}