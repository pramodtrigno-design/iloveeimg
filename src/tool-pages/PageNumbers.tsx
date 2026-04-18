"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Hash, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type PagePosition = "top" | "bottom";
type PageAlignment = "left" | "center" | "right";

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [position, setPosition] = useState<PagePosition>("bottom");
  const [alignment, setAlignment] = useState<PageAlignment>("center");
  const [startNumber, setStartNumber] = useState("1");
  const [format, setFormat] = useState("Page {n}");
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

  const addPageNumbers = async () => {
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
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const start = parseInt(startNumber) || 1;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = start + index;
        const text = format.replace("{n}", String(pageNumber)).replace("{total}", String(pages.length));
        const textWidth = font.widthOfTextAtSize(text, 12);

        let x: number;
        switch (alignment) {
          case "left":
            x = 40;
            break;
          case "right":
            x = width - textWidth - 40;
            break;
          default:
            x = (width - textWidth) / 2;
        }

        const y = position === "top" ? height - 30 : 30;

        page.drawText(text, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `numbered-${files[0].name}`);

      toast({
        title: "Success!",
        description: "Page numbers added successfully.",
      });
    } catch (error) {
      console.error("Error adding page numbers:", error);
      toast({
        title: "Error",
        description: "Failed to add page numbers. Please try again.",
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
          title="Add Page Numbers"
          description="Add page numbers to your PDF document."
          icon={Hash}
          category="edit"
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
                <div className="w-10 h-10 rounded-lg bg-tool-edit/10 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-5 h-5 text-tool-edit" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium mb-3 block">Position</Label>
                    <RadioGroup
                      value={position}
                      onValueChange={(v) => setPosition(v as PagePosition)}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="top" id="top" />
                        <Label htmlFor="top">Top</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="bottom" id="bottom" />
                        <Label htmlFor="bottom">Bottom</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="font-medium mb-3 block">Alignment</Label>
                    <RadioGroup
                      value={alignment}
                      onValueChange={(v) => setAlignment(v as PageAlignment)}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="left" id="left" />
                        <Label htmlFor="left">Left</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="center" id="center" />
                        <Label htmlFor="center">Center</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="right" id="right" />
                        <Label htmlFor="right">Right</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div>
                  <Label htmlFor="startNumber" className="font-medium">
                    Start from
                  </Label>
                  <Input
                    id="startNumber"
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    className="mt-2 max-w-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="format" className="font-medium">
                    Format
                  </Label>
                  <Input
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="Page {n}"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{n}"} for page number, {"{total}"} for total pages
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ProcessingButton
                  onClick={addPageNumbers}
                  isProcessing={isProcessing}
                  processingText="Adding page numbers..."
                >
                  <Download className="w-5 h-5" />
                  Add Page Numbers
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
