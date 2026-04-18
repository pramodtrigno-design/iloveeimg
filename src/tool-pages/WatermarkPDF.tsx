"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { Stamp, Download, Eye, File as FileIcon } from "lucide-react";
import { saveAs } from "file-saver";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState([48]);
  const [opacity, setOpacity] = useState([30]);
  const [position, setPosition] = useState<Position>("center");
  const [rotation, setRotation] = useState([45]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke: string | null = null;
    let timerId: NodeJS.Timeout;

    const generatePreview = async () => {
      if (files.length === 0 || !watermarkText.trim()) {
        if (isMounted) setPreviewUrl(null);
        return;
      }
      if (isMounted) setIsPreviewLoading(true);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize[0]);

          let x: number, y: number;
          switch (position) {
            case "top-left":
              x = 50;
              y = height - 50;
              break;
            case "top-right":
              x = width - textWidth - 50;
              y = height - 50;
              break;
            case "bottom-left":
              x = 50;
              y = 50;
              break;
            case "bottom-right":
              x = width - textWidth - 50;
              y = 50;
              break;
            default:
              x = (width - textWidth) / 2;
              y = height / 2;
          }

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize[0],
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity: opacity[0] / 100,
            rotate: degrees(position === "center" ? rotation[0] : 0),
          });
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
  }, [files, watermarkText, fontSize, opacity, position, rotation]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const addWatermark = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please add a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    if (!watermarkText.trim()) {
      toast({
        title: "Error",
        description: "Please enter watermark text.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize[0]);

        let x: number, y: number;
        switch (position) {
          case "top-left":
            x = 50;
            y = height - 50;
            break;
          case "top-right":
            x = width - textWidth - 50;
            y = height - 50;
            break;
          case "bottom-left":
            x = 50;
            y = 50;
            break;
          case "bottom-right":
            x = width - textWidth - 50;
            y = 50;
            break;
          default:
            x = (width - textWidth) / 2;
            y = height / 2;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize[0],
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity[0] / 100,
          rotate: degrees(position === "center" ? rotation[0] : 0),
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `watermarked-${files[0].name}`);

      toast({
        title: "Success!",
        description: "Watermark added successfully.",
      });
    } catch (error) {
      console.error("Error adding watermark:", error);
      toast({
        title: "Error",
        description: "Failed to add watermark. Please try again.",
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
          title="Add Watermark"
          description="Add text watermarks to your PDF documents."
          icon={Stamp}
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
                  <Stamp className="w-5 h-5 text-tool-edit" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{files[0].name}</p>
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
                  <Label htmlFor="watermarkText" className="font-medium">
                    Watermark Text
                  </Label>
                  <Input
                    id="watermarkText"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="font-medium">Font Size: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={12}
                    max={120}
                    step={1}
                    className="mt-3"
                  />
                </div>

                <div>
                  <Label className="font-medium">Opacity: {opacity[0]}%</Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    min={5}
                    max={100}
                    step={5}
                    className="mt-3"
                  />
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Position</Label>
                  <RadioGroup
                    value={position}
                    onValueChange={(value) => setPosition(value as Position)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: "top-left", label: "Top Left" },
                      { value: "center", label: "Center" },
                      { value: "top-right", label: "Top Right" },
                      { value: "bottom-left", label: "Bottom Left" },
                      { value: "bottom-right", label: "Bottom Right" },
                    ].map((pos) => (
                      <div
                        key={pos.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${position === pos.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                          }`}
                        onClick={() => setPosition(pos.value as Position)}
                      >
                        <RadioGroupItem value={pos.value} id={pos.value} />
                        <Label htmlFor={pos.value} className="cursor-pointer text-sm">
                          {pos.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {position === "center" && (
                  <div>
                    <Label className="font-medium">Rotation: {rotation[0]}°</Label>
                    <Slider
                      value={rotation}
                      onValueChange={setRotation}
                      min={-90}
                      max={90}
                      step={5}
                      className="mt-3"
                    />
                  </div>
                )}
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
                      <DialogTitle>Preview Watermarked PDF</DialogTitle>
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
                  onClick={addWatermark}
                  isProcessing={isProcessing}
                  processingText="Adding watermark..."
                >
                  <Download className="w-5 h-5" />
                  Add Watermark
                </ProcessingButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
