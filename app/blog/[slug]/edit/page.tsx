import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { getPostBySlug } from "@/lib/blog";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Edit Blog Post",
    description: "Edit an existing blog post on PDFTools.",
    robots: { index: false, follow: false },
};

export default async function EditBlogPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    if (!(await isAuthenticated())) {
        redirect("/login");
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Map to the shape BlogEditor expects
    const initialData = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
        tags: post.tags.join(", "),
        coverImage: post.coverImage,
    };

    return (
        <div className="content-container py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h1 className="section-title mb-4">Edit Blog Post</h1>
                <p className="section-subtitle mx-auto">
                    Make updates to the post "{post.title}".
                </p>
            </div>
            <BlogEditor initialData={initialData} />
        </div>
    );
}
