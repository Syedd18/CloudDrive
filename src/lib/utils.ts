import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export const EDITABLE_TEXT_EXTENSIONS = [
  "txt",
  "md",
  "json",
  "log",
];

export const CODE_EDITABLE_EXTENSIONS = [
  "py",
];

export function isCodeFile(filename: string, mimeType?: string): boolean {
  const extension = getFileExtension(filename).toLowerCase();

  if (CODE_EDITABLE_EXTENSIONS.includes(extension)) {
    return true;
  }

  return !!mimeType && (
    mimeType.includes("python") ||
    mimeType.includes("x-python")
  );
}

export function isEditableTextFile(filename: string, mimeType?: string): boolean {
  const extension = getFileExtension(filename).toLowerCase();

  if (EDITABLE_TEXT_EXTENSIONS.includes(extension)) {
    return true;
  }

  return !!mimeType && (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "application/json"
  );
}

export function isEditableFile(filename: string, mimeType?: string): boolean {
  return isEditableTextFile(filename, mimeType) || isCodeFile(filename, mimeType);
}

export const SUPPORTED_EDITOR_EXTENSIONS = Array.from(
  new Set([...EDITABLE_TEXT_EXTENSIONS, ...CODE_EDITABLE_EXTENSIONS])
).sort();

export function getSupportedEditorExtensionsLabel(): string {
  return SUPPORTED_EDITOR_EXTENSIONS.map((ext) => `.${ext}`).join(", ");
}
