"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ImageDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "All Tools", href: "/" },
  { label: "Merge PDF", href: "/pdf-merge" },
  { label: "Split PDF", href: "/pdf-split" },
  { label: "Compress", href: "/compress-pdf" },
  { label: "Image Compress", href: "/image-compress" },
  { label: "Image Convert", href: "/image-convert" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="w-full px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="iLoveIMG Home">
            <div className="w-8 h-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-r from-red-500 via-red-500 to-pink-700 flex items-center justify-center" aria-hidden="true">
              <ImageDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl md:text-3xl font-bold"><span className="text-red-600">iLovee</span>IMG</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? "nav-link-active" : ""
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
