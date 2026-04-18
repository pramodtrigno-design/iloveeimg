import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/formatters";

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  title?: string;
  subtitle?: string;
}

export function FileDropzone({
  files,
  onFilesChange,
  accept = { "application/pdf": [".pdf"] },
  multiple = true,
  maxFiles = 20,
  maxSize = 100 * 1024 * 1024, // 100MB
  title = "Drop PDF files here",
  subtitle = "or click to browse",
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (multiple) {
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
        onFilesChange(newFiles);
      } else {
        onFilesChange(acceptedFiles.slice(0, 1));
      }
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`dropzone cursor-pointer dropzone-active ${isDragActive ? "dropzone-active" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Max {formatFileSize(maxSize)} per file
            {multiple && ` • Up to ${maxFiles} files`}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="file-item"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
