import { cookies } from "next/headers";

const ADMIN_TOKEN = "admin_authenticated";
// In production, use environment variables: process.env.ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "iloveeimg@456";

/** Checks if the current request is authenticated as admin */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    return token === ADMIN_TOKEN;
}

/** Verify password (used by login route) */
export function verifyPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}

/** Get the secure token value */
export function getAdminToken(): string {
    return ADMIN_TOKEN;
}
