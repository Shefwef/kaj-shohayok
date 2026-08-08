"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceInputOptions {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  language?: string;
}

// Minimal Web Speech API types (not universally in TS DOM lib)
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionErrorEvent {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  );
}

export function useVoiceInput({
  onResult,
  onError,
  language = "en-US",
}: UseVoiceInputOptions) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      onError?.("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (e) => {
      setListening(false);
      recognitionRef.current = null;
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        onError?.("Microphone access denied. Allow microphone permissions in your browser.");
      } else if (e.error === "no-speech") {
        onError?.("No speech detected. Please try again.");
      } else {
        onError?.("Voice recognition failed. Please try again.");
      }
    };
    recognition.onresult = (e) => {
      const transcript = (e.results[0][0] as { transcript: string }).transcript.trim();
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      onError?.("Could not start voice recognition. Please try again.");
      setListening(false);
    }
  }, [language, onResult, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  return { listening, isSupported, toggle, startListening, stopListening };
}
