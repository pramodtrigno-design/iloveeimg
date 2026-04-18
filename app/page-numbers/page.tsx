import type { Metadata } from "next";
import PageNumbersPage from "@/tool-pages/PageNumbers";

export const metadata: Metadata = {
    title: "Add Page Numbers to PDF Online — Free PDF Page Numbering",
    description: "Add page numbers to your PDF documents online for free. Customize position, alignment, starting number, and format. No sign-up, processed entirely in your browser.",
    keywords: ["add page numbers to PDF", "PDF page numbers", "number PDF pages", "PDF page numbering online free", "insert page numbers PDF"],
    alternates: { canonical: "/page-numbers" },
    openGraph: { title: "Add Page Numbers to PDF Online — Free PDF Page Numbering", description: "Add page numbers to your PDF documents online for free.", url: "/page-numbers" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Add Page Numbers to PDF — iLoveIMG", url: "https://iloveeimg.com/page-numbers", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Add page numbers to your PDF documents online for free." }) }} />
            <PageNumbersPage />
        </>
    );
}
