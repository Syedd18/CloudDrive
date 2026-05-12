export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "spreadsheet" | "presentation" | "pdf" | "image" | "video" | "audio" | "archive" | "file";
  size: number;
  mimeType?: string; // Mime type of the file
  modified: string;
  thumbnail?: string;
  starred: boolean;
  recent: boolean;
  trashed: boolean;
  shared?: boolean;
  sharedWith?: string[];
  folderId?: string | null;  // Parent folder ID
  summary?: string | null;    // AI Summary
  tags?: string[];            // AI Tags
}

export type ViewMode = "grid" | "list";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: "upload" | "share" | "delete" | "system";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface StorageInfo {
  used: number;
  total: number;
}
