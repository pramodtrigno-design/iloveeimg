"use client";

import { useState, useCallback, useEffect } from "react";
import { FileImage, Download, Eye } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Set up PDF.js worker — use CDN for Next.js compatibility
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const PDFToImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState([90]);
  const [scale, setScale] = useState([2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<{ name: string; data: string }[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const generatePreview = async () => {
      if (files.length === 0) {
        if (isMounted) setPreviewImages([]);
        return;
      }
      if (isMounted) setIsPreviewLoading(true);

      try {
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        // Render up to 5 pages for quick preview
        const pageCount = Math.min(pdf.numPages, 5);

        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          // Use smaller scale for preview generation to prevent lag
          const viewport = page.getViewport({ scale: Math.min(scale[0], 1.5) });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const mimeType = format === "png" ? "image/png" : "image/jpeg";
          const qualityValue = format === "png" ? undefined : quality[0] / 100;
          const dataUrl = canvas.toDataURL(mimeType, qualityValue);
          images.push(dataUrl);
        }

        if (isMounted) setPreviewImages(images);
      } catch (error) {
        console.error("Preview error:", error);
        if (isMounted) setPreviewImages([]);
      } finally {
        if (isMounted) setIsPreviewLoading(false);
      }
    };

    timerId = setTimeout(() => {
      generatePreview();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [files, format, quality, scale]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setProcessedImages([]);
  }, []);

  const convertToImages = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessedImages([]);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: { name: string; data: string }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale[0] });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const qualityValue = format === "png" ? undefined : quality[0] / 100;
        const dataUrl = canvas.toDataURL(mimeType, qualityValue);

        images.push({
          name: `page-${i}.${format}`,
          data: dataUrl,
        });
      }

      setProcessedImages(images);

      toast({
        title: "Conversion complete!",
        description: `Converted ${images.length} page(s) to ${format.toUpperCase()} images.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "An error occurred while converting the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = (image: { name: string; data: string }) => {
    // Append to DOM for Safari/Firefox compatibility, then clean up
    const link = document.createElement("a");
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (processedImages.length === 1) {
      downloadSingle(processedImages[0]);
    } else {
      // Multiple images — create ZIP
      const zip = new JSZip();
      for (const image of processedImages) {
        const base64Data = image.data.split(",")[1];
        zip.file(image.name, base64Data, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "pdf-images.zip");
    }
  };

  return (
    <>
      <div className="content-container py-12">
        <ToolPageHeader
          title="PDF to Image"
          description="Convert PDF pages to high-quality JPG or PNG images"
          icon={FileImage}
          category="convert"
        />

        <div className="max-w-2xl mx-auto space-y-8">
          <FileDropzone
            files={files}
            onFilesChange={handleFilesChange}
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            maxFiles={1}
            title="Drop your PDF file here"
            subtitle="or click to browse"
          />

          {files.length > 0 && (
            <div className="space-y-6 p-6 rounded-xl bg-muted/50">
              <div className="space-y-3">
                <Label>Output Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpg")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Best quality, larger size)</SelectItem>
                    <SelectItem value="jpg">JPG (Smaller size, adjustable quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {format === "jpg" && (
                <div className="space-y-3">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>Scale: {scale[0]}x</Label>
                <Slider
                  value={scale}
                  onValueChange={setScale}
                  min={1}
                  max={4}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Higher scale = better quality but larger file size
                </p>
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
                      <DialogTitle>Preview Images (First {previewImages.length} pages)</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full border rounded-xl bg-muted/30 overflow-y-auto p-4 shadow-sm mt-4 relative">
                      {isPreviewLoading && previewImages.length === 0 && (
                        <div className="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                          <p className="text-muted-foreground animate-pulse font-medium">Generating live view...</p>
                        </div>
                      )}

                      {previewImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {previewImages.map((img, idx) => (
                            <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-full rounded border shadow-sm" />
                          ))}
                        </div>
                      ) : (
                        !isPreviewLoading && (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                            <FileImage className="w-12 h-12 mb-2" />
                            <p>No preview available</p>
                          </div>
                        )
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <ProcessingButton
                  onClick={convertToImages}
                  isProcessing={isProcessing}
                  processingText="Converting..."
                >
                  Convert to Images
                </ProcessingButton>
              </div>
            </div>
          )}

          {processedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Converted Images</h3>
                <Button onClick={downloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  {processedImages.length === 1 ? "Download Image" : "Download All (ZIP)"}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {processedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.data}
                      alt={`Page ${index + 1}`}
                      className="w-full rounded-lg border shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => downloadSingle(image)}
                        className="text-white text-sm font-medium hover:underline"
                        aria-label={`Download page ${index + 1}`}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PDFToImage;
