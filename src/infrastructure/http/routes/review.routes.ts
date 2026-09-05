import type { FastifyInstance } from "fastify";
import { ReviewController } from "../controllers/review-controller.js";
import { authenticateCustomer } from "../middlewares/authenticate.js";

const reviewController = new ReviewController();

export async function reviewRoutes(app: FastifyInstance){
    app.get('/:restaurantId/reviews', reviewController.listRestaurantReviews.bind(reviewController));
    app.post('/:restaurantId/reviews', { preHandler: authenticateCustomer }, reviewController.createReview.bind(reviewController));
    app.put('/:restaurantId/reviews/:reviewId', { preHandler: authenticateCustomer }, reviewController.updateReview.bind(reviewController));
    app.delete('/:restaurantId/reviews/:reviewId', { preHandler: authenticateCustomer }, reviewController.deleteReview.bind(reviewController));
}