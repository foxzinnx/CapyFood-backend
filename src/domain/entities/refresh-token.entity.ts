import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export type UserRole = 'OWNER' | 'CUSTOMER';

export interface RefreshTokenProps {
    userId: UniqueEntityId;
    role: UserRole;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps>{
    private constructor(props: RefreshTokenProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<RefreshTokenProps, 'revokedAt' | 'createdAt'>, id?: UniqueEntityId): RefreshToken {
        return new RefreshToken(
            {
                ...props,
                revokedAt: null,
                createdAt: new Date()
            },
            id
        )
    }

    get userId(): UniqueEntityId { return this._props.userId }
    get role(): UserRole { return this._props.role }
    get tokenHash(): string { return this._props.tokenHash }
    get expiresAt(): Date { return this._props.expiresAt }
    get revokedAt(): Date | null { return this._props.revokedAt }
    get createdAt(): Date { return this._props.createdAt }

    get isExpired(): boolean {
        return new Date() > this._props.expiresAt;
    }

    get isRevoked(): boolean {
        return this._props.revokedAt !== null;
    }

    get isValid(): boolean {
        return !this.isExpired && !this.isRevoked;
    }

    revoke(): void {
        this._props.revokedAt = new Date();
    }
}