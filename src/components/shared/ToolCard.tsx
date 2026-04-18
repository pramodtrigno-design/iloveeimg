"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export type ToolCategory = "merge" | "split" | "compress" | "convert" | "edit";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: ToolCategory;
}

const categoryStyles: Record<ToolCategory, string> = {
  merge: "tool-card-merge",
  split: "tool-card-split",
  compress: "tool-card-compress",
  convert: "tool-card-convert",
  edit: "tool-card-edit",
};

const iconBadgeStyles: Record<ToolCategory, string> = {
  merge: "icon-badge-merge",
  split: "icon-badge-split",
  compress: "icon-badge-compress",
  convert: "icon-badge-convert",
  edit: "icon-badge-edit",
};

export function ToolCard({ title, description, icon: Icon, href, category }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={href} className={`tool-card block ${categoryStyles[category]}`}>
        <div className={`icon-badge ${iconBadgeStyles[category]} mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Link>
    </motion.div>
  );
}
