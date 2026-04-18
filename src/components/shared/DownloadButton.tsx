import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

interface DownloadButtonProps {
  data: Blob | null;
  filename: string;
  disabled?: boolean;
}

export function DownloadButton({ data, filename, disabled }: DownloadButtonProps) {
  const handleDownload = () => {
    if (data) {
      saveAs(data, filename);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || !data}
      className="btn-tool w-full md:w-auto"
      size="lg"
    >
      <Download className="w-5 h-5" />
      Download
    </Button>
  );
}
