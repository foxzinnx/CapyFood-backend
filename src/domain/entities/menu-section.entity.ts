import type { MenuSectionOutputDTO } from "@/application/use-cases/menu-section/menu-section.output.js";
import { Name } from "../value-objects/name.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface MenuSectionProps {
    name: Name;
    description?: string | null;
    position: number;
    isActive: boolean;
    menuId: UniqueEntityId;
    createdAt: Date;
    updatedAt: Date;
};

export class MenuSection extends Entity<MenuSectionProps>{
    private constructor(props: MenuSectionProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<MenuSectionProps, 'createdAt' | 'updatedAt' | 'name'> & { name: string }, id?: UniqueEntityId): MenuSection {
        const name = Name.create(props.name);
        const now = new Date();

        return new MenuSection(
            {
                ...props,
                name,
                isActive: props.isActive ?? true,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    get name(): Name { return this._props.name }
    get description(): string | null { return this._props.description ?? null }
    get position(): number { return this._props.position }
    get isActive(): boolean { return this._props.isActive }
    get menuId(): UniqueEntityId { return this._props.menuId }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    updateDetails(data: { name?: string; description?: string | null }): void {
        if(data.name !== undefined){
            this._props.name = Name.create(data.name);
        }
        if(data.description !== undefined){
            this._props.description = data.description;
        }
        this.touch();
    }

    updatePosition(position: number): void {
        this._props.position = position;
        this.touch();
    }

    activate(): void {
        this._props.isActive = true;
        this.touch();
    }

    deactivate(): void {
        this._props.isActive = false;
        this.touch();
    }

    toOutputDTO(): MenuSectionOutputDTO {
        return {
            id: this.id.value,
            name: this._props.name.value,
            description: this._props.description ?? null,
            position: this._props.position,
            isActive: this._props.isActive,
            menuId: this._props.menuId.value,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}