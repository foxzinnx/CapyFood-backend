import { DomainError } from "./domain.error.js";

export class PaymentFailedError extends DomainError {
    readonly code = 'PAYMENT_FAILED';

    constructor(readonly reason: string){
        super(`Payment failed: ${reason}`)
    }
}