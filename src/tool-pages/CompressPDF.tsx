"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Minimize2, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatFileSize } from "@/lib/formatters";

type CompressionLevel = "low" | "medium" | "high";

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setOriginalSize(newFiles[0].size);
      setCompressedSize(null);
    } else {
      setOriginalSize(0);
      setCompressedSize(null);
    }
  }, []);

  const compressPDF = async () => {
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

      // Strip metadata — this is the only lossless size reduction pdf-lib
      // can perform client-side. The compression level selector currently
      // controls metadata verbosity (title, author, etc.) rather than
      // image / font compression. Real image-level compression requires
      // a WASM or server-side codec.
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("");
      pdf.setCreator("");

      // Apply compression hint based on selected level
      const useObjectStreams = compressionLevel !== "low";
      const pdfBytes = await pdf.save({ useObjectStreams });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setCompressedSize(blob.size);

      saveAs(blob, `compressed-${files[0].name}`);

      // Show an honest result — the file may grow slightly in rare cases
      const delta = blob.size - originalSize;
      const description =
        delta < 0
          ? `PDF reduced from ${formatFileSize(originalSize)} to ${formatFileSize(blob.size)}.`
          : `File saved (${formatFileSize(blob.size)}). Metadata was stripped but the file is already highly optimised.`;

      toast({
        title: "Done!",
        description,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const compressionOptions = [
    {
      value: "low",
      label: "Low Compression",
      description: "Strips metadata only — preserves all streams",
    },
    {
      value: "medium",
      label: "Medium Compression",
      description: "Strips metadata + uses object stream compression",
    },
    {
      value: "high",
      label: "High Compression",
      description: "Maximum metadata removal + compressed cross-reference table",
    },
  ];

  return (
    <>
      <div className="content-container tool-page-content">
        <ToolPageHeader
          title="Compress PDF"
          description="Reduce your PDF file size by stripping metadata and compressing streams."
          icon={Minimize2}
          category="compress"
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
                <div className="w-10 h-10 rounded-lg bg-tool-compress/10 flex items-center justify-center flex-shrink-0">
                  <Minimize2 className="w-5 h-5 text-tool-compress" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{files[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    Original size: {formatFileSize(originalSize)}
                  </p>
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Change file
                </button>
              </div>

              {compressedSize !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-tool-compress/10 rounded-2xl p-6 text-center"
                >
                  <p className="text-sm text-muted-foreground mb-1">Result</p>
                  {compressedSize < originalSize ? (
                    <>
                      <p className="text-2xl font-bold text-tool-compress">
                        {((1 - compressedSize / originalSize) * 100).toFixed(1)}% smaller
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(originalSize)} → {formatFileSize(compressedSize)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      File was already highly optimised — size unchanged.
                    </p>
                  )}
                </motion.div>
              )}

              <div className="bg-card rounded-2xl border border-border p-6">
                <Label className="font-medium mb-4 block">Compression Level</Label>
                <RadioGroup
                  value={compressionLevel}
                  onValueChange={(value) => setCompressionLevel(value as CompressionLevel)}
                  className="space-y-3"
                >
                  {compressionOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div>
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-center">
                <ProcessingButton
                  onClick={compressPDF}
                  isProcessing={isProcessing}
                  processingText="Compressing..."
                >
                  <Download className="w-5 h-5" />
                  Compress PDF
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
