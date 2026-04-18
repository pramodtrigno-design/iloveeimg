import type { Metadata } from "next";
import WatermarkPDFPage from "@/tool-pages/WatermarkPDF";

export const metadata: Metadata = {
    title: "Add Watermark to PDF Online — Text Watermark Free",
    description: "Add text watermarks to your PDF documents online for free. Customize font size, opacity, position, and rotation. No sign-up, no limits — processed in your browser.",
    keywords: ["add watermark to PDF", "PDF watermark", "text watermark PDF", "watermark PDF online free", "stamp PDF", "protect PDF with watermark"],
    alternates: { canonical: "/pdf-watermark" },
    openGraph: { title: "Add Watermark to PDF Online — Text Watermark Free", description: "Add text watermarks to your PDF documents online for free.", url: "/pdf-watermark" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Add Watermark to PDF — iLoveIMG", url: "https://iloveeimg.com/watermark", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Add text watermarks to your PDF documents online for free." }) }} />
            <WatermarkPDFPage />
        </>
    );
}
