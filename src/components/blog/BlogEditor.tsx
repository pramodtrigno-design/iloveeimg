"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenSquare, Loader2, Eye, Edit3, Save, Type, Text, Image as ImageIcon, User, Tag, AlignLeft, Folder, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BlogEditorProps {
    initialData?: {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        author: string;
        category: string;
        tags: string;
        coverImage: string;
    };
}

export default function BlogEditor({ initialData }: BlogEditorProps = {}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(
        initialData || {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            author: "iLoveIMG Team",
            category: "General",
            tags: "",
            coverImage: "",
        }
    );

    const updateField = (field: string, value: string) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            // Auto-generate slug if title is changing and slug hasn't been manually edited/provided yet
            if (field === "title" && !initialData) {
                const autoSlug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                next.slug = autoSlug;
            }

            return next;
        });
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError("Title is required.");
        if (!form.excerpt.trim()) return setError("Excerpt is required (used for SEO meta description).");
        if (!form.content.trim()) return setError("Content is required.");
        if (form.excerpt.length > 1000) return setError("Excerpt should be ≤ 1000 characters for SEO.");

        setIsSubmitting(true);
        setError("");

        try {
            const isEditing = !!initialData;
            const url = isEditing ? `/api/blog/${initialData.slug}` : "/api/blog";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create post.");
            }

            const data = await res.json();
            router.push(`/blog/${data.post.slug}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to upload image.");
            }

            const data = await res.json();
            updateField("coverImage", data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong uploading the image.");
        }
    };

    const formatContent = (action: string) => {
        const textarea = document.getElementById("content") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        let replacement = "";

        switch (action) {
            case "h2": replacement = `<h2>${selected || "Heading 2"}</h2>`; break;
            case "h3": replacement = `<h3>${selected || "Heading 3"}</h3>`; break;
            case "p": replacement = `<p>${selected || "Paragraph text..."}</p>`; break;
            case "bold": replacement = `<strong>${selected || "bold text"}</strong>`; break;
            case "list": replacement = `<ul>\n  <li>${selected || "List item"}</li>\n</ul>`; break;
            case "checklist":
                replacement = `<ul>\n  <li>✅ ${selected || "Checklist item 1"}</li>\n  <li>✅ Checklist item 2</li>\n</ul>`;
                break;
            case "table":
                replacement = `<table class="min-w-full">\n  <thead>\n    <tr>\n      <th>Feature</th>\n      <th>WebP</th>\n      <th>PNG</th>\n      <th>JPG</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>File Size</td>\n      <td>Smallest</td>\n      <td>Large</td>\n      <td>Medium</td>\n    </tr>\n  </tbody>\n</table>`;
                break;
            case "quote":
                replacement = `<blockquote>\n  <strong>Pro Tip:</strong> ${selected || "Add your helpful tip or insight here..."}\n</blockquote>`;
                break;
            case "hr":
                replacement = `\n<hr/>\n`;
                break;
            case "beautify":
                // Convert double newlines to paragraphs, single to line breaks
                const beautified = form.content
                    .split(/\n\s*\n/)
                    .map(p => p.trim())
                    .filter(Boolean)
                    .map((p, idx) => {
                        if (p.startsWith("<")) return p;
                        // Clean up internal multiple newlines
                        const cleanP = p.replace(/\n\s*\n/g, "\n");
                        if (idx === 0 && cleanP.length < 60) return `<h2>${cleanP}</h2>`;
                        if (cleanP.endsWith("?") && cleanP.length < 100) return `<h2>${cleanP}</h2>`;
                        return `<p>${cleanP.replace(/\n/g, "<br/>")}</p>`;
                    })
                    .join("\n\n");
                updateField("content", beautified);
                return;
            default: return;
        }

        const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        updateField("content", newValue);

        // Refocus and set cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }, 10);
    };

    const categories = [
        "General",
        "Guides",
        "Tips & Tricks",
        "Tutorials",
        "News",
        "Product Updates",
    ];

    return (
        <div className="space-y-10">
            {/* Error message */}
            {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm font-medium text-destructive flex items-center shadow-sm">
                    <span className="bg-destructive/10 rounded-full p-1.5 mr-3">⚠</span>
                    {error}
                </div>
            )}

            {/* BLOCK 1: Title & Summary */}
            <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-6 md:p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110" />
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Megaphone className="w-5 h-5 text-primary" /> Core Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                        <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                            <Type className="w-4 h-4 text-muted-foreground" /> Blog Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., How to Edit PDFs Like a Pro..."
                            value={form.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            className="text-lg py-6 shadow-sm border-border focus-visible:ring-primary/40 bg-background/80 backdrop-blur"
                        />
                        <p className="text-xs text-muted-foreground font-medium pl-1">
                            Use a descriptive, keyword-rich title for SEO ranking.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-muted-foreground" /> URL Slug <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="slug"
                            placeholder="e.g., how-to-edit-pdfs-pro"
                            value={form.slug}
                            onChange={(e) => updateField("slug", e.target.value)}
                            className="text-lg py-6 shadow-sm border-border focus-visible:ring-primary/40 bg-background/80 backdrop-blur font-mono"
                        />
                        <p className="text-xs text-muted-foreground font-medium pl-1">
                            The clean part of the URL. This can be different from the title.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <Label htmlFor="excerpt" className="text-sm font-semibold flex items-center gap-2">
                        <Text className="w-4 h-4 text-muted-foreground" /> Short Excerpt / Meta Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="excerpt"
                        placeholder="A compelling 1-2 sentence summary to appear on search engines and social cards..."
                        value={form.excerpt}
                        onChange={(e) => updateField("excerpt", e.target.value)}
                        rows={3}
                        className="resize-none shadow-sm border-border focus-visible:ring-primary/40 bg-background/80 backdrop-blur"
                    />
                    <p className="text-xs text-muted-foreground font-medium flex justify-between px-1">
                        <span>Provides the crucial first impression.</span>
                        <span className={form.excerpt.length > 1000 ? "text-destructive font-bold" : "text-primary font-semibold"}>
                            {form.excerpt.length}/1000 {form.excerpt.length > 1000 && " ⚠"}
                        </span>
                    </p>
                </div>
            </div>

            {/* BLOCK 2: Media & Metadata */}
            <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-6 md:p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-tr-[120px] pointer-events-none transition-transform group-hover:scale-110" />
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" /> Media & Meta
                </h3>

                <div className="grid grid-cols-1  gap-8 relative z-10">
                    {/* Cover Image Upload (Spans Full or Left) */}
                    <div className="space-y-3 md:col-span-2 lg:col-span-1">
                        <Label htmlFor="coverImage" className="text-sm font-semibold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" /> Hero Cover Image
                        </Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background/50 p-4 rounded-xl border border-dashed border-border/70 hover:bg-background/80 transition-colors">
                            {form.coverImage ? (
                                <div className="relative w-full sm:w-32 h-24 overflow-hidden rounded-lg border border-border/50 shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                                    <img src={form.coverImage} alt="Cover preview" className="object-cover w-full h-full" />
                                </div>
                            ) : (
                                <div className="w-full sm:w-32 h-24 rounded-lg bg-muted/60 border border-muted flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                                </div>
                            )}
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-0 z-0 bg-primary/5 rounded-md" />
                                <Input
                                    id="coverImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="relative z-10 cursor-pointer w-full h-full file:cursor-pointer file:font-semibold file:text-sm file:text-primary file:bg-primary/10 file:border-0 hover:file:bg-primary/20 file:px-4 file:py-2 file:rounded-md file:mr-4 border-0 shadow-none bg-transparent"
                                />
                                <p className="text-xs text-muted-foreground mt-3 font-medium px-2">
                                    Landscape ratio • Less than 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta stack */}
                    <div className="space-y-6 md:col-span-2 lg:col-span-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="author" className="text-sm font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" /> Author
                                </Label>
                                <Input
                                    id="author"
                                    placeholder="Author name"
                                    value={form.author}
                                    onChange={(e) => updateField("author", e.target.value)}
                                    className="bg-background/80 backdrop-blur shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-muted-foreground" /> Category
                                </Label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        value={form.category}
                                        onChange={(e) => updateField("category", e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input shadow-sm bg-background/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 appearance-none font-medium cursor-pointer"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-1">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="tags" className="text-sm font-semibold flex items-center gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground" /> Tags (SEO)
                            </Label>
                            <Input
                                id="tags"
                                placeholder="PDF, guide, tutorial, optimize (comma separated)"
                                value={form.tags}
                                onChange={(e) => updateField("tags", e.target.value)}
                                className="bg-background/80 backdrop-blur shadow-sm font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOCK 3: Canvas */}
            <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-6 md:p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] bg-purple-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-4 mb-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <AlignLeft className="w-5 h-5 text-purple-500" /> The Canvas <span className="text-destructive">*</span>
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Use the toolbar below to format your content or paste and click "Auto-Format".</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur rounded-lg p-1 border shadow-sm self-end">
                        <Button
                            variant={!preview ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setPreview(false)}
                            className="text-xs h-8 px-4 rounded-md font-semibold transition-all"
                        >
                            <Edit3 className="w-3.5 h-3.5 mr-2" /> Editor
                        </Button>
                        <Button
                            variant={preview ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setPreview(true)}
                            className="text-xs h-8 px-4 rounded-md font-semibold transition-all"
                        >
                            <Eye className="w-3.5 h-3.5 mr-2" /> Live Preview
                        </Button>
                    </div>
                </div>

                {!preview && (
                    <div className="relative z-10 flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 rounded-t-xl border-x border-t border-input">
                        <Button variant="ghost" size="sm" onClick={() => formatContent("h2")} className="h-8 px-2.5 text-xs font-bold border border-transparent hover:border-border hover:bg-background">H2</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("h3")} className="h-8 px-2.5 text-xs font-bold border border-transparent hover:border-border hover:bg-background">H3</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("p")} className="h-8 px-2.5 text-xs font-medium border border-transparent hover:border-border hover:bg-background">¶ Para</Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="sm" onClick={() => formatContent("bold")} className="h-8 px-2.5 font-bold border border-transparent hover:border-border hover:bg-background">B</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("list")} className="h-8 px-2.5 border border-transparent hover:border-border hover:bg-background">List</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("checklist")} className="h-8 px-2.5 border border-transparent hover:border-border hover:bg-background">✅ Checklist</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("table")} className="h-8 px-2.5 border border-transparent hover:border-border hover:bg-background">📊 Table</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("quote")} className="h-8 px-2.5 border border-transparent hover:border-border hover:bg-background">💡 Tip</Button>
                        <Button variant="ghost" size="sm" onClick={() => formatContent("hr")} className="h-8 px-2.5 border border-transparent hover:border-border hover:bg-background">― HR</Button>
                        <div className="flex-1" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => formatContent("beautify")}
                            className="h-8 px-3 text-xs font-semibold bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500 hover:text-white transition-all shadow-sm"
                            title="Convert plain text to HTML paragraphs"
                        >
                            ✨ Auto-Format (Plain Text)
                        </Button>
                    </div>
                )}

                <div className={`relative z-10 bg-background/90 backdrop-blur border border-input overflow-hidden shadow-inner flex flex-col min-h-[600px] ${!preview ? "rounded-b-xl" : "rounded-xl"}`}>
                    {preview ? (
                        <div
                            className="p-8 md:p-16 prose prose-slate max-w-none flex-1 overflow-y-auto bg-white
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
                                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:mx-auto"
                            dangerouslySetInnerHTML={{ __html: form.content || "<p class='text-muted-foreground italic text-center py-20'>The canvas is blank. Switch back to Editor to start writing...</p>" }}
                        />
                    ) : (
                        <Textarea
                            id="content"
                            placeholder={`<h2>Introduction</h2>\n<p>Your beautiful content starts here...</p>\n\n<h2>Step 1: Focus On Value</h2>\n<p>Explain the topic clearly...</p>`}
                            value={form.content}
                            onChange={(e) => updateField("content", e.target.value)}
                            className="flex-1 w-full p-6 text-[15px] font-mono leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[500px]"
                        />
                    )}
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">HTML Supported</code> You can use standard standard semantic HTML elements freely here.
                </p>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 w-full bg-background/50 border-t border-border/60 py-6 mb-20 px-2">
                <div className="flex-1 max-w-xl p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-3">
                        <Save className="w-4 h-4" /> Pro Tip for Premium Design
                    </h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                        If you paste a wall of text, click the <span className="font-bold underline text-blue-900 dark:text-blue-200">✨ Auto-Format</span> button first.
                        Then use the <span className="font-bold">H2</span> and <span className="font-bold">H3</span> buttons to mark your headings.
                        This ensures your blog looks professional with perfect bold headings and margins.
                    </p>
                </div>

                <div className="flex shrink-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full sm:w-auto px-12 h-16 rounded-full text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 bg-gradient-hero"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                {initialData ? "SAVING..." : "PUBLISHING..."}
                            </>
                        ) : (
                            <>
                                {initialData ? <Save className="w-6 h-6 mr-3" /> : <PenSquare className="w-6 h-6 mr-3" />}
                                {initialData ? "UPDATE POST" : "PUBLISH POST"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
