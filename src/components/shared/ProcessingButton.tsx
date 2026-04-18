import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessingButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  processingText?: string;
}

export function ProcessingButton({
  onClick,
  isProcessing,
  disabled,
  children,
  processingText = "Processing...",
}: ProcessingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className="btn-tool w-full md:w-auto"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {processingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
