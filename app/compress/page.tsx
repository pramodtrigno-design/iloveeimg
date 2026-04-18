import type { Metadata } from "next";
import CompressPDFPage from "@/tool-pages/CompressPDF";

export const metadata: Metadata = {
    title: "Compress PDF Online — Reduce PDF File Size Free",
    description: "Compress and reduce PDF file size online for free. Choose from low, medium, or high compression levels. Strips metadata and compresses streams. No sign-up, 100% browser-based.",
    keywords: ["compress PDF", "reduce PDF size", "shrink PDF", "PDF compressor", "compress PDF online free", "make PDF smaller", "optimize PDF"],
    alternates: { canonical: "/compress" },
    openGraph: { title: "Compress PDF Online — Reduce PDF File Size Free", description: "Compress and reduce PDF file size online for free.", url: "/compress" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Compress PDF — iLoveIMG", url: "https://iloveeimg.com/compress", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Reduce PDF file size by stripping metadata and compressing streams." }) }} />
            <CompressPDFPage />
        </>
    );
}
