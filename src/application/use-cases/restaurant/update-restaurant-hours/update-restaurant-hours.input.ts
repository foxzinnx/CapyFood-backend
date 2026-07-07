import type { BusinessHoursInput } from "./business-hours.input.js";

export interface UpdateRestaurantHoursInput {
    restaurantId: string;
    ownerId: string;
    businessHours: BusinessHoursInput[];
}