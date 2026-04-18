import fs from "fs";
import path from "path";

/* ── Types ──────────────────────────────────────────────── */
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: string;
    category: string;
    tags: string[];
    publishedAt: string;
    updatedAt: string;
    readingTime: number;
}

export interface PaginatedResult {
    posts: BlogPost[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/* ── File path ──────────────────────────────────────────── */
const DATA_FILE = path.join(process.cwd(), "src/data/blogs.json");

function readPosts(): BlogPost[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw) as BlogPost[];
    } catch {
        return [];
    }
}

function writePosts(posts: BlogPost[]): void {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

/* ── Public API ─────────────────────────────────────────── */

/** Get paginated blog posts, newest first */
export function getPaginatedPosts(page = 1, pageSize = 6): PaginatedResult {
    const all = readPosts().sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
        posts: all.slice(start, start + pageSize),
        total,
        page: safePage,
        pageSize,
        totalPages,
    };
}

/** Get a single post by slug */
export function getPostBySlug(slug: string): BlogPost | null {
    return readPosts().find((p) => p.slug === slug) ?? null;
}

/** Get all slugs (for generateStaticParams) */
export function getAllSlugs(): string[] {
    return readPosts().map((p) => p.slug);
}

/** Get all unique categories */
export function getCategories(): string[] {
    const cats = new Set(readPosts().map((p) => p.category));
    return Array.from(cats);
}

/** Create a new blog post */
export function createPost(
    data: Omit<BlogPost, "id" | "slug" | "publishedAt" | "updatedAt" | "readingTime"> & { slug?: string }
): BlogPost {
    const posts = readPosts();
    const id = String(Date.now());

    // Use provided slug or generate from title
    const slug = (data.slug || data.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Estimate reading time (avg 200 words/min)
    const wordCount = data.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const now = new Date().toISOString();

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (posts.some(p => p.slug === finalSlug)) {
        finalSlug = `${slug}-${counter++}`;
    }

    const post: BlogPost = {
        ...data,
        id,
        slug: finalSlug,
        readingTime,
        publishedAt: now,
        updatedAt: now,
    } as BlogPost;

    posts.push(post);
    writePosts(posts);
    return post;
}

/** Update an existing blog post */
export function updatePost(
    slug: string,
    data: Partial<Omit<BlogPost, "id" | "publishedAt" | "readingTime">>
): BlogPost | null {
    const posts = readPosts();
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) return null;

    const existingPost = posts[index];

    // Re-calculate reading time if content changed
    let readingTime = existingPost.readingTime;
    if (data.content) {
        const wordCount = data.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        readingTime = Math.max(1, Math.round(wordCount / 200));
    }

    const updatedPost: BlogPost = {
        ...existingPost,
        ...data,
        readingTime,
        updatedAt: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    writePosts(posts);
    return updatedPost;
}

/** Delete a blog post */
export function deletePost(slug: string): boolean {
    const posts = readPosts();
    const initialLength = posts.length;
    const newPosts = posts.filter((p) => p.slug !== slug);

    if (newPosts.length === initialLength) {
        return false; // not found
    }

    writePosts(newPosts);
    return true;
}
