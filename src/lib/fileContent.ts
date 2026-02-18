import type { FileType } from "@/types";

const PDF_DATA_URL_PREFIX = "data:application/pdf";
const IMAGE_DATA_URL_PREFIX = "data:image/";

export function isPdfDataUrl(value: string): boolean {
  return value.startsWith(PDF_DATA_URL_PREFIX);
}

export function isImageDataUrl(value: string): boolean {
  return value.startsWith(IMAGE_DATA_URL_PREFIX);
}

export function isBinaryPreview(value: string): boolean {
  return isPdfDataUrl(value) || isImageDataUrl(value);
}

export function getReadableContentPreview(content: string | undefined, fileType?: FileType): string {
  if (!content) {
    if (fileType === "pdf") {
      return "PDF asset attached. Open to inspect full pages and zoom details.";
    }
    if (fileType === "jpg" || fileType === "png") {
      return "Image asset attached. Open to inspect at native resolution.";
    }
    return "";
  }

  if (isPdfDataUrl(content) || fileType === "pdf") {
    return "PDF asset attached. Open to inspect full pages and zoom details.";
  }

  if (isImageDataUrl(content) || fileType === "jpg" || fileType === "png") {
    return "Image asset attached. Open to inspect at native resolution.";
  }

  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > 220 ? `${normalized.slice(0, 220)}...` : normalized;
}

export function inferFileTypeFromName(fileName: string): FileType | undefined {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "pdf";
    case "jpg":
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "json":
      return "json";
    case "csv":
      return "csv";
    case "txt":
      return "txt";
    default:
      return undefined;
  }
}

export function buildPdfBlobUrl(content: string | ArrayBuffer | null | undefined): string | null {
  if (!content) return null;

  if (typeof content === "string") {
    if (isPdfDataUrl(content) || content.startsWith("blob:")) {
      return content;
    }
    return null;
  }

  const blob = new Blob([content], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export function buildPdfViewerUrl(source: string, pageNumber: number, zoom: number): string {
  const separator = source.includes("#") ? "&" : "#";
  const safePage = Math.max(1, pageNumber);
  const safeZoom = Math.max(25, Math.min(500, Math.round(zoom)));
  return `${source}${separator}page=${safePage}&zoom=${safeZoom}&toolbar=0&navpanes=0&view=FitH`;
}
