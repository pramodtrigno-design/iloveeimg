import type { Metadata } from "next";
import WordToPDFPage from "@/tool-pages/WordToPDF";

export const metadata: Metadata = {
    title: "Word to PDF Converter — Convert DOCX to PDF Free (Coming Soon)",
    description: "Convert Word DOCX documents to PDF format online for free. This feature is coming soon. In the meantime, try our other free PDF and image tools.",
    keywords: ["Word to PDF", "DOCX to PDF", "convert Word to PDF", "Word to PDF converter online free"],
    alternates: { canonical: "/word-to-pdf" },
    openGraph: { title: "Word to PDF Converter — Convert DOCX to PDF Free (Coming Soon)", description: "Convert Word DOCX documents to PDF format online for free.", url: "/word-to-pdf" },
};

export default function Page() {
    return <WordToPDFPage />;
}
