"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Image, Download, GripVertical, File as FileIcon, X, Eye } from "lucide-react";
import { saveAs } from "file-saver";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { ProcessingButton } from "@/components/shared/ProcessingButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "@/lib/formatters";

interface FileWithId {
  file: File;
  id: string; // stable, generated once at drop time
  preview: string; // url to preview the image thumbnail
}

interface SortableFileItemProps {
  fileWithId: FileWithId;
  onRemove: (id: string) => void;
}

function SortableFileItem({ fileWithId, onRemove }: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: fileWithId.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="file-item">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="w-12 h-12 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
        <img
          src={fileWithId.preview}
          alt={fileWithId.file.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{fileWithId.file.name}</p>
        <p className="text-sm text-muted-foreground">{formatFileSize(fileWithId.file.size)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        aria-label={`Remove ${fileWithId.file.name}`}
        onClick={() => onRemove(fileWithId.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function ImageToPDF() {
  const [fileItems, setFileItems] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPdfPreviewLoading, setIsPdfPreviewLoading] = useState(false);
  const { toast } = useToast();
  const idCounter = useRef(0);

  const generateId = () => {
    idCounter.current += 1;
    return `file-${idCounter.current}-${Date.now()}`;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFileItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newItems = newFiles.map((file) => ({
      file,
      id: generateId(),
      preview: URL.createObjectURL(file), // Generate preview explicitly
    }));

    setFileItems((prev) => [...prev, ...newItems]);
  }, []);

  const removeFile = (id: string) => {
    setFileItems((prev) => {
      const removedItem = prev.find((item) => item.id === id);
      if (removedItem) {
        URL.revokeObjectURL(removedItem.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Cleanup Object URLs when components unmount
  useEffect(() => {
    return () => {
      fileItems.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [fileItems]);

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke: string | null = null;
    let timerId: NodeJS.Timeout;

    const generatePdfPreview = async () => {
      if (fileItems.length === 0) {
        if (isMounted) setPdfPreviewUrl(null);
        return;
      }
      if (isMounted) setIsPdfPreviewLoading(true);

      try {
        const pdfDoc = await PDFDocument.create();
        for (const item of fileItems) {
          const arrayBuffer = await item.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          if (item.file.type === "image/jpeg" || item.file.type === "image/jpg") {
            const image = await pdfDoc.embedJpg(uint8Array);
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
          } else if (item.file.type === "image/png") {
            const image = await pdfDoc.embedPng(uint8Array);
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
          }
        }

        if (pdfDoc.getPageCount() === 0) {
          if (isMounted) setPdfPreviewUrl(null);
          return;
        }

        if (!isMounted) return;

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;

        if (isMounted) {
          setPdfPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("PDF preview generation failed", error);
        if (isMounted) setPdfPreviewUrl(null);
      } finally {
        if (isMounted) setIsPdfPreviewLoading(false);
      }
    };

    timerId = setTimeout(() => {
      generatePdfPreview();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [fileItems]);

  const clearAllFiles = () => {
    fileItems.forEach((item) => URL.revokeObjectURL(item.preview));
    setFileItems([]);
  };

  const convertToPDF = async () => {
    if (fileItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const skipped: string[] = [];

      for (const item of fileItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        if (item.file.type === "image/jpeg" || item.file.type === "image/jpg") {
          const image = await pdfDoc.embedJpg(uint8Array);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else if (item.file.type === "image/png") {
          const image = await pdfDoc.embedPng(uint8Array);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          skipped.push(item.file.name);
        }
      }

      if (pdfDoc.getPageCount() === 0) {
        toast({
          title: "No supported images",
          description: "Only JPG and PNG are supported. Please convert other formats first.",
          variant: "destructive",
        });
        return;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, "images.pdf");

      if (skipped.length > 0) {
        toast({
          title: `Converted with warnings`,
          description: `Skipped ${skipped.length} unsupported file(s): ${skipped.join(", ")}`,
        });
      } else {
        toast({
          title: "Success!",
          description: `${fileItems.length} image${fileItems.length !== 1 ? "s" : ""} converted to PDF.`,
        });
      }
    } catch (error) {
      console.error("Error converting to PDF:", error);
      toast({
        title: "Error",
        description: "Failed to convert images. Please ensure they are valid JPG or PNG files.",
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
          title="Image to PDF"
          description="Convert your images to a PDF document. Supports JPG and PNG formats."
          icon={Image}
          category="convert"
        />

        <div className="max-w-3xl mx-auto">
          {fileItems.length === 0 ? (
            <FileDropzone
              files={[]}
              onFilesChange={handleFilesAdded}
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              title="Drop images here"
              subtitle="JPG, PNG supported"
            />
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fileItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fileItems.map((item) => (
                      <SortableFileItem
                        key={item.id}
                        fileWithId={item}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <FileDropzone
                files={[]}
                onFilesChange={handleFilesAdded}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                title="Add more images"
                subtitle="Drop here or click"
              />

              <div className="flex justify-center items-center gap-4 pt-4">
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-muted-foreground hover:text-foreground mr-2"
                >
                  Clear all
                </button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={fileItems.length === 0}>
                      <Eye className="w-5 h-5" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Preview Image to PDF</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full border rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden relative shadow-sm mt-4">
                      {isPdfPreviewLoading && !pdfPreviewUrl && (
                        <div className="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                          <p className="text-muted-foreground animate-pulse font-medium">Generating live view...</p>
                        </div>
                      )}
                      {isPdfPreviewLoading && pdfPreviewUrl && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm">
                          <div className="w-6 h-6 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                        </div>
                      )}
                      {pdfPreviewUrl ? (
                        <iframe
                          src={`${pdfPreviewUrl}#view=FitH`}
                          className="w-full h-full border-0 bg-white"
                          title="PDF Preview"
                        />
                      ) : (
                        !isPdfPreviewLoading && (
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
                  onClick={convertToPDF}
                  isProcessing={isProcessing}
                  processingText="Converting..."
                >
                  <Download className="w-5 h-5" />
                  Convert to PDF
                </ProcessingButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
