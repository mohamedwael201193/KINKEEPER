import { useRef, useState } from "react";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AudioUploadPanel({
  label,
  description,
  accept = "audio/*,.mp3,.wav,.webm,.ogg",
  disabled,
  isUploading,
  successMessage,
  onUpload,
}: {
  label: string;
  description: string;
  accept?: string;
  disabled?: boolean;
  isUploading?: boolean;
  successMessage?: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled || isUploading) return;
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">{label}</Label>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>

      {successMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-trust-safe/25 bg-trust-safe/5 p-4 text-sm text-trust-safe">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-accent bg-accent/5" : "border-ink/15 bg-canvas-muted/30",
          disabled && "opacity-50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-ink-muted" />
        <p className="mt-2 text-sm font-medium">Drop an audio file here</p>
        <p className="mt-1 text-xs text-ink-faint">MP3, WAV, or phone recording · max ~25 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Choose file"
          )}
        </Button>
      </div>
    </div>
  );
}

export function SuccessBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-trust-safe/25 bg-trust-safe/5 px-4 py-3 text-sm">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-trust-safe" />
        <span>{message}</span>
      </div>
      {onDismiss ? (
        <button type="button" className="text-xs text-ink-muted hover:text-ink" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
