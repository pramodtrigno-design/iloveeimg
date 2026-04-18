import type { Metadata } from "next";
import SplitPDFPage from "@/tool-pages/SplitPDF";

export const metadata: Metadata = {
    title: "Split PDF Online — Extract Pages & Split PDF Files Free",
    description: "Split PDF files into multiple documents or extract specific pages online for free. Split by page range, individual pages, or every N pages. No sign-up required.",
    keywords: ["split PDF", "extract PDF pages", "separate PDF pages", "split PDF online free", "PDF splitter", "extract pages from PDF", "divide PDF"],
    alternates: { canonical: "/pdf-split" },
    openGraph: { title: "Split PDF Online — Extract Pages & Split PDF Files Free", description: "Split PDF files into multiple documents or extract specific pages online for free.", url: "/pdf-split" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Split PDF — iLoveIMG", url: "https://iloveeimg.com/split", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Split PDF files or extract specific pages online for free." }) }} />
            <SplitPDFPage />
        </>
    );
}
