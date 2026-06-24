import { InvalidPriceError } from "../errors/invalid-price.error.js";
import { Name } from "../value-objects/name.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface MenuItemProps {
    name: Name;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    isAvailable: boolean;
    menuId: UniqueEntityId;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItemOutputDTO {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    isAvailable: boolean;
    menuId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UpdateMenuItemDetails{
    name?: string | undefined;
    description?: string | null | undefined;
    price?: number | undefined;
}

export class MenuItem extends Entity<MenuItemProps>{
    private constructor(props: MenuItemProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(props: Omit<MenuItemProps, 'createdAt' | 'updatedAt' | 'name'> & { name: string }, id?: UniqueEntityId): MenuItem {
        if(props.price <= 0){
            throw new Error('The item\'s price must be greater than zero.')
        }
        const name = Name.create(props.name)

        return new MenuItem(
            {
                ...props,
                name,
                isAvailable: props.isAvailable ?? true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            id
        )
    }

    get name(): Name { return this._props.name }
    get description(): string | null { return this._props.description ?? null }
    get price(): number { return this._props.price }
    get imageUrl(): string | null { return this._props.imageUrl ?? null }
    get isAvailable(): boolean { return this._props.isAvailable }
    get menuId(): UniqueEntityId { return this._props.menuId }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    updateImage(imageUrl: string): void {
        this._props.imageUrl = imageUrl;
        this.touch();
    }

    updateDetails(data: UpdateMenuItemDetails): void {
        if(data.name !== undefined){
            this._props.name = Name.create(data.name);
        }

        if(data.description !== undefined){
            this._props.description = data.description
        }

        if(data.price !== undefined){
            if(data.price <= 0) throw new InvalidPriceError();
            this._props.price = data.price
        }
        this.touch();
    }

    enable(): void {
        this._props.isAvailable = true;
        this.touch();
    }

    disable(): void {
        this._props.isAvailable = false;
        this.touch();
    }

    toOutputDTO(): MenuItemOutputDTO {
        return {
            id: this.id.value,
            name: this._props.name.value,
            description: this._props.description ?? null,
            price: this._props.price,
            imageUrl: this._props.imageUrl ?? null,
            isAvailable: this._props.isAvailable,
            menuId: this._props.menuId.value,
            createdAt: this._props.createdAt!,
            updatedAt: this._props.updatedAt!
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}