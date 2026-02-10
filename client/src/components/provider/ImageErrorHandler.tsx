// src/components/provider/ImageErrorHandler.tsx
"use client";

import { useEffect } from "react";

export function ImageErrorHandler() {
  useEffect(() => {
    const handler = (e: Event) => {
      const img = e.target as HTMLImageElement;

      if (img && img.tagName === "IMG") {
        // tránh loop vô hạn
        if (img.dataset.fallbackApplied) return;

        img.dataset.fallbackApplied = "true";
        img.src = "/images/404.png";
        img.style.objectFit = "contain";
      }
    };

    // capture = true để bắt error bubbling từ img
    document.addEventListener("error", handler, true);

    return () => {
      document.removeEventListener("error", handler, true);
    };
  }, []);

  return null;
}
