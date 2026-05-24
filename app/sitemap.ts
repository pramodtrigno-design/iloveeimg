import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

const BASE_URL = "https://iloveeimg.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const toolRoutes = [
        "/",
        "/pdf-merge",
        "/pdf-split",
        "/compress",
        "/image-to-pdf",
        "/pdf-to-image",
        "/pdf-rotate",
        "/pdf-watermark",
        "/page-numbers",
        "/delete-pages",
        "/image-convert",
        "/image-compress",
        "/word-to-pdf",
        "/blog",
    ];

    const blogSlugs = await getAllSlugs();

    return [
        ...toolRoutes.map((route) => ({
            url: `${BASE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
            priority: route === "/" ? 1 : route === "/blog" ? 0.9 : 0.8,
        })),
        ...blogSlugs.map((slug) => ({
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
    ];
}
