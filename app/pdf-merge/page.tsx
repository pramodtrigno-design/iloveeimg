import type { Metadata } from "next";
import MergePDFPage from "@/tool-pages/MergePDF";

export const metadata: Metadata = {
    title: "Merge PDF Online — Combine Multiple PDFs Into One Free",
    description: "Merge and combine multiple PDF files into a single document online for free. Drag and drop to reorder pages. No sign-up, no watermarks — processed 100% in your browser.",
    keywords: ["merge PDF", "combine PDF", "join PDF files", "merge PDF online free", "combine PDF files", "PDF merger", "concatenate PDF"],
    alternates: { canonical: "/pdf-merge" },
    openGraph: { title: "Merge PDF Online — Combine Multiple PDFs Into One Free", description: "Merge and combine multiple PDF files into a single document online for free.", url: "/pdf-merge" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Merge PDF — iLoveIMG", url: "https://iloveeimg.com/merge", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Combine multiple PDF files into one document online for free." }) }} />
            <MergePDFPage />
        </>
    );
}
