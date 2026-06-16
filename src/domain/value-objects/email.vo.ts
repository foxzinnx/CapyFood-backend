import { InvalidEmailError } from "../errors/invalid-email.error.js";

export class Email {
    private readonly _value: string;

    private constructor(value: string){
        this._value = value;
    }

    static create(value: string): Email {
        const trimmed = value.trim().toLowerCase();
        if(!Email.isValid(trimmed)){
            throw new InvalidEmailError();
        }

        return new Email(trimmed);
    }

    get value(): string {
        return this._value;
    }

    equals(email: Email): boolean {
        return this._value === email.value
    }

    toString(): string {
        return this._value
    }

    private static isValid(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$/;
        if(!emailRegex.test(email)) return false;
        
        const [local, domain] = email.split('@');

        if(local?.startsWith('.') || local?.endsWith('.')) return false;
        if(local?.includes('..')) return false;
        if(domain?.startsWith('-') || domain?.endsWith('-')) return false;
        if(domain?.startsWith('.') || domain?.endsWith('.')) return false;

        return true;
    }
}