import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/lib/blog";

// Add this to your environment variables or change it here
const CRON_SECRET = process.env.CRON_SECRET || "my-super-secret-cron-key";

const services = [
    {
        topic: "Merge PDF",
        keywords: ["combine PDFs", "merge PDF files", "pdf binder", "join pdf"],
        url: "/pdf-merge"
    },
    {
        topic: "Split PDF",
        keywords: ["separate PDF pages", "extract PDF", "divide PDF", "split pdf online"],
        url: "/pdf-split"
    },
    {
        topic: "Compress PDF",
        keywords: ["reduce PDF size", "shrink PDF", "compress PDF online", "optimize PDF"],
        url: "/compress"
    },
    {
        topic: "Convert Image to PDF",
        keywords: ["jpg to pdf", "png to pdf", "image converter", "photo to pdf"],
        url: "/image-to-pdf"
    },
    {
        topic: "Compress Image",
        keywords: ["reduce image size", "shrink photo", "compress webp", "optimize jpg"],
        url: "/image-compress"
    }
];

const titleTemplates = [
    "How to {Topic} Online for Free in 2026",
    "The Ultimate Guide to {Topic} — Fast & Secure",
    "5 Reasons Why You Should {Topic} Today",
    "Best Free Tool to {Topic} Without Losing Quality",
    "A Quick Tutorial on How to {Topic} in Seconds"
];

const introTemplates = [
    "<p>Are you looking for a fast and reliable way to <strong>{Topic}</strong>? In today's digital world, handling documents efficiently is crucial. Whether you are a student organizing notes or a professional managing reports, knowing how to {Keyword1} and {Keyword2} can save you hours of work.</p>",
    "<p>Everyone has struggled with clunky software when trying to <strong>{Topic}</strong>. Thankfully, you no longer need to download expensive applications. Our browser-based platform allows you to {Keyword1} directly from your browser, safely and securely.</p>"
];

const bodyTemplates = [
    "<h2>Why Choose Our Tool to {Topic}?</h2><p>Our platform is designed with simplicity and privacy in mind. When you use our service to {Keyword1}, your files never leave your device. All processing happens locally in your browser leveraging the latest HTML5 and WebAssembly technologies.</p><h3>Step-by-Step Instructions</h3><ol><li>Navigate to our dedicated <a href='{Url}'>{Topic} utility</a>.</li><li>Drag and drop your files into the processing zone.</li><li>Select your preferred settings.</li><li>Click the primary action button and download your newly processed file!</li></ol>",
    "<h2>The Best Way to {Keyword1}</h2><p>Have you ever needed to {Keyword2} but struggled to find a secure tool? We got you covered. By using our zero-upload architecture to {Topic}, your sensitive data remains completely private.</p><h3>Features at a Glance</h3><ul><li><strong>100% Free:</strong> No hidden fees or subscriptions.</li><li><strong>Lightning Fast:</strong> Process happens in milliseconds.</li><li><strong>Cross-Platform:</strong> Works on Windows, Mac, Linux, and Mobile.</li></ul>"
];

const conclusionTemplates = [
    "<h2>Final Thoughts</h2><p>Next time you need to {Topic}, remember that you don't need heavy software. Simply bookmark our site and use our free tool to {Keyword1} anytime you want.</p>",
    "<h2>Get Started Now</h2><p>Ready to try it out? Head over to our <a href='{Url}'>{Topic} page</a> and experience the fastest way to {Keyword2} on the web.</p>"
];

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    // Verify the secret to prevent unauthorized generations
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const service = getRandom(services);
        const title = getRandom(titleTemplates).replace(/{Topic}/g, service.topic);

        const keyword1 = getRandom(service.keywords);
        const keyword2 = getRandom(service.keywords.filter(k => k !== keyword1)); // pick a different one

        const intro = getRandom(introTemplates)
            .replace(/{Topic}/g, service.topic)
            .replace(/{Keyword1}/g, keyword1)
            .replace(/{Keyword2}/g, keyword2);

        const body = getRandom(bodyTemplates)
            .replace(/{Topic}/g, service.topic)
            .replace(/{Keyword1}/g, keyword1)
            .replace(/{Keyword2}/g, keyword2)
            .replace(/{Url}/g, service.url);

        const conclusion = getRandom(conclusionTemplates)
            .replace(/{Topic}/g, service.topic)
            .replace(/{Keyword1}/g, keyword1)
            .replace(/{Keyword2}/g, keyword2)
            .replace(/{Url}/g, service.url);

        const fullContent = `${intro}\n\n${body}\n\n${conclusion}`;

        const post = await createPost({
            title: title,
            excerpt: `Learn the easiest and most secure way to ${service.topic} directly from your browser. Try our free, fast tool today.`,
            content: fullContent,
            author: "PDFTools Auto-Bot",
            category: "Automated Guides",
            tags: [service.topic.toLowerCase(), keyword1, keyword2, "guide"],
            coverImage: "/blog/default-cover.jpg" // You can randomize covers here too
        });

        return NextResponse.json({
            success: true,
            message: `Generated automated post: ${post.title}`,
            post
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
