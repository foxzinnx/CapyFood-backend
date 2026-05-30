import { DomainError } from "./domain.error.js"

export class OrderAlreadyCancelledError extends DomainError {
    readonly code = 'ORDER_ALREADY_CANCELLED'

  constructor() {
    super('This order has already been cancelled')
    this.name = 'OrderAlreadyCancelledError'
  }
}