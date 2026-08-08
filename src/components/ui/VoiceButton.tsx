"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface VoiceButtonProps {
  onResult: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
  language?: string;
}

export default function VoiceButton({
  onResult,
  className,
  size = "md",
  language = "en-US",
}: VoiceButtonProps) {
  const { listening, isSupported, toggle } = useVoiceInput({
    onResult,
    language,
  });

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "Stop listening" : "Speak to fill this field"}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all",
        size === "sm"
          ? "h-7 w-7"
          : "h-9 w-9",
        listening
          ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse"
          : "bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400",
        className
      )}
    >
      {listening ? (
        <MicOff className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      ) : (
        <Mic className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
    </button>
  );
}
