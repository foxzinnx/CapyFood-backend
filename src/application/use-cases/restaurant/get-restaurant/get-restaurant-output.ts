import type { BusinessHoursOutput } from "./business-hours.output.js";

export interface GetRestaurantOutput{
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    isOpen: boolean;
    businessHours: BusinessHoursOutput[];
}