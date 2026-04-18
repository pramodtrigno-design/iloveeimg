import type { Metadata } from "next";
import ImageConverterPage from "@/tool-pages/ImageConverter";

export const metadata: Metadata = {
    title: "Image Format Converter — Convert to WebP, PNG, JPG Free",
    description: "Convert images between WebP, PNG, and JPG formats online for free. Batch convert multiple images with quality control. No sign-up, no limits — processed in your browser.",
    keywords: ["convert image format", "image converter", "WebP converter", "PNG to JPG", "JPG to WebP", "image format converter online free", "batch image converter"],
    alternates: { canonical: "/image-convert" },
    openGraph: { title: "Image Format Converter — Convert to WebP, PNG, JPG Free", description: "Convert images between WebP, PNG, and JPG formats online for free.", url: "/image-convert" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Image Format Converter — iLoveIMG", url: "https://iloveeimg.com/image-convert", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Convert images between WebP, PNG, and JPG formats online for free." }) }} />
            <ImageConverterPage />
        </>
    );
}
