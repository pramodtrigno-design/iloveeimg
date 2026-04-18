import type { Metadata } from "next";
import DeletePagesPage from "@/tool-pages/DeletePages";

export const metadata: Metadata = {
    title: "Delete PDF Pages Online — Remove Pages from PDF Free",
    description: "Remove unwanted pages from your PDF documents online for free. Select individual pages or page ranges to delete. No sign-up, no watermarks — processed in your browser.",
    keywords: ["delete PDF pages", "remove pages from PDF", "PDF page remover", "delete PDF pages online free", "remove unwanted PDF pages"],
    alternates: { canonical: "/delete-pages" },
    openGraph: { title: "Delete PDF Pages Online — Remove Pages from PDF Free", description: "Remove unwanted pages from your PDF documents online for free.", url: "/delete-pages" },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "Delete PDF Pages — iLoveIMG", url: "https://iloveeimg.com/delete-pages", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Remove unwanted pages from your PDF documents online for free." }) }} />
            <DeletePagesPage />
        </>
    );
}
