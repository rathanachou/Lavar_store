import { useEffect, useRef } from "react";

export const useUsbScanner = (
  onScan: (code: string) => void,
  enabled: boolean = true
) => {
  const bufferRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const isEditable = (e.target as HTMLElement).isContentEditable;
      if (isEditable) return;

      if (e.key === "Enter" || e.key === "Tab") {
        const code = bufferRef.current.trim();
        bufferRef.current = ""; 
        clearTimeout(timerRef.current);

        if (code.length >= 3) {
          onScanRef.current(code);
        }
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault(); 
        bufferRef.current += e.key;
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = "";
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timerRef.current);
      bufferRef.current = "";
    };
  }, [enabled]);
};