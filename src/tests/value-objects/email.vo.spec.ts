import { Email } from "@/domain/value-objects/email.vo.js";
import { describe, expect, it } from "vitest";

describe('Email', () => {
    describe('create', () => {
        it('should create a valid email', () => {
            const email = Email.create('john@gmail.com');

            expect(email.value).toBe('john@gmail.com');
        });

        it('should normalize email to lowercase', () => {
            const email = Email.create('John@gmail.COM');

            expect(email.value).toBe('john@gmail.com');
        });

        it('should trim whitespace', () => {
            const email = Email.create('   john@gmail.com   ');

            expect(email.value).toBe('john@gmail.com');
        });

        it('should accept email with subdomain', () => {
            const email = Email.create('john@email.example.com');

            expect(email.value).toBe('john@email.example.com');
        });

        it('should accept email with plus sign', () => {
            const email = Email.create('john+test@example.com');

            expect(email.value).toBe('john+test@example.com');
        });

        it('should throw when email has no @', () => {
            expect(() => Email.create('johnexample.com')).toThrow('Invalid email');
        });

        it('should throw when email has no domain', () => {
            expect(() => Email.create('john@')).toThrow('Invalid email');
        });

        it('should throw when email starts with dot', () => {
            expect(() => Email.create('.john@example.com')).toThrow('Invalid email')
        });

        it('should throw when email has consecutive dots', () => {
            expect(() => Email.create('jo..hn@example.com')).toThrow('Invalid email')
        });

        it('should throw when email is empty', () => {
            expect(() => Email.create('')).toThrow('Invalid email');
        })
    })

    describe('equals', () => {
        it('should return true when two emails have the same value', () => {
            const email1 = Email.create('john@example.com');
            const email2 = Email.create('john@example.com');

            expect(email1.equals(email2)).toBe(true);
        });

        it('should return false when two emails are different', () => {
            const email1 = Email.create('john@example.com');
            const email2 = Email.create('johndoe@example.com');

            expect(email1.equals(email2)).toBe(false);
        })
    })
})