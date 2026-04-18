import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* ── Performance optimizations ─────────────────────────── */
    reactStrictMode: true,
    compress: true,
    async redirects() {
        return [
            {
                source: '/convert-image',
                destination: '/image-convert',
                permanent: true,
            },
            {
                source: '/compress-image',
                destination: '/image-compress',
                permanent: true,
            },
        ];
    },

    images: {
        formats: ["image/avif", "image/webp"],
    },

    turbopack: {
        resolveAlias: {
            // pdfjs-dist tries to require('canvas') on Node — stub it out
            canvas: { browser: "./src/lib/empty-module.js" },
        },
    },

    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },

    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "framer-motion",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-select",
            "@radix-ui/react-slider",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-toast",
            "@radix-ui/react-label",
        ],
    },
};

export default nextConfig;
