import type { Metadata } from "next";
import EditPDFPage from "@/tool-pages/EditPDF";

export const metadata: Metadata = {
    title: "Edit PDF Online — View and Annotate PDFs for Free",
    description: "Edit PDF documents online for free. Add text, images, shapes, and freehand drawings to your PDFs directly in your browser. No registration required.",
    keywords: ["edit PDF", "online PDF editor", "annotate PDF", "add text to PDF", "draw on PDF", "sign PDF free", "PDF editor online"],
    alternates: { canonical: "/edit-pdf" },
    openGraph: { title: "Edit PDF Online — View and Annotate PDFs for Free", description: "Edit PDF documents online for free. Add text, images, shapes, and freehand drawings.", url: "/edit-pdf" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Edit PDF — iLoveIMG", url: "https://iloveeimg.com/edit-pdf", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Edit PDF documents online for free. Add text, images, shapes, and freehand drawings." }) }} />
            <EditPDFPage />
        </>
    );
}
