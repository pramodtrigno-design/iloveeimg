"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Trash2, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function DeletePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState<number>(0);
  const [customRange, setCustomRange] = useState("");
  const { toast } = useToast();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setPagesToDelete(new Set());
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
      } catch (error) {
        console.error("Error reading PDF:", error);
        setTotalPages(0);
      }
    } else {
      setTotalPages(0);
    }
  }, []);

  const togglePage = (page: number) => {
    const newSet = new Set(pagesToDelete);
    if (newSet.has(page)) {
      newSet.delete(page);
    } else {
      newSet.add(page);
    }
    setPagesToDelete(newSet);
  };

  const parseCustomRange = () => {
    const pages: Set<number> = new Set();
    const parts = customRange.split(",").map((s) => s.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          pages.add(page);
        }
      }
    }

    setPagesToDelete(pages);
  };

  const deletePages = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please add a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    if (pagesToDelete.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one page to delete.",
        variant: "destructive",
      });
      return;
    }

    if (pagesToDelete.size >= totalPages) {
      toast({
        title: "Error",
        description: "Cannot delete all pages. At least one page must remain.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Get indices of pages to keep (convert 1-based to 0-based)
      const pagesToKeep: number[] = [];
      for (let i = 1; i <= totalPages; i++) {
        if (!pagesToDelete.has(i)) {
          pagesToKeep.push(i - 1);
        }
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `modified-${files[0].name}`);

      toast({
        title: "Success!",
        description: `${pagesToDelete.size} page${pagesToDelete.size !== 1 ? "s" : ""} deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting pages:", error);
      toast({
        title: "Error",
        description: "Failed to delete pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="content-container tool-page-content">
        <ToolPageHeader
          title="Delete Pages"
          description="Remove unwanted pages from your PDF document."
          icon={Trash2}
          category="split"
        />

        <div className="max-w-2xl mx-auto">
          {files.length === 0 ? (
            <FileDropzone
              files={files}
              onFilesChange={handleFilesChange}
              multiple={false}
              title="Drop a PDF file here"
              subtitle="or click to browse"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="file-item">
                <div className="w-10 h-10 rounded-lg bg-tool-split/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-tool-split" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{files[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalPages} page{totalPages !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Change file
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <Label className="font-medium mb-3 block">
                    Quick select (enter page numbers)
                  </Label>
                  <div className="flex gap-2">
                    {/* Use design-system components for dark-mode + accessibility */}
                    <Input
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="e.g., 1,3,5-7"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && parseCustomRange()}
                    />
                    <Button variant="secondary" onClick={parseCustomRange}>
                      Select
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="font-medium mb-3 block">
                    Select pages to delete ({pagesToDelete.size} selected)
                  </Label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => togglePage(page)}
                        aria-label={`Page ${page}${pagesToDelete.has(page) ? " (selected for deletion)" : ""}`}
                        aria-pressed={pagesToDelete.has(page)}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition-all text-sm font-medium ${pagesToDelete.has(page)
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted hover:bg-muted/80"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>

                {pagesToDelete.size > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Pages to delete: {Array.from(pagesToDelete).sort((a, b) => a - b).join(", ")}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <ProcessingButton
                  onClick={deletePages}
                  isProcessing={isProcessing}
                  disabled={pagesToDelete.size === 0}
                  processingText="Deleting pages..."
                >
                  <Download className="w-5 h-5" />
                  Delete {pagesToDelete.size} Page{pagesToDelete.size !== 1 ? "s" : ""}
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
