"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { RotateCw, Download, Eye, File as FileIcon } from "lucide-react";
import { saveAs } from "file-saver";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { parsePageRange } from "@/lib/pdfUtils";

type RotationDegrees = 90 | 180 | 270;

export default function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<RotationDegrees>(90);
  const [rotateAll, setRotateAll] = useState(true);
  const [selectedPages, setSelectedPages] = useState("1");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke: string | null = null;
    let timerId: NodeJS.Timeout;

    const generatePreview = async () => {
      if (files.length === 0) {
        if (isMounted) setPreviewUrl(null);
        return;
      }
      if (isMounted) setIsPreviewLoading(true);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();

        const pagesToRotate = rotateAll
          ? pages.map((_, i) => i)
          : parsePageRange(selectedPages, pages.length);

        for (const pageIndex of pagesToRotate) {
          if (pageIndex < pages.length) {
            const page = pages[pageIndex];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + rotation));
          }
        }

        if (!isMounted) return;

        const pdfBytes = await pdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;

        if (isMounted) {
          setPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Preview generation failed", error);
        if (isMounted) setPreviewUrl(null);
      } finally {
        if (isMounted) setIsPreviewLoading(false);
      }
    };

    timerId = setTimeout(() => {
      generatePreview();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [files, rotation, rotateAll, selectedPages]);

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

  const rotatePDF = async () => {
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
      const pages = pdf.getPages();

      const pagesToRotate = rotateAll
        ? pages.map((_, i) => i)
        : parsePageRange(selectedPages, pages.length);

      for (const pageIndex of pagesToRotate) {
        if (pageIndex < pages.length) {
          const page = pages[pageIndex];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotation));
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `rotated-${files[0].name}`);

      toast({
        title: "Success!",
        description: "PDF pages rotated successfully.",
      });
    } catch (error) {
      console.error("Error rotating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to rotate PDF. Please try again.",
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
          title="Rotate PDF"
          description="Rotate PDF pages by 90°, 180°, or 270°."
          icon={RotateCw}
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
                  <RotateCw className="w-5 h-5 text-tool-edit" />
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
                  <Label className="font-medium mb-4 block">Rotation Angle</Label>
                  <div className="flex gap-3">
                    {([90, 180, 270] as RotationDegrees[]).map((deg) => (
                      <Button
                        key={deg}
                        variant={rotation === deg ? "default" : "outline"}
                        onClick={() => setRotation(deg)}
                        className="flex-1"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        {deg}°
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium mb-4 block">Pages to Rotate</Label>
                  <RadioGroup
                    value={rotateAll ? "all" : "selected"}
                    onValueChange={(value) => setRotateAll(value === "all")}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="cursor-pointer">
                        All pages
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="selected" id="selected" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="selected" className="cursor-pointer">
                          Specific pages
                        </Label>
                        {/* Use design-system Input instead of raw <input> for
                            consistent dark mode, focus ring, and accessibility */}
                        {!rotateAll && (
                          <Input
                            type="text"
                            value={selectedPages}
                            onChange={(e) => setSelectedPages(e.target.value)}
                            placeholder="e.g., 1,3,5-7"
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={files.length === 0}>
                      <Eye className="w-5 h-5" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Preview Rotated PDF</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full border rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden relative shadow-sm mt-4">
                      {isPreviewLoading && !previewUrl && (
                        <div className="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                          <p className="text-muted-foreground animate-pulse font-medium">Generating live view...</p>
                        </div>
                      )}
                      {isPreviewLoading && previewUrl && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm">
                          <div className="w-6 h-6 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                        </div>
                      )}
                      {previewUrl ? (
                        <iframe
                          src={`${previewUrl}#view=FitH`}
                          className="w-full h-full border-0 bg-white"
                          title="PDF Preview"
                        />
                      ) : (
                        !isPreviewLoading && (
                          <div className="flex flex-col items-center justify-center text-muted-foreground opacity-70">
                            <FileIcon className="w-12 h-12 mb-2" />
                            <p>No preview available</p>
                          </div>
                        )
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <ProcessingButton
                  onClick={rotatePDF}
                  isProcessing={isProcessing}
                  processingText="Rotating..."
                >
                  <Download className="w-5 h-5" />
                  Rotate PDF
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
