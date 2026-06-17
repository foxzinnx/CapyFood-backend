import { Name } from "@/domain/value-objects/name.vo.js";
import { describe, expect, it } from "vitest";

describe('Name', () => {
    describe('create', () => {
        it('should create a valid name', () => {
            const name = Name.create('John Doe');

            expect(name.value).toBe('John Doe');
        });

        it('should trim whitespace from the name', () => {
            const name = Name.create('   John Doe  ');

            expect(name.value).toBe('John Doe');
        });

        it('should accept a name with exactly 3 characters', () => {
            const name = Name.create('Joe');

            expect(name.value).toBe('Joe');
        });

        it('should throw when name is empty', () => {
            expect(() => Name.create('')).toThrow();
        });
        
        it('should throw when name has only 1 character', () => {
            expect(() => Name.create('A')).toThrow();
        });

        it('should throw when name is only whitespace', () => {
            expect(() => Name.create('   ')).toThrow();
        });

        it('should throw when name exceeds 100 characters', () => {
            const longName = 'A'.repeat(101);

            expect(() => Name.create(longName)).toThrow()
        });

        it('should accept a name with exactly 100 characters', () => {
            const maxName = 'A'.repeat(100);
            const name = Name.create(maxName);

            expect(name.value).toBe(maxName)
        })
    });

    describe('equals', () => {
        it('should return true when two names have the same value', () => {
            const name1 = Name.create('John Doe');
            const name2 = Name.create('John Doe');

            expect(name1.equals(name2)).toBe(true);
        });

        it('should return false when two names are different', () => {
            const name1 = Name.create('John Doe');
            const name2 = Name.create('Jonas Doe');

            expect(name1.equals(name2)).toBe(false);
        })
    })
})