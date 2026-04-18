import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/index.css";
import { RootLayoutClient } from "./layout-client";

/* ── next/font: zero-CLS font loading ──────────────────── */
const geistSans = Geist({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-geist-mono",
});

/* ── Global SEO Metadata ───────────────────────────────── */
export const metadata: Metadata = {
    metadataBase: new URL("https://iloveeimg.com"),
    title: {
        default: "iLoveIMG — Free Online PDF & Image Tools | Merge, Split, Compress & Convert",
        template: "%s | iLoveIMG",
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-96x96.png",
        apple: "/apple-touch-icon.png",
    },
    description:
        "Free online tools to merge, split, compress, convert, rotate, watermark, and edit PDF files — plus image compression and format conversion. No sign-up required. 100% private, processed in your browser.",
    keywords: [
        "PDF tools",
        "merge PDF",
        "split PDF",
        "compress PDF",
        "convert PDF",
        "image to PDF",
        "PDF to image",
        "rotate PDF",
        "watermark PDF",
        "page numbers PDF",
        "delete PDF pages",
        "compress image",
        "convert image",
        "free online PDF tools",
        "browser PDF editor",
    ],
    authors: [{ name: "iLoveIMG" }],
    creator: "iLoveIMG",
    publisher: "iLoveIMG",
    robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://iloveeimg.com",
        siteName: "iLoveIMG",
        title: "iLoveIMG — Free Online PDF & Image Tools",
        description:
            "Free online tools to merge, split, compress, convert, rotate, and edit PDF files — plus image compression and format conversion. No sign-up required.",
    },
    twitter: {
        card: "summary_large_image",
        title: "iLoveIMG — Free Online PDF & Image Tools",
        description:
            "Free online PDF and image tools — merge, split, compress, convert, watermark, rotate and more. No sign-up required.",
    },
    other: {
        language: "en",
        "revisit-after": "7 days",
        rating: "general",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ef4444",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
            <body className="bg-background text-foreground font-sans antialiased">
                <RootLayoutClient>{children}</RootLayoutClient>
                {/* admin123 */}
            </body>
        </html>
    );
}
