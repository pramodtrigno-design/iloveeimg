"use client";

import { FileText, Clock } from "lucide-react";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";

const WordToPDF = () => {
  return (
    <>
      <div className="content-container py-12">
        <ToolPageHeader
          title="Word to PDF"
          description="Convert DOCX documents to PDF format"
          icon={FileText}
          category="convert"
        />

        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-10 text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                Word to PDF conversion requires server-side processing. We're working on
                integrating this feature. In the meantime, you can use{" "}
                <a
                  href="https://www.microsoft.com/en-us/microsoft-365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Microsoft 365
                </a>{" "}
                or{" "}
                <a
                  href="https://www.libreoffice.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  LibreOffice
                </a>{" "}
                to export Word documents as PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WordToPDF;
