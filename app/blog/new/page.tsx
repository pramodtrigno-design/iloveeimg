import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Write a Blog Post — Studio",
    description: "Create and publish a new blog post.",
    robots: { index: false, follow: false },
};

export default async function NewBlogPage() {
    if (!(await isAuthenticated())) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[150px] translate-y-1/3 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12 mt-8">
                    <div className="inline-flex items-center justify-center p-1.5 bg-primary/10 rounded-2xl mb-6 shadow-sm ring-1 ring-primary/20">
                        <span className="bg-background text-primary text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                            Creator Studio
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Craft Your Story
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Share your knowledge and shape the narrative with our modern publishing toolkit.
                    </p>
                </div>

                <div className="bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-6 md:p-10 mb-20 relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none" />

                    <div className="relative z-10">
                        <BlogEditor />
                    </div>
                </div>
            </div>
        </div>
    );
}
