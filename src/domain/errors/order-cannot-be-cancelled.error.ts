import { DomainError } from "./domain.error.js"

export class OrderCannotBeCancelledError extends DomainError {
    readonly code = 'ORDER_CANNOT_BE_CANCELLED'

    constructor() {
        super('The order cannot be cancelled because it is already being prepared or has been delivered')
        this.name = 'OrderCannotBeCancelledError'
    }
}