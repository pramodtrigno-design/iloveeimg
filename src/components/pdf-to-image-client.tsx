"use client";

import dynamic from "next/dynamic";

const PDFToImagePage = dynamic(() => import("@/tool-pages/PDFToImage"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function PDFToImageClient() {
    return <PDFToImagePage />;
}
