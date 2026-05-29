import { DomainError } from "./domain.error.js"

export class InvalidOrderStatusTransitionError extends DomainError {
    readonly code = 'INVALID_ORDER_STATUS_TRANSITION'

  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`)
    this.name = 'InvalidOrderStatusTransitionError'
  }
}