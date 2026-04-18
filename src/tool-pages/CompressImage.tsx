"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageDown, Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/formatters";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  blob: Blob;
  preview: string; // Object URL — must be revoked on cleanup
}

async function compressOne(
  file: File,
  maxWidthPx: number,
  qualityValue: number
): Promise<CompressedImage> {
  const img = new Image();
  const url = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url); // clean up input URL immediately

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxWidthPx) {
    const ratio = maxWidthPx / width;
    width = maxWidthPx;
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to compress"))),
      "image/webp",
      qualityValue
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const preview = URL.createObjectURL(blob); // revoked on component cleanup

  return {
    name: `${baseName}-compressed.webp`,
    originalSize: file.size,
    compressedSize: blob.size,
    blob,
    preview,
  };
}

const CompressImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState([75]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const { toast } = useToast();

  // Revoke all preview Object URLs when they change or on unmount
  useEffect(() => {
    return () => {
      compressedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [compressedImages]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setCompressedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  const compressImages = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload images to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCompressedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });

    try {
      // Process up to 3 images in parallel for speed, avoiding browser tab freeze
      const CONCURRENCY = 3;
      const results: CompressedImage[] = [];
      for (let i = 0; i < files.length; i += CONCURRENCY) {
        const chunk = files.slice(i, i + CONCURRENCY);
        const chunkResults = await Promise.all(
          chunk.map((f) => compressOne(f, maxWidth[0], quality[0] / 100))
        );
        results.push(...chunkResults);
      }

      setCompressedImages(results);

      const totalOriginal = results.reduce((s, img) => s + img.originalSize, 0);
      const totalCompressed = results.reduce((s, img) => s + img.compressedSize, 0);
      const savings = Math.round((1 - totalCompressed / totalOriginal) * 100);

      toast({
        title: "Compression complete!",
        description: `Reduced total size by ${savings}%.`,
      });
    } catch (error) {
      console.error("Compression error:", error);
      toast({
        title: "Compression failed",
        description: "An error occurred while compressing images.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (compressedImages.length === 1) {
      saveAs(compressedImages[0].blob, compressedImages[0].name);
    } else {
      const zip = new JSZip();
      for (const image of compressedImages) {
        zip.file(image.name, image.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "compressed-images.zip");
    }
  };

  const totalStats =
    compressedImages.length > 0
      ? {
        original: compressedImages.reduce((s, img) => s + img.originalSize, 0),
        compressed: compressedImages.reduce((s, img) => s + img.compressedSize, 0),
      }
      : null;

  return (
    <>
      <div className="content-container pb-12">
        <ToolPageHeader
          title="Image Compressor"
          description="Compress images to reduce file size while maintaining quality"
          icon={ImageDown}
          category="compress"
        />

        <div className="max-w-2xl mx-auto space-y-8">
          <FileDropzone
            files={files}
            onFilesChange={handleFilesChange}
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "image/webp": [".webp"],
            }}
            multiple={true}
            maxFiles={20}
            title="Drop your images here"
            subtitle="JPG, PNG, WebP supported"
          />

          {files.length > 0 && (
            <div className="space-y-6 p-6 rounded-xl bg-muted/50">
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
                <p className="text-sm text-muted-foreground">
                  Lower quality = smaller file size
                </p>
              </div>

              <div className="space-y-3">
                <Label>Max Width: {maxWidth[0]}px</Label>
                <Slider
                  value={maxWidth}
                  onValueChange={setMaxWidth}
                  min={640}
                  max={3840}
                  step={160}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Images wider than this will be resized proportionally
                </p>
              </div>

              <ProcessingButton
                onClick={compressImages}
                isProcessing={isProcessing}
                processingText="Compressing..."
              >
                Compress Images
              </ProcessingButton>
            </div>
          )}

          {compressedImages.length > 0 && totalStats && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Compression Results</h3>
                  <span className="text-2xl font-bold text-primary">
                    -{Math.round((1 - totalStats.compressed / totalStats.original) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Original: {formatFileSize(totalStats.original)}
                  </span>
                  <span>→</span>
                  <span className="font-medium text-primary">
                    Compressed: {formatFileSize(totalStats.compressed)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Compressed Images</h3>
                <Button onClick={downloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  {compressedImages.length === 1 ? "Download" : "Download All (ZIP)"}
                </Button>
              </div>

              <div className="space-y-3">
                {compressedImages.map((image, index) => {
                  const savings = Math.round(
                    (1 - image.compressedSize / image.originalSize) * 100
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border"
                    >
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{image.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(image.originalSize)}</span>
                          <span>→</span>
                          <span className="text-primary font-medium">
                            {formatFileSize(image.compressedSize)}
                          </span>
                        </div>
                        <Progress value={100 - savings} className="h-1.5 mt-2" />
                      </div>
                      <span className="text-lg font-bold text-primary">-{savings}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CompressImage;
