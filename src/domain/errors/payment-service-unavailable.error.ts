import { DomainError } from "./domain.error.js";

export class PaymentServiceUnavailableError extends DomainError {
    readonly code = 'PAYMENT_SERVICE_UNAVAILABLE'

    constructor(){
        super('The payment service is currently unavailable. Please try again later.')
    }
}