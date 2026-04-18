import type { Metadata } from "next";
import RotatePDFPage from "@/tool-pages/RotatePDF";

export const metadata: Metadata = {
    title: "Rotate PDF Pages Online — 90°, 180°, 270° Free",
    description: "Rotate PDF pages by 90°, 180°, or 270° online for free. Rotate all pages or specific pages. No sign-up, no watermarks — processed entirely in your browser.",
    keywords: ["rotate PDF", "rotate PDF pages", "turn PDF", "flip PDF", "rotate PDF online free", "PDF page rotation", "rotate PDF 90 degrees"],
    alternates: { canonical: "/pdf-rotate" },
    openGraph: { title: "Rotate PDF Pages Online — 90°, 180°, 270° Free", description: "Rotate PDF pages by 90°, 180°, or 270° online for free.", url: "/pdf-rotate" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Rotate PDF — iLoveIMG", url: "https://iloveeimg.com/rotate", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Rotate PDF pages by 90°, 180°, or 270° online for free." }) }} />
            <RotatePDFPage />
        </>
    );
}
