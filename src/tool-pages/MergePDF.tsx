"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Combine, GripVertical, File as FileIcon, X, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "@/lib/formatters";

// FileWithId attaches a stable UUID so DnD IDs never collide even when
// two files share the same name.
interface FileWithId {
  file: File;
  id: string; // stable, generated once at drop time
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
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileIcon className="w-5 h-5 text-primary" />
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

export default function MergePDF() {
  const [fileItems, setFileItems] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toast } = useToast();
  const idCounter = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke: string | null = null;

    const generatePreview = async () => {
      if (fileItems.length === 0) {
        if (isMounted) setPreviewUrl(null);
        return;
      }
      if (isMounted) setIsPreviewLoading(true);
      try {
        const mergedPdf = await PDFDocument.create();
        for (const { file } of fileItems) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        if (!isMounted) return;

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
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

    const timerId = setTimeout(() => {
      generatePreview();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [fileItems]);

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
    setFileItems((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ file, id: generateId() })),
    ]);
  }, []);

  const removeFile = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const mergePDFs = async () => {
    if (fileItems.length < 2) {
      toast({
        title: "Error",
        description: "Please add at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const { file } of fileItems) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      saveAs(blob, "merged.pdf");

      toast({
        title: "Success!",
        description: "Your PDFs have been merged successfully.",
      });
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please ensure all files are valid PDFs.",
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
          title="Merge PDF"
          description="Combine multiple PDF files into one document. Drag and drop to reorder files."
          icon={Combine}
          category="merge"
        />

        <div className="max-w-3xl mx-auto">
          {fileItems.length === 0 ? (
            <FileDropzone
              files={[]}
              onFilesChange={handleFilesAdded}
              title="Drop PDF files here"
              subtitle="or click to browse"
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
                title="Add more files"
                subtitle="Drop here or click to browse"
              />

              <div className="flex justify-center gap-4 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={fileItems.length === 0}>
                      <Eye className="w-5 h-5" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Preview Merged PDF</DialogTitle>
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
                  onClick={mergePDFs}
                  isProcessing={isProcessing}
                  disabled={fileItems.length < 2}
                  processingText="Merging PDFs..."
                >
                  <Combine className="w-5 h-5" />
                  Merge {fileItems.length} PDF{fileItems.length !== 1 ? "s" : ""}
                </ProcessingButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
