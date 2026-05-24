import { connectToDatabase } from "./mongodb";
import { BlogPostModel, BlogPostDoc } from "./models/BlogPost";

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

function serialize(doc: BlogPostDoc): BlogPost {
    return {
        id: String(doc._id),
        slug: doc.slug,
        title: doc.title,
        excerpt: doc.excerpt,
        content: doc.content,
        coverImage: doc.coverImage,
        author: doc.author,
        category: doc.category,
        tags: doc.tags ?? [],
        readingTime: doc.readingTime,
        publishedAt: doc.publishedAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function calcReadingTime(content: string): number {
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / 200));
}

/** Get paginated blog posts, newest first */
export async function getPaginatedPosts(page = 1, pageSize = 6): Promise<PaginatedResult> {
    await connectToDatabase();
    const total = await BlogPostModel.countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    const docs = await BlogPostModel.find()
        .sort({ publishedAt: -1 })
        .skip(start)
        .limit(pageSize);

    return {
        posts: docs.map(serialize),
        total,
        page: safePage,
        pageSize,
        totalPages,
    };
}

/** Get a single post by slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    await connectToDatabase();
    const doc = await BlogPostModel.findOne({ slug });
    return doc ? serialize(doc) : null;
}

/** Get all slugs (for generateStaticParams) */
export async function getAllSlugs(): Promise<string[]> {
    await connectToDatabase();
    const docs = await BlogPostModel.find({}, { slug: 1, _id: 0 });
    return docs.map((d) => d.slug);
}

/** Get all unique categories */
export async function getCategories(): Promise<string[]> {
    await connectToDatabase();
    const cats = await BlogPostModel.distinct("category");
    return cats as string[];
}

/** Create a new blog post */
export async function createPost(
    data: Omit<BlogPost, "id" | "slug" | "publishedAt" | "updatedAt" | "readingTime"> & { slug?: string }
): Promise<BlogPost> {
    await connectToDatabase();

    const baseSlug = slugify(data.slug || data.title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await BlogPostModel.exists({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-${counter++}`;
    }

    const doc = await BlogPostModel.create({
        slug: finalSlug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || "/blog/default-cover.jpg",
        author: data.author || "iLoveIMG Team",
        category: data.category || "General",
        tags: data.tags || [],
        readingTime: calcReadingTime(data.content),
        publishedAt: new Date(),
    });

    return serialize(doc);
}

/** Update an existing blog post */
export async function updatePost(
    slug: string,
    data: Partial<Omit<BlogPost, "id" | "publishedAt" | "readingTime">>
): Promise<BlogPost | null> {
    await connectToDatabase();

    const existing = await BlogPostModel.findOne({ slug });
    if (!existing) return null;

    if (data.title !== undefined) existing.title = data.title;
    if (data.excerpt !== undefined) existing.excerpt = data.excerpt;
    if (data.content !== undefined) {
        existing.content = data.content;
        existing.readingTime = calcReadingTime(data.content);
    }
    if (data.coverImage !== undefined) existing.coverImage = data.coverImage;
    if (data.author !== undefined) existing.author = data.author;
    if (data.category !== undefined) existing.category = data.category;
    if (data.tags !== undefined) existing.tags = data.tags;

    if (data.slug && data.slug !== existing.slug) {
        const newBase = slugify(data.slug);
        let candidate = newBase;
        let counter = 1;
        while (await BlogPostModel.exists({ slug: candidate, _id: { $ne: existing._id } })) {
            candidate = `${newBase}-${counter++}`;
        }
        existing.slug = candidate;
    }

    await existing.save();
    return serialize(existing);
}

/** Delete a blog post */
export async function deletePost(slug: string): Promise<boolean> {
    await connectToDatabase();
    const result = await BlogPostModel.deleteOne({ slug });
    return result.deletedCount > 0;
}
