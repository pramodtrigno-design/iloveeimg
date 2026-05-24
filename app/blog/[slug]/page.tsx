import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { isAuthenticated } from "@/lib/auth";
import { Calendar, Clock, ArrowLeft, Tag, User } from "lucide-react";
import BlogActions from "@/components/blog/BlogActions";

/* ── Dynamic SEO Metadata ──────────────────────────────── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    return {
        title: post.title,
        description: post.excerpt,
        keywords: post.tags,
        authors: [{ name: post.author }],
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            type: "article",
            title: post.title,
            description: post.excerpt,
            url: `/blog/${post.slug}`,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author],
            tags: post.tags,
            section: post.category,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
        },
    };
}

/* ── Static Params (SSG for all existing slugs) ────────── */
export async function generateStaticParams() {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
}

/* ── Page Component ────────────────────────────────────── */
export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    const isAdmin = await isAuthenticated();

    if (!post) {
        notFound();
    }

    return (
        <>
            {/* JSON-LD Article */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        description: post.excerpt,
                        url: `https://iloveeimg.com/blog/${post.slug}`,
                        datePublished: post.publishedAt,
                        dateModified: post.updatedAt,
                        author: {
                            "@type": "Person",
                            name: post.author,
                        },
                        publisher: {
                            "@type": "Organization",
                            name: "iLoveIMG",
                            url: "https://iloveeimg.com",
                        },
                        mainEntityOfPage: {
                            "@type": "WebPage",
                            "@id": `https://iloveeimg.com/blog/${post.slug}`,
                        },
                        keywords: post.tags.join(", "),
                        articleSection: post.category,
                        wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
                    }),
                }}
            />

            {/* BreadcrumbList JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: "https://iloveeimg.com" },
                            { "@type": "ListItem", position: 2, name: "Blog", item: "https://iloveeimg.com/blog" },
                            { "@type": "ListItem", position: 3, name: post.title, item: `https://iloveeimg.com/blog/${post.slug}` },
                        ],
                    }),
                }}
            />

            <article className="content-container py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <nav aria-label="Breadcrumb" className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                        <li>
                            <Link href="/" className="hover:text-foreground transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href="/blog" className="hover:text-foreground transition-colors">
                                Blog
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-foreground font-medium truncate max-w-[200px]">
                            {post.title}
                        </li>
                    </ol>
                </nav>

                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Article Header */}
                <header className="mb-10">
                    <div className="flex items-start justify-between mb-4">
                        {/* Category */}
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {post.category}
                        </span>

                        {/* Admin Actions */}
                        {isAdmin && <BlogActions slug={post.slug} variant="full" />}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        {post.excerpt}
                    </p>

                    {/* Meta bar */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4">
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {post.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} min read
                        </span>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="aspect-[21/9] bg-muted relative rounded-3xl flex items-center justify-center overflow-hidden mb-12 shadow-sm">
                    {post.coverImage && post.coverImage !== "/blog/default-cover.jpg" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-6xl font-bold text-primary/10">
                            {post.category}
                        </span>
                    )}
                </div>

                {/* Article Content */}
                <div
                    className="prose prose-slate prose-lg max-w-none
                        prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-slate-100
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-slate-600 prose-p:leading-[1.7] prose-p:text-[1.15rem] prose-p:mb-5
                        prose-strong:text-slate-900 prose-strong:font-black
                        prose-ul:my-6 prose-ul:list-none prose-ul:pl-0
                        prose-li:text-slate-600 prose-li:mb-2 prose-li:text-[1.1rem] prose-li:relative prose-li:pl-0
                        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-slate-600
                        prose-table:my-10 prose-table:border-collapse prose-table:w-full prose-table:shadow-md prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-slate-100
                        prose-thead:border-b-2 prose-thead:border-slate-200 prose-thead:bg-slate-50
                        prose-th:py-4 prose-th:px-5 prose-th:text-left prose-th:font-black prose-th:text-slate-900 prose-th:uppercase prose-th:text-xs prose-th:tracking-wider
                        prose-td:py-4 prose-td:px-5 prose-td:border-b prose-td:border-slate-100 prose-td:text-slate-600 prose-td:transition-colors hover:prose-td:bg-slate-50
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-8 prose-blockquote:not-italic prose-blockquote:text-slate-800 prose-blockquote:font-semibold
                        prose-hr:my-10 prose-hr:border-slate-200
                        prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:mx-auto
                        mb-20"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-10 pb-10 border-b border-border">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to try our tools?</h2>
                    <p className="text-muted-foreground mb-6">
                        All our PDF and image tools are free, private, and work right in your browser.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-hero hover:opacity-90 transition-all"
                    >
                        Explore All Tools <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                </div>
            </article>
        </>
    );
}
