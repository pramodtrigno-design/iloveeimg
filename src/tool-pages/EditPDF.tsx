"use client";

import { useState, useCallback } from "react";
import { SquarePen, File as FileIcon, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ToolPageHeader } from "@/components/shared/ToolPageHeader";
import { PDFEditorWorkspace } from "@/components/pdf-editor/PDFEditorWorkspace";

export default function EditPDF() {
    const [file, setFile] = useState<File | null>(null);

    const handleFilesAdded = useCallback((newFiles: File[]) => {
        if (newFiles.length > 0) {
            setFile(newFiles[0]);
        }
    }, []);

    const removeFile = () => {
        setFile(null);
    };

    return (
        <>
            <div className="content-container tool-page-content">
                {!file && (
                    <ToolPageHeader
                        title="Edit PDF"
                        description="Add text, images, shapes, and freehand drawings to your PDF document. All processing is done locally in your browser."
                        icon={SquarePen}
                        category="edit"
                    />
                )}

                <div className={`mx-auto ${file ? "w-full max-w-none px-0" : "max-w-3xl"}`}>
                    {!file ? (
                        <FileDropzone
                            files={[]}
                            onFilesChange={handleFilesAdded}
                            title="Drop PDF file here"
                            subtitle="or click to browse"
                            accept={{ "application/pdf": [".pdf"] }}
                            multiple={false}
                        />
                    ) : (
                        <div className="flex flex-col h-[calc(100vh-120px)] bg-background border rounded-2xl overflow-hidden shadow-2xl relative">
                            <div className="absolute top-4 right-4 z-50">
                                <button
                                    onClick={removeFile}
                                    className="p-2 bg-background/80 backdrop-blur-md border rounded-full hover:bg-muted/80 transition-colors shadow-sm"
                                    title="Close editor and pick another file"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            <PDFEditorWorkspace file={file} onCancel={removeFile} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
