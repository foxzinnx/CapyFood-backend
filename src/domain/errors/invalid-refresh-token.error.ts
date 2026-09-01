import { DomainError } from "./domain.error.js";

export class InvalidRefreshTokenError extends DomainError {
    readonly code = 'INVALID_REFRESH_TOKEN';

    constructor(){
        super('Invalid refresh token');
    }
}