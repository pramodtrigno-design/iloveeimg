"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const ImageConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"webp" | "png" | "jpg">("webp");
  const [quality, setQuality] = useState([85]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedImages, setConvertedImages] = useState<{ name: string; blob: Blob }[]>([]);
  const { toast } = useToast();

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setConvertedImages([]);
  }, []);

  const convertImages = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload images to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setConvertedImages([]);

    try {
      const converted: { name: string; blob: Blob }[] = [];

      for (const file of files) {
        const img = new Image();
        const url = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(url);

        const mimeType = format === "webp" ? "image/webp" : format === "png" ? "image/png" : "image/jpeg";
        const qualityValue = format === "png" ? undefined : quality[0] / 100;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Failed to convert"))),
            mimeType,
            qualityValue
          );
        });

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        converted.push({
          name: `${baseName}.${format}`,
          blob,
        });
      }

      setConvertedImages(converted);

      toast({
        title: "Conversion complete!",
        description: `Converted ${converted.length} image(s) to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "An error occurred while converting images.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (convertedImages.length === 1) {
      saveAs(convertedImages[0].blob, convertedImages[0].name);
    } else {
      const zip = new JSZip();
      for (const image of convertedImages) {
        zip.file(image.name, image.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `converted-images.zip`);
    }
  };

  return (
    <>
      <div className="content-container py-0 pb-20">
        <ToolPageHeader
          title="Image Format Converter"
          description="Convert images to WebP, PNG, or JPG format with quality control"
          icon={RefreshCw}
          category="convert"
        />

        <div className="max-w-2xl mx-auto space-y-8">
          <FileDropzone
            files={files}
            onFilesChange={handleFilesChange}
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "image/webp": [".webp"],
              "image/gif": [".gif"],
              "image/bmp": [".bmp"],
            }}
            multiple={true}
            maxFiles={20}
            title="Drop your images here"
            subtitle="JPG, PNG, WebP, GIF, BMP supported"
          />

          {files.length > 0 && (
            <div className="space-y-6 p-6 rounded-xl bg-muted/50">
              <div className="space-y-3">
                <Label>Output Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as "webp" | "png" | "jpg")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP (Best compression, modern format)</SelectItem>
                    <SelectItem value="png">PNG (Lossless, larger size)</SelectItem>
                    <SelectItem value="jpg">JPG (Good compression, universal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {format !== "png" && (
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
                    Higher quality = larger file size
                  </p>
                </div>
              )}

              <ProcessingButton
                onClick={convertImages}
                isProcessing={isProcessing}
                processingText="Converting..."
              >
                Convert Images
              </ProcessingButton>
            </div>
          )}

          {convertedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Converted Images</h3>
                <Button onClick={downloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  {convertedImages.length === 1 ? "Download Image" : "Download All (ZIP)"}
                </Button>
              </div>

              <div className="space-y-2">
                {convertedImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                  >
                    <span className="font-medium truncate">{image.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(image.blob.size / 1024).toFixed(1)} KB
                    </span>
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

export default ImageConverter;
