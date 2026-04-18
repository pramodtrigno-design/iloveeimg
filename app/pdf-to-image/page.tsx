import type { Metadata } from "next";
import PDFToImageClient from "@/components/pdf-to-image-client";

export const metadata: Metadata = {
    title: "PDF to Image Converter — Convert PDF to JPG, PNG Free",
    description: "Convert PDF pages to high-quality JPG or PNG images online for free. Adjustable scale and quality settings. Download individual pages or all at once as a ZIP. No sign-up required.",
    keywords: ["PDF to image", "PDF to JPG", "PDF to PNG", "convert PDF to image", "PDF to picture", "PDF page to image", "extract images from PDF", "PDF to image converter online free"],
    alternates: { canonical: "/pdf-to-image" },
    openGraph: { title: "PDF to Image Converter — Convert PDF to JPG, PNG Free", description: "Convert PDF pages to high-quality JPG or PNG images online for free.", url: "/pdf-to-image" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "PDF to Image — iLoveIMG", url: "https://iloveeimg.com/pdf-to-image", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Convert PDF pages to high-quality JPG or PNG images online for free." }) }} />
            <PDFToImageClient />
        </>
    );
}
