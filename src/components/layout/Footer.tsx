import Link from "next/link";
import { FileText, Github, ImageDown, Twitter } from "lucide-react";

const toolCategories = [
  {
    title: "Organize PDF",
    tools: [
      { name: "Merge PDF", href: "/pdf-merge" },
      { name: "Split PDF", href: "/pdf-split" },
      { name: "Rotate PDF", href: "/pdf-rotate" },
      { name: "Delete Pages", href: "/delete-pages" },
    ],
  },
  {
    title: "Optimize PDF",
    tools: [
      { name: "Compress PDF", href: "/compress-pdf" },
    ],
  },
  {
    title: "Convert PDF",
    tools: [
      { name: "Image to PDF", href: "/image-to-pdf" },
      { name: "PDF to Image", href: "/pdf-to-image" },
      { name: "Word to PDF", href: "/word-to-pdf" },
    ],
  },
  {
    title: "Edit PDF",
    tools: [
      { name: "Add Watermark", href: "/pdf-watermark" },
      { name: "Add Page Numbers", href: "/page-numbers" },
    ],
  },
  {
    title: "Resources",
    tools: [
      { name: "Blog", href: "/blog" },
      // { name: "Admin Login", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="content-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3s" aria-label="iLoveIMG Home">
              <div className="w-8 h-8 md:h-9 md:w-9  rounded-xl bg-gradient-to-r from-red-500 via-red-500 to-pink-700 flex items-center justify-center" aria-hidden="true">
                <ImageDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold"><span className="text-red-600">iLovee</span>IMG</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 mt-3">
              Free online PDF tools to merge, split, compress, convert, and edit PDF files.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Follow us on Github"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Tool Categories */}
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold mb-3 text-sm">{category.title}</h3>
              <ul className="space-y-2">
                {category.tools.map((tool) => (
                  <li key={tool.name}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} iLoveIMG. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
