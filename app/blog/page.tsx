import type { Metadata } from "next";
import Link from "next/link";
import { getPaginatedPosts } from "@/lib/blog";
import { isAuthenticated } from "@/lib/auth";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, PenSquare } from "lucide-react";
import BlogActions from "@/components/blog/BlogActions";

export const metadata: Metadata = {
    title: "Blog — PDF Tips, Guides & Tutorials",
    description:
        "Read expert tips, step-by-step guides, and best practices for working with PDF and image files. Learn how to merge, split, compress, convert, and optimize your documents.",
    keywords: [
        "PDF tips", "PDF guides", "PDF tutorials", "how to merge PDF",
        "compress PDF guide", "image to PDF tutorial", "PDF best practices",
    ],
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Blog — PDF Tips, Guides & Tutorials | iLoveIMG",
        description: "Expert tips and guides for working with PDF and image files.",
        url: "/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog — PDF Tips, Guides & Tutorials | iLoveIMG",
        description: "Expert tips and guides for working with PDF and image files.",
    },
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const { posts, total, page, totalPages } = getPaginatedPosts(currentPage, 6);
    const isAdmin = await isAuthenticated();

    return (
        <>
            {/* JSON-LD Blog listing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        name: "iLoveIMG Blog",
                        url: "https://iloveeimg.com/blog",
                        description: "Expert tips, guides, and tutorials for working with PDF and image files.",
                        publisher: {
                            "@type": "Organization",
                            name: "iLoveIMG",
                            url: "https://iloveeimg.com",
                        },
                        blogPost: posts.map((p) => ({
                            "@type": "BlogPosting",
                            headline: p.title,
                            url: `https://iloveeimg.com/blog/${p.slug}`,
                            datePublished: p.publishedAt,
                            dateModified: p.updatedAt,
                            author: { "@type": "Person", name: p.author },
                            description: p.excerpt,
                        })),
                    }),
                }}
            />

            <div className="content-container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title mb-4">
                        PDF Tips, Guides &amp; Tutorials
                    </h1>
                    <p className="section-subtitle mx-auto">
                        Learn how to work smarter with PDFs and images. Expert tips, step-by-step guides, and best practices.
                    </p>
                    {isAdmin && (
                        <div className="mt-6">
                            <Link
                                href="/blog/new"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-gradient-hero hover:opacity-90 hover:-translate-y-0.5"
                            >
                                <PenSquare className="w-5 h-5" />
                                Write a Post
                            </Link>
                        </div>
                    )}
                </div>

                {/* Blog Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No blog posts yet.</p>
                        <Link href="/blog/new" className="text-primary underline mt-2 inline-block">
                            Write your first post →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-tool-hover"
                            >
                                {/* Cover Image */}
                                <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
                                    {post.coverImage && post.coverImage !== "/blog/default-cover.jpg" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <span className="text-4xl font-bold text-primary/20">
                                            {post.category.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        {/* Category Badge */}
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                            {post.category}
                                        </span>
                                        {/* Actions */}
                                        <div className="relative z-10">
                                            {isAdmin && <BlogActions slug={post.slug} variant="icon" />}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.readingTime} min read
                                            </span>
                                        </div>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
                                        >
                                            Read <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav aria-label="Blog pagination" className="flex items-center justify-center gap-2">
                        {/* Previous */}
                        {page > 1 ? (
                            <Link
                                href={`/blog?page=${page - 1}`}
                                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </span>
                        )}

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/blog?page=${p}`}
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border hover:bg-muted"
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}

                        {/* Next */}
                        {page < totalPages ? (
                            <Link
                                href={`/blog?page=${page + 1}`}
                                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                                Next <ChevronRight className="w-4 h-4" />
                            </span>
                        )}
                    </nav>
                )}

                {/* Total posts info */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Showing {posts.length} of {total} posts
                </p>
            </div>
        </>
    );
}
