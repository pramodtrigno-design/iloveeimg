import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, getAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (verifyPassword(password)) {
            const cookieStore = await cookies();
            cookieStore.set("admin_session", getAdminToken(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });

            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
