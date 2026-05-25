"use client";

import Link from "next/link";
import {
  Combine,
  Split,
  Minimize2,
  Image,
  FileImage,
  FileText,
  RotateCw,
  Stamp,
  Hash,
  Trash2,
  RefreshCw,
  ImageDown,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  SquarePen
} from "lucide-react";
import { ToolCategory } from "@/components/shared/ToolCard";

interface Tool {
  title: string;
  description: string;
  icon: any;
  href: string;
  category: ToolCategory;
  hexColor: string;
  shadowColor: string;
}

const tools: Tool[] = [
  {
    title: "Convert Image",
    description: "Convert images to WebP, PNG, or JPG format",
    icon: RefreshCw,
    href: "/image-convert",
    category: "convert",
    hexColor: "#3b82f6", // blue-500
    shadowColor: "rgba(59, 130, 246, 0.2)",
  },
  {
    title: "Compress Image",
    description: "Reduce image file size while maintaining quality",
    icon: ImageDown,
    href: "/image-compress",
    category: "compress",
    hexColor: "#22c55e", // green-500
    shadowColor: "rgba(34, 197, 94, 0.2)",
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: Minimize2,
    href: "/compress",
    category: "compress",
    hexColor: "#22c55e", // green-500
    shadowColor: "rgba(34, 197, 94, 0.2)",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    icon: Combine,
    href: "/pdf-merge",
    category: "merge",
    hexColor: "#ef4444", // red-500
    shadowColor: "rgba(239, 68, 68, 0.2)",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split a PDF into multiple files",
    icon: Split,
    href: "/pdf-split",
    category: "split",
    hexColor: "#f97316", // orange-500
    shadowColor: "rgba(249, 115, 22, 0.2)",
  },

  {
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF",
    icon: Image,
    href: "/image-to-pdf",
    category: "convert",
    hexColor: "#3b82f6", // blue-500
    shadowColor: "rgba(59, 130, 246, 0.2)",
  },
  {
    title: "PDF to Image",
    description: "Export PDF pages as JPG or PNG images",
    icon: FileImage,
    href: "/pdf-to-image",
    category: "convert",
    hexColor: "#3b82f6", // blue-500
    shadowColor: "rgba(59, 130, 246, 0.2)",
  },

  {
    title: "Rotate PDF",
    description: "Rotate PDF pages 90°, 180°, or 270°",
    icon: RotateCw,
    href: "/pdf-rotate",
    category: "edit",
    hexColor: "#a855f7", // purple-500
    shadowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    title: "Add Watermark",
    description: "Add text or image watermarks to your PDF",
    icon: Stamp,
    href: "/pdf-watermark",
    category: "edit",
    hexColor: "#d946ef", // fuchsia-500
    shadowColor: "rgba(217, 70, 239, 0.2)",
  },
  {
    title: "Page Numbers",
    description: "Add page numbers to your PDF document",
    icon: Hash,
    href: "/page-numbers",
    category: "edit",
    hexColor: "#a855f7", // purple-500
    shadowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    title: "Delete Pages",
    description: "Remove unwanted pages from your PDF",
    icon: Trash2,
    href: "/delete-pages",
    category: "split",
    hexColor: "#f97316", // orange-500
    shadowColor: "rgba(249, 115, 22, 0.2)",
  },
  {
    title: "Word to PDF",
    description: "Convert DOCX documents to PDF format",
    icon: FileText,
    href: "/word-to-pdf",
    category: "convert",
    hexColor: "#3b82f6", // blue-500
    shadowColor: "rgba(59, 130, 246, 0.2)",
  },

];

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your files are processed strictly in your browser. Complete privacy, zero server uploads.",
    iconColor: "text-red-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Engine",
    description: "Blazing fast WebAssembly algorithms deliver true real-time processing directly on your device.",
    iconColor: "text-rose-500",
  },
  {
    icon: Globe,
    title: "Universal Access",
    description: "Flawless experience on Windows, Mac, Linux, iOS & Android. All modern browsers instantly supported.",
    iconColor: "text-orange-500",
  },
];

const Index = () => {
  return (
    <div className="bg-[#fafafa] dark:bg-background min-h-screen text-foreground overflow-hidden font-sans relative">

      {/* Hero / Header exactly matching image reference */}
      <section className="relative z-10 pt-10 pb-10 px-4 sm:px-8 w-full flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-[10px] duration-700 fill-mode-both">
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tighter text-black dark:text-gray-50 mb-2"
        >
         All-in-One PDF & Image Tools
        </h1>

        <p
          className="text-[17px] text-gray-800 dark:text-gray-200 font-medium animate-in fade-in fill-mode-both"
        >
          Convert, compress, merge, split, and manage your files effortlessly
        </p>
      </section>

      {/* Services Grid matching perfectly with exact 12 tools */}
      <section id="services" className="pb-16 px-4 sm:px-6 md:px-12 lg:px-16 w-full relative z-10 max-w-[100%] mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full relative z-10">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <div
                key={tool.title}
                className="group relative h-full animate-in fade-in slide-in-from-bottom-[20px] duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link href={tool.href} className="block w-full h-full" aria-label={`Open ${tool.title} tool`}>
                  <div
                    className="relative h-full flex flex-col p-5 rounded-2xl bg-white dark:bg-card border-y border-r border-gray-100 dark:border-white/[0.05] border-l-[3px] transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]"
                    style={{
                      // Reproduce the subtle colored drop shadow from the top-left offset edge in the image
                      boxShadow: `-4px -4px 18px -4px ${tool.shadowColor}, 0 4px 6px -1px rgba(0,0,0,0.05)`,
                      borderLeftColor: tool.hexColor
                    }}
                  >

                    <div className="relative z-10 flex align-center gap-4 h-full ">
                      {/* Colored Icon box */}
                      <div
                        className="w-[46px] h-[46px] min-w-[46px] rounded-[14px] flex items-center justify-center mb-5 shadow-sm text-white transition-transform group-hover:scale-105"
                        style={{ backgroundColor: tool.hexColor, minWidth: "46px" }}
                        aria-hidden="true"
                      >
                        <Icon strokeWidth={2} className="w-[22px] h-[22px]" aria-hidden="true" />
                      </div>

                      <div className="w-3/4">
                        <h3 className="text-[18px] font-bold tracking-tight text-black dark:text-gray-50 mb-2">
                          {tool.title}
                        </h3>

                        <p className="text-gray-500 dark:text-gray-200 text-[14px] leading-[1.4] font-medium pr-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-8 md:px-12 w-full relative overflow-hidden bg-white dark:bg-card border-t border-gray-100 dark:border-white/[0.05]">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight text-black dark:text-gray-50">Why choose us?</h2>
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            Architected for absolute security, zero latency, and flawless execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative p-8 flex flex-col items-center text-center bg-[#fafafa] dark:bg-background rounded-3xl animate-in fade-in slide-in-from-bottom-[20px] duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-white dark:bg-card flex items-center justify-center shadow-sm shrink-0 mb-6 border border-gray-100 dark:border-white/[0.05]`}
                aria-hidden="true"
              >
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className="text-[18px] font-[700] mb-3 tracking-tight text-black dark:text-gray-50">{feature.title}</h3>
              <p className="text-gray-800 dark:text-gray-200 text-[14px] leading-[1.5] font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Footer CTA */}
      {/* <section className="py-24 px-4 sm:px-8  w-full mx-auto relative border-t border-gray-100 dark:border-white/[0.05] bg-[#fafafa] dark:bg-background">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-gray-50 tracking-tight relative z-10">
            Transform your files instantly. <br /> Completely free.
          </h2>

          <div className="relative z-10 pt-4 md:pt-0">
            <a
              href="#services"
              aria-label="Scroll to PDF Tools section"
              onClick={(e) => {
                e.preventDefault();
                document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:scale-[1.02] transition-all duration-300 shadow-md"
            >
              Access Tools <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section> */}

    </div>
  );
};

export default Index;
