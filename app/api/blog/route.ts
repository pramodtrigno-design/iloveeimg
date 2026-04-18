import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/lib/blog";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const { title, slug, excerpt, content, coverImage, author, category, tags } = body;

        if (!title || !content || !excerpt) {
            return NextResponse.json(
                { error: "Title, excerpt, and content are required." },
                { status: 400 }
            );
        }

        const post = createPost({
            title,
            slug,
            excerpt,
            content,
            coverImage: coverImage || "/blog/default-cover.jpg",
            author: author || "iLoveIMG Team",
            category: category || "General",
            tags: tags || [],
        });

        return NextResponse.json({ success: true, post }, { status: 201 });
    } catch (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json(
            { error: "Failed to create blog post." },
            { status: 500 }
        );
    }
}
