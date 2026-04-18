import type { Metadata } from "next";
import ImageToPDFPage from "@/tool-pages/ImageToPDF";

export const metadata: Metadata = {
    title: "Image to PDF Converter — Convert JPG, PNG to PDF Free",
    description: "Convert JPG, PNG, and other images to PDF format online for free. Combine multiple images into a single PDF document. No registration, no watermarks, processed in your browser.",
    keywords: ["image to PDF", "JPG to PDF", "PNG to PDF", "convert image to PDF", "photo to PDF", "picture to PDF", "image to PDF converter online free"],
    alternates: { canonical: "/image-to-pdf" },
    openGraph: { title: "Image to PDF Converter — Convert JPG, PNG to PDF Free", description: "Convert JPG, PNG, and other images to PDF format online for free.", url: "/image-to-pdf" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Image to PDF — iLoveIMG", url: "https://iloveeimg.com/image-to-pdf", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Convert JPG, PNG, and other images to PDF format online for free." }) }} />
            <ImageToPDFPage />
        </>
    );
}
