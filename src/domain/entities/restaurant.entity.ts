import { Name } from "../value-objects/name.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface BusinessHoursProps {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isActive: boolean;
}

export interface RestaurantProps {
    name: Name;
    description?: string | null;
    logoUrl?: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    isOpen: boolean;
    ownerId: UniqueEntityId;
    businessHours?: BusinessHoursProps[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RestaurantOutputDTO {
  id: string
  name: string
  description?: string | null
  logoUrl?: string | null
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isOpen: boolean
  businessHours: BusinessHoursProps[]
  createdAt: Date
  updatedAt: Date
}

export class Restaurant extends Entity<RestaurantProps>{
    private constructor(props: RestaurantProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<RestaurantProps, 'createdAt' | 'updatedAt' | 'name'> & { name: string }, id?: UniqueEntityId): Restaurant {
        const name = Name.create(props.name)
        
        return new Restaurant(
            {
                ...props,
                name,
                isOpen: props.isOpen ?? false,
                businessHours: props.businessHours ?? [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            id
        )
    }

    get name(): Name { return this._props.name }
    get description(): string | null { return this._props.description ?? null }
    get logoUrl(): string | null { return this._props.logoUrl ?? null }
    get phone(): string { return this._props.phone }
    get address(): string { return this._props.address }
    get city(): string { return this._props.city }
    get state(): string { return this._props.state }
    get zipCode(): string { return this._props.zipCode }
    get isOpen(): boolean { return this._props.isOpen }
    get ownerId(): UniqueEntityId { return this._props.ownerId }
    get businessHours(): BusinessHoursProps[] { return this._props.businessHours ?? [] }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    open(): void {
        this._props.isOpen = true;
        this.touch();
    }

    close(): void {
        this._props.isOpen = false;
        this.touch();
    }

    toggleStatus(): void {
        this._props.isOpen = !this._props.isOpen;
        this.touch();
    }

    updateLogo(logoUrl: string): void {
        this._props.logoUrl = logoUrl;
        this.touch();
    }

    updateBusinessHours(hours: BusinessHoursProps[]): void {
        this._props.businessHours = hours;
        this.touch();
    }

    updateInfo(data: Partial<Pick<RestaurantProps, 'name' | 'description' | 'phone' | 'address' | 'city' | 'state' | 'zipCode'>>): void {
        Object.assign(this._props, data);
        this.touch()
    }

    toOutputDTO(): RestaurantOutputDTO {
        return {
            id: this.id.value,
            name: this._props.name.value,
            description: this._props.description ?? null,
            logoUrl: this._props.logoUrl ?? null,
            phone: this._props.phone,
            address: this._props.address,
            city: this._props.city,
            state: this._props.state,
            zipCode: this._props.zipCode,
            isOpen: this._props.isOpen,
            businessHours: this._props.businessHours ?? [],
            createdAt: this._props.createdAt!,
            updatedAt: this._props.updatedAt!,
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}