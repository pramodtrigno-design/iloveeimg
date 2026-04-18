import type { Metadata } from "next";
import HomePage from "@/tool-pages/Index";

export const metadata: Metadata = {
    title: "Free Online PDF & Image Tools — Merge, Split, Compress & Convert",
    description:
        "Free online tools to merge, split, compress, convert, rotate, watermark, and edit PDF files — plus image compression and format conversion. No sign-up required. 100% private, processed in your browser.",
    keywords: [
        "PDF tools", "merge PDF", "split PDF", "compress PDF", "convert PDF",
        "image to PDF", "PDF to image", "rotate PDF", "watermark PDF",
        "page numbers PDF", "delete PDF pages", "compress image", "convert image",
        "free online PDF tools", "browser PDF editor",
    ],
    alternates: { canonical: "/" },
    other: {
        "script:ld+json": JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "iLoveIMG",
            url: "https://iloveeimg.com",
            description:
                "Free online PDF and image tools — merge, split, compress, convert, watermark, rotate, add page numbers, delete pages, and more.",
            potentialAction: {
                "@type": "SearchAction",
                target: "https://iloveeimg.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
            },
        }),
    },
};

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        name: "iLoveIMG",
                        url: "https://iloveeimg.com",
                        description:
                            "Free online PDF and image tools — merge, split, compress, convert, watermark, rotate, add page numbers, delete pages, and more.",
                        potentialAction: {
                            "@type": "SearchAction",
                            target: "https://iloveeimg.com/?q={search_term_string}",
                            "query-input": "required name=search_term_string",
                        },
                    }),
                }}
            />
            <HomePage />
        </>
    );
}
