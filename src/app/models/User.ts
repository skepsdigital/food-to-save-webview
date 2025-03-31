export interface User {
    sub: string;
    iat: number;
    name: string | null;
    email: string | null;
    phone: string;
    exp: number;
    iss: string;
}