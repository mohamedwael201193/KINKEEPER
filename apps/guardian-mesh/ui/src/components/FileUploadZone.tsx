import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileAudio } from "lucide-react";
import { cn } from "@/lib/cn";

const AUDIO_ACCEPT = ".wav,.mp3,.m4a,.aac,audio/*";

export function FileUploadZone({
  accept,
  label,
  hint,
  onFile,
  disabled,
}: {
  accept: string;
  label: string;
  hint: string;
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);

  const handle = useCallback(
    (file: File | undefined) => {
      if (file && !disabled) onFile(file);
    },
    [disabled, onFile],
  );

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={cn(
        "glass-card relative flex min-h-[220px] flex-col items-center justify-center border-2 border-dashed p-8 transition",
        drag ? "border-accent bg-accent/5" : "border-white/10",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <Upload className="h-10 w-10 text-accent-soft" aria-hidden />
      <p className="mt-4 text-lg font-medium text-white">{label}</p>
      <p className="mt-1 text-sm text-steel">{hint}</p>
      <label className="btn-primary mt-6 cursor-pointer">
        <FileAudio className="h-4 w-4" aria-hidden />
        Browse file
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </label>
    </motion.div>
  );
}

export { AUDIO_ACCEPT };
