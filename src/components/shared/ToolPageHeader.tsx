"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ToolCategory } from "./ToolCard";

interface ToolPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
}

const iconBadgeStyles: Record<ToolCategory, string> = {
  merge: "icon-badge-merge",
  split: "icon-badge-split",
  compress: "icon-badge-compress",
  convert: "icon-badge-convert",
  edit: "icon-badge-edit",
};

export function ToolPageHeader({ title, description, icon: Icon, category }: ToolPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="tool-page-header"
    >
      <div className="flex justify-center mb-6">
        <div className={`icon-badge w-20 h-20 ${iconBadgeStyles[category]}`}>
          <Icon className="w-10 h-10" />
        </div>
      </div>
      <h1 className="section-title mb-4">{title}</h1>
      <p className="section-subtitle mx-auto">{description}</p>
    </motion.div>
  );
}
