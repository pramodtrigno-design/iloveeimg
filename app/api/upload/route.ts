import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/blog-uploads");

        // Ensure directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        // Generate a unique filename using timestamp and original extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.name) || ".jpg";
        const filename = `upload-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, buffer);

        // Return the path relative to public directory for frontend usage
        const publicPath = `/blog-uploads/${filename}`;

        return NextResponse.json({ success: true, url: publicPath }, { status: 201 });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
