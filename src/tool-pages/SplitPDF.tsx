"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Split, Download } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { parsePageRange } from "@/lib/pdfUtils";

type SplitMode = "range" | "extract" | "every";

export default function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>("range");
  const [pageRange, setPageRange] = useState("1-5");
  const [extractPages, setExtractPages] = useState("1,3,5");
  const [splitEvery, setSplitEvery] = useState("1");
  const [totalPages, setTotalPages] = useState<number>(0);
  const { toast } = useToast();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
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

  const splitPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please add a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      let pageSets: number[][] = [];

      if (splitMode === "range") {
        const pages = parsePageRange(pageRange, pageCount);
        if (pages.length === 0) {
          throw new Error("Invalid page range — please check your input.");
        }
        pageSets = [pages];
      } else if (splitMode === "extract") {
        const pages = parsePageRange(extractPages, pageCount);
        if (pages.length === 0) {
          throw new Error("Invalid page numbers — please check your input.");
        }
        pageSets = pages.map((p) => [p]);
      } else if (splitMode === "every") {
        const every = parseInt(splitEvery, 10);
        if (isNaN(every) || every < 1) {
          throw new Error("Split interval must be a positive number.");
        }
        for (let i = 0; i < pageCount; i += every) {
          const set: number[] = [];
          for (let j = i; j < Math.min(i + every, pageCount); j++) {
            set.push(j);
          }
          pageSets.push(set);
        }
      }

      if (pageSets.length === 1 && splitMode !== "extract") {
        // Single file output
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pageSets[0]);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        saveAs(blob, "split.pdf");
      } else {
        // Multiple files — create zip
        const zip = new JSZip();
        for (let i = 0; i < pageSets.length; i++) {
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, pageSets[i]);
          copiedPages.forEach((page) => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          zip.file(`page-${i + 1}.pdf`, pdfBytes);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "split-pages.zip");
      }

      toast({
        title: "Success!",
        description: "Your PDF has been split successfully.",
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to split PDF. Please try again.",
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
          title="Split PDF"
          description="Extract pages or split your PDF into multiple files."
          icon={Split}
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
                  <Split className="w-5 h-5 text-tool-split" />
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
                <RadioGroup
                  value={splitMode}
                  onValueChange={(value) => setSplitMode(value as SplitMode)}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="range" id="range" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="range" className="font-medium cursor-pointer">
                        Extract page range
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Extract a range of pages into a new PDF
                      </p>
                      {splitMode === "range" && (
                        <Input
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          placeholder="e.g., 1-5 or 1-3,5-7"
                          className="max-w-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="extract" id="extract" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="extract" className="font-medium cursor-pointer">
                        Extract specific pages
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Extract individual pages as separate PDFs
                      </p>
                      {splitMode === "extract" && (
                        <Input
                          value={extractPages}
                          onChange={(e) => setExtractPages(e.target.value)}
                          placeholder="e.g., 1,3,5,7"
                          className="max-w-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="every" id="every" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="every" className="font-medium cursor-pointer">
                        Split every N pages
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Split the PDF into chunks of N pages each
                      </p>
                      {splitMode === "every" && (
                        <Input
                          type="number"
                          min="1"
                          value={splitEvery}
                          onChange={(e) => setSplitEvery(e.target.value)}
                          placeholder="1"
                          className="max-w-[100px]"
                        />
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-center">
                <ProcessingButton
                  onClick={splitPDF}
                  isProcessing={isProcessing}
                  processingText="Splitting PDF..."
                >
                  <Download className="w-5 h-5" />
                  Split PDF
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
