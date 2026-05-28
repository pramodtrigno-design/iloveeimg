import type { Metadata } from "next";
import CompressImagePage from "@/tool-pages/CompressImage";

export const metadata: Metadata = {
    title: "Compress Images Online — Reduce Image File Size Free",
    description: "Compress and reduce image file size online for free. Supports JPG, PNG, and WebP. Adjustable quality and max width. Batch compress up to 20 images. No sign-up, processed in your browser.",
    keywords: ["compress image", "reduce image size", "image compressor", "compress JPG", "compress PNG", "compress WebP", "image compression online free", "bulk image compressor"],
    alternates: { canonical: "/image-compress" },
    openGraph: { title: "Compress Images Online — Reduce Image File Size Free", description: "Compress and reduce image file size online for free.", url: "/image-compress" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Image Compressor — iLoveeIMG", url: "https://iloveeimg.com/image-compress", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Compress images to reduce file size while maintaining quality." }) }} />
            <CompressImagePage />
        </>
    );
}
