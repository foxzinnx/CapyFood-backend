import { CannotReviewOwnRestaurantError } from "@/domain/errors/cannot-review-own-restaurant.error.js";
import { CnpjAlreadyInUseError } from "@/domain/errors/cnpj-already-in-use.error.js";
import { CpfAlreadyInUseError } from "@/domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error.js";
import { InvalidOrderStatusTransitionError } from "@/domain/errors/invalid-order-status-transition.error.js";
import { MenuItemUnavailableError } from "@/domain/errors/menu-item-unavailable.error.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { OrderAlreadyCancelledError } from "@/domain/errors/order-already-cancelled.error.js";
import { OrderCannotBeCancelledError } from "@/domain/errors/order-cannot-be-cancelled.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { RestaurantAlreadyExistsError } from "@/domain/errors/restaurant-already-exists.error.js";
import { RestaurantClosedError } from "@/domain/errors/restaurant-closed.error.js";
import { ReviewAlreadyExistsError } from "@/domain/errors/review-already-exists.error.js";
import type { FastifyReply } from "fastify";

export function handleError(error: Error, reply: FastifyReply): FastifyReply {
    if(error instanceof ResourceNotFoundError){
        return reply.status(404).send({ message: error.message });
    }

    if(error instanceof NotAllowedError){
        return reply.status(401).send({ message: error.message });
    }

    if(error instanceof InvalidCredentialsError){
        return reply.status(401).send({ message: error.message });
    }

    if(
        error instanceof EmailAlreadyInUseError ||
        error instanceof CnpjAlreadyInUseError ||
        error instanceof CpfAlreadyInUseError ||
        error instanceof RestaurantAlreadyExistsError ||
        error instanceof ReviewAlreadyExistsError ||
        error instanceof CannotReviewOwnRestaurantError
    ){
        return reply.status(409).send({ message: error.message });
    }

    if(
        error instanceof RestaurantClosedError || 
        error instanceof MenuItemUnavailableError ||
        error instanceof InvalidOrderStatusTransitionError ||
        error instanceof OrderAlreadyCancelledError ||
        error instanceof OrderCannotBeCancelledError
    ){
        return reply.status(422).send({ message: error.message });
    }

    throw error;
}