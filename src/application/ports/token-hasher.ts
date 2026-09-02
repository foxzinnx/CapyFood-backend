export interface TokenHasher {
    hash(token: string): string;
    generateToken(): string;
}