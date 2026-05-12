"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileNav } from "@/components/layout/MobileNav";
import { UploadModal } from "@/components/modals/UploadModal";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { EditorModal } from "@/components/modals/EditorModal";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { CreateFileModal } from "@/components/modals/CreateFileModal";
import { ZipDownloadButton } from "@/components/files/ZipDownloadButton";
import { DuplicateFileModal } from "@/components/modals/DuplicateFileModal";
import { FileDetailsPanel } from "@/components/files/FileDetailsPanel";
import { UploadStatusPanel, UploadItem } from "@/components/ui/UploadStatusPanel";
import { FileItem, ViewMode } from "@/types";
import { getSupportedEditorExtensionsLabel, isEditableFile } from "@/lib/utils";
import toast from "react-hot-toast";

// Type for duplicate file handling
interface DuplicateFile {
  file: File;
  existingFileId: string;
  existingFileName: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState("My Files");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // Current folder ID for navigation
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [createFileModalOpen, setCreateFileModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [editFile, setEditFile] = useState<FileItem | null>(null);
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([]);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);

  // File State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // Breadcrumb path (for folder navigation)
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ id: string; name: string }[]>([
    { id: "root", name: "My Files" },
  ]);

  // Load default view mode from settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("driveSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.defaultView) {
          setViewMode(settings.defaultView);
        }
      } catch {
        // Use default grid view
      }
    }
  }, []);

  // Listen for view mode changes from settings modal
  useEffect(() => {
    const handleViewModeChange = (e: CustomEvent) => {
      setViewMode(e.detail as ViewMode);
    };
    window.addEventListener("viewModeChange", handleViewModeChange as EventListener);
    return () => {
      window.removeEventListener("viewModeChange", handleViewModeChange as EventListener);
    };
  }, []);

  // Load files from API
  const loadFiles = useCallback(async (folderId?: string | null) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Build query params based on current folder
      const params = new URLSearchParams();
      if (currentFolder === "Trash") {
        params.append("trashed", "true");
      } else if (currentFolder === "Starred") {
        params.append("starred", "true");
      } else if (currentFolder === "My Files") {
        // When in My Files, pass the folderId to get files in that folder
        const folderToLoad = folderId !== undefined ? folderId : currentFolderId;
        if (folderToLoad) {
          params.append("folderId", folderToLoad);
        } else {
          // Root folder - get files with no parent
          params.append("folderId", "null");
        }
      }

      const url = `/api/files${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, {
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load files");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      toast.error("Failed to load files");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [router, currentFolder, currentFolderId]);

  // Auth check and initial load
  useEffect(() => {
    if (status === "loading") return;

    const token = localStorage.getItem("token");
    if (!token && status === "unauthenticated") {
      router.push("/login");
      return;
    }

    loadFiles();
  }, [status, loadFiles, router]);

  // Filter files based on search and current folder
  const filteredFiles = files.filter(
    (file) => {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
      const fileText = [
        file.name.toLowerCase(),
        file.summary?.toLowerCase() || "",
        ...(file.tags || []).map(t => t.toLowerCase())
      ].join(" ");
      
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => fileText.includes(term));

      return matchesSearch &&
        (currentFolder === "My Files" ||
          currentFolder === "Starred" ||
          currentFolder === "Trash" ||
          (currentFolder === "Recent" && file.recent) ||
          (currentFolder === "Shared" && file.shared));
    }
  );

  // Check for duplicate files before upload
  const checkForDuplicates = (newFiles: File[]): { duplicates: DuplicateFile[]; nonDuplicates: File[] } => {
    const duplicates: DuplicateFile[] = [];
    const nonDuplicates: File[] = [];

    for (const file of newFiles) {
      // Check if file with same name exists in current folder
      const existingFile = files.find(
        (f) => f.name.toLowerCase() === file.name.toLowerCase() && !f.trashed
      );
      
      if (existingFile) {
        duplicates.push({
          file,
          existingFileId: existingFile.id,
          existingFileName: existingFile.name,
        });
      } else {
        nonDuplicates.push(file);
      }
    }

    return { duplicates, nonDuplicates };
  };

  // Generate unique filename by adding (1), (2), etc.
  const generateUniqueFilename = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.slice(lastDotIndex) : '';
    
    let counter = 1;
    let newName = `${baseName} (${counter})${extension}`;
    
    // Keep incrementing until we find a unique name
    while (files.some(f => f.name.toLowerCase() === newName.toLowerCase() && !f.trashed)) {
      counter++;
      newName = `${baseName} (${counter})${extension}`;
    }
    
    return newName;
  };

  // Handle initial upload request - check for duplicates first
  const handleUploadRequest = (newFiles: File[]) => {
    const { duplicates, nonDuplicates } = checkForDuplicates(newFiles);
    
    // Upload non-duplicate files immediately
    if (nonDuplicates.length > 0) {
      handleUpload(nonDuplicates);
    }
    
    // Show duplicate modal if there are duplicates
    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
      setPendingUploads(duplicates.map(d => d.file));
      setDuplicateModalOpen(true);
    }
  };

  // Handle replace duplicate files
  const handleReplaceDuplicates = async (duplicates: DuplicateFile[]) => {
    setDuplicateModalOpen(false);
    const token = localStorage.getItem("token");
    
    // Delete existing files first
    for (const dup of duplicates) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        
        // Permanently delete the existing file
        await fetch(`/api/files/${dup.existingFileId}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to delete existing file:", error);
      }
    }
    
    // Upload the new files
    handleUpload(duplicates.map(d => d.file));
    setDuplicateFiles([]);
    setPendingUploads([]);
  };

  // Handle rename and upload duplicate files
  const handleRenameDuplicates = (duplicates: DuplicateFile[]) => {
    setDuplicateModalOpen(false);
    
    // Create renamed files
    const renamedFiles: File[] = duplicates.map(dup => {
      const newName = generateUniqueFilename(dup.file.name);
      // Create a new File object with the new name
      return new File([dup.file], newName, { type: dup.file.type });
    });
    
    handleUpload(renamedFiles);
    setDuplicateFiles([]);
    setPendingUploads([]);
  };

  // Handle skip duplicates
  const handleSkipDuplicates = () => {
    setDuplicateModalOpen(false);
    setDuplicateFiles([]);
    setPendingUploads([]);
    toast("Skipped duplicate files", { icon: "⏭️" });
  };

  // Handle file upload - uses direct Supabase upload for large files (bypasses Vercel 4.5MB limit)
  const handleUpload = async (newFiles: File[]) => {
    const token = localStorage.getItem("token");

    // Create upload items for tracking
    const uploadItems: UploadItem[] = newFiles.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploads((prev) => [...prev, ...uploadItems]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const uploadItem = uploadItems[i];
      let progressInterval: NodeJS.Timeout | null = null;

      try {
        // Check file size before upload
        const maxSizeMB = 50;
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Use direct upload to Supabase (bypasses Vercel's 4.5MB limit)
        // Step 1: Get presigned upload URL
        const presignResponse = await fetch("/api/files/presign", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            folderId: currentFolderId || null,
          }),
        });

        if (!presignResponse.ok) {
          const errorData = await presignResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to prepare upload");
        }

        const { uploadUrl, token: uploadToken, filePath, folderId } = await presignResponse.json();

        // Step 2: Upload directly to Supabase
        progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadItem.id && u.progress < 90
                ? { ...u, progress: u.progress + 5 }
                : u
            )
          );
        }, 300);

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload to storage");
        }

        // Step 3: Confirm upload and create database record
        const confirmResponse = await fetch("/api/files/confirm", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            filePath,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            folderId,
          }),
        });

        if (progressInterval) clearInterval(progressInterval);

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to confirm upload");
        }

        // Update upload status to completed
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id
              ? { ...u, progress: 100, status: "complete" as const }
              : u
          )
        );

        toast.success(`${file.name} uploaded`);
      } catch (error) {
        if (progressInterval) clearInterval(progressInterval);
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id ? { ...u, status: "error" as const } : u
          )
        );
        
        // Show more detailed error message
        const errorMsg = error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMsg);
        console.error('Upload error:', error);
      }
    }

    loadFiles();
  };

  // Handle folder creation
  const handleCreateFolder = async (name: string) => {
    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Include parent folderId to create folder inside current folder
      const requestBody: { name: string; folderId?: string } = { name };
      if (currentFolderId) {
        requestBody.folderId = currentFolderId;
      }

      const response = await fetch("/api/folders", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        if (token) localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast.success(`Folder "${name}" created!`);
      await loadFiles();
    } catch (error) {
      toast.error("Failed to create folder");
      console.error(error);
      throw error;
    }
  };

  // Handle file deletion (move to trash)
  const handleDelete = async (fileId: string) => {
    // Check if confirmation is required from settings
    const savedSettings = localStorage.getItem("driveSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.confirmBeforeDelete) {
          const confirmed = window.confirm("Are you sure you want to move this file to trash?");
          if (!confirmed) return;
        }
      } catch {
        // Proceed without confirmation
      }
    }

    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ trashed: true }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to move file to trash");
      }

      loadFiles();
    } catch (error) {
      toast.error("Failed to move file to trash");
    }
  };

  // Handle file restore
  const handleRestore = async (fileId: string) => {
    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ trashed: false }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to restore file");
      }

      toast.success("File restored");
      loadFiles();
    } catch (error) {
      toast.error("Failed to restore file");
    }
  };

  // Handle permanent deletion
  const handlePermanentDelete = async (fileId: string) => {
    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete file permanently");
      }

      toast.success("File deleted permanently");
      loadFiles();
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  // Handle batch delete (move multiple files to trash)
  const handleBatchDelete = async (fileIds: string[]) => {
    // Check if confirmation is required from settings
    const savedSettings = localStorage.getItem("driveSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.confirmBeforeDelete) {
          const confirmed = window.confirm(`Are you sure you want to move ${fileIds.length} file(s) to trash?`);
          if (!confirmed) return;
        }
      } catch {
        // Proceed without confirmation
      }
    }

    const token = localStorage.getItem("token");
    let successCount = 0;
    let failCount = 0;

    for (const fileId of fileIds) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({ trashed: true }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) moved to trash`);
      setSelectedFiles([]);
      loadFiles();
    }
    if (failCount > 0) {
      toast.error(`Failed to move ${failCount} file(s)`);
    }
  };

  // Handle batch star (toggle star on multiple files)
  const handleBatchStar = async (fileIds: string[]) => {
    const token = localStorage.getItem("token");
    let successCount = 0;
    let failCount = 0;

    for (const fileId of fileIds) {
      const file = files.find(f => f.id === fileId);
      if (!file) continue;

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({ starred: !file.starred }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) updated`);
      setSelectedFiles([]);
      loadFiles();
    }
    if (failCount > 0) {
      toast.error(`Failed to update ${failCount} file(s)`);
    }
  };

  // Handle batch download
  const handleBatchDownload = async (fileIds: string[]) => {
    const token = localStorage.getItem("token");
    const toastId = toast.loading(`Downloading ${fileIds.length} file(s)...`);
    let successCount = 0;

    for (const fileId of fileIds) {
      const file = files.find(f => f.id === fileId);
      if (!file || file.type === "folder") continue;

      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`/api/files/${fileId}/download?direct=true`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!response.ok) continue;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        successCount++;
        
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch {
        // Continue to next file
      }
    }

    if (successCount > 0) {
      toast.success(`Downloaded ${successCount} file(s)`, { id: toastId });
      setSelectedFiles([]);
    } else {
      toast.error("Failed to download files", { id: toastId });
    }
  };

  // Handle empty trash
  const handleEmptyTrash = async () => {
    const token = localStorage.getItem("token");

    if (
      !confirm(
        "Are you sure you want to permanently delete all items in trash? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/files/trash", {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to empty trash");
      }

      toast.success("Trash emptied");
      loadFiles();
    } catch (error) {
      toast.error("Failed to empty trash");
    }
  };

  // Handle star toggle
  const handleStar = async (fileId: string) => {
    const token = localStorage.getItem("token");
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ starred: !file.starred }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update file");
      }

      loadFiles();
    } catch (error) {
      toast.error("Failed to star file");
    }
  };

  // Handle file rename
  const handleRename = async (fileId: string, newName: string) => {
    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      loadFiles();
    } catch (error) {
      toast.error("Failed to rename file");
    }
  };

  // Handle sidebar folder change (My Files, Starred, Trash, etc.)
  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
    setCurrentFolderId(null); // Reset to root
    setSelectedFiles([]);
    setBreadcrumbPath([{ id: "root", name: folder }]);
    loadFiles(null);
  };

  const handleSidebarEditorOpen = () => {
    if (selectedFiles.length === 0) {
      toast.error("Select a file first to open in editor");
      return;
    }

    const selectedFile = files.find((file) => file.id === selectedFiles[0]);
    if (!selectedFile) {
      toast.error("Selected file is not available in current view");
      return;
    }

    if (selectedFile.type === "folder") {
      toast.error("Folders cannot be opened in editor");
      return;
    }

    if (!isEditableFile(selectedFile.name, selectedFile.mimeType)) {
      toast.error(
        `Unsupported file type for editor. Supported: ${getSupportedEditorExtensionsLabel()}`,
        { duration: 7000 }
      );
      return;
    }

    setEditFile(selectedFile);
    setSidebarOpen(false);
  };

  const handleCreateFile = async (input: {
    name: string;
    extension: "py" | "txt" | "md" | "json";
    content: string;
  }) => {
    const token = localStorage.getItem("token");
    const fileName = `${input.name}.${input.extension}`;

    const duplicateInCurrentFolder = files.some(
      (file) => !file.trashed && file.type !== "folder" && file.name.toLowerCase() === fileName.toLowerCase()
    );

    if (duplicateInCurrentFolder) {
      toast.error(`A file named ${fileName} already exists in this folder`);
      return;
    }

    const mimeType =
      input.extension === "py"
        ? "text/x-python"
        : input.extension === "md"
          ? "text/markdown"
          : input.extension === "json"
            ? "application/json"
            : "text/plain";

    const blob = new Blob([input.content], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });

    const formData = new FormData();
    formData.append("file", file);

    if (currentFolder === "My Files" && currentFolderId) {
      formData.append("folderId", currentFolderId);
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/files", {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create file");
    }

    const data = await response.json();
    const createdFile = data.file;

    const editorFile: FileItem = {
      id: createdFile.id,
      name: createdFile.name,
      type: createdFile.type,
      size: Number(createdFile.size || 0),
      mimeType: createdFile.mimeType,
      modified: new Date(createdFile.updatedAt || Date.now()).toISOString(),
      starred: !!createdFile.starred,
      recent: true,
      trashed: !!createdFile.trashed,
      folderId: currentFolder === "My Files" ? currentFolderId : null,
      summary: null,
      tags: [],
    };

    toast.success(`Created ${fileName}`);
    await loadFiles(currentFolderId || undefined);
    setSelectedFiles([editorFile.id]);
    setEditFile(editorFile);
    setSidebarOpen(false);
  };

  // Handle clicking on a file or folder in the file list
  const handleFileOrFolderClick = (file: FileItem) => {
    if (file.type === "folder") {
      // Navigate into the folder
      setCurrentFolderId(file.id);
      setBreadcrumbPath((prev) => [...prev, { id: file.id, name: file.name }]);
      loadFiles(file.id);
    } else {
      // Open editor or preview depending on extension
      if (isEditableFile(file.name, file.mimeType)) {
        setEditFile(file);
      } else {
        setPreviewFile(file);
      }
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (folderId: string) => {
    // Navigate to folder in breadcrumb
    const index = breadcrumbPath.findIndex((p) => p.id === folderId);
    if (index >= 0) {
      const newPath = breadcrumbPath.slice(0, index + 1);
      setBreadcrumbPath(newPath);
      const newFolderId = folderId === "root" ? null : folderId;
      setCurrentFolderId(newFolderId);
      loadFiles(newFolderId);
    }
  };

  // Upload panel handlers
  const handlePauseUpload = (id: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "paused" as const } : u))
    );
  };

  const handleResumeUpload = (id: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "uploading" as const } : u))
    );
  };

  const handleCancelUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const handleClearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== "complete"));
  };

  // Get file type from MIME type
  const getFileType = (mimeType: string): FileItem["type"] => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z") || mimeType.includes("tar") || mimeType.includes("gzip") || mimeType.includes("x-compressed") || mimeType.includes("x-bzip"))
      return "archive";
    if (
      mimeType.includes("document") ||
      mimeType.includes("word") ||
      mimeType.includes("text")
    )
      return "document";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "spreadsheet";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "presentation";
    return "file";
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setUploadModalOpen(true)}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onClose={() => setSidebarOpen(false)}
          onUploadClick={() => setUploadModalOpen(true)}
          onFolderClick={() => setCreateFolderModalOpen(true)}
          onEditorClick={handleSidebarEditorOpen}
          onCreateFileClick={() => setCreateFileModalOpen(true)}
        />

        {/* Main Content */}
        <MainContent
          files={filteredFiles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFileClick={handleFileOrFolderClick}
          onFilePreview={(file) => {
            if (file.type === "folder") return;
            if (isEditableFile(file.name, file.mimeType)) setEditFile(file);
            else setPreviewFile(file);
          }}
          onFileEdit={(file) => setEditFile(file)}
          onFileDelete={handleDelete}
          onFileRestore={handleRestore}
          onFilePermanentDelete={handlePermanentDelete}
          onFileStar={handleStar}
          onFileRename={handleRename}
          onUpload={handleUploadRequest}
          onUploadClick={() => setUploadModalOpen(true)}
          onEmptyTrash={handleEmptyTrash}
          onFileDetails={setDetailsFile}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          onBatchDelete={handleBatchDelete}
          onBatchStar={handleBatchStar}
          onBatchDownload={handleBatchDownload}
          currentFolder={currentFolder}
          isLoading={isLoading}
          breadcrumbPath={breadcrumbPath}
          onBreadcrumbNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentFolder={currentFolder}
        onFolderChange={handleFolderChange}
        onUploadClick={() => setUploadModalOpen(true)}
        onNewFolderClick={() => setCreateFolderModalOpen(true)}
      />

      {/* Upload Status Panel */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <UploadStatusPanel
            uploads={uploads}
            onPause={handlePauseUpload}
            onResume={handleResumeUpload}
            onCancel={handleCancelUpload}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadRequest}
      />

      <ZipDownloadButton 
        selectedFiles={files.filter(f => selectedFiles.includes(f.id))}
        onClearSelection={() => setSelectedFiles([])}
      />

      <DuplicateFileModal
        isOpen={duplicateModalOpen}
        duplicates={duplicateFiles}
        onClose={() => setDuplicateModalOpen(false)}
        onReplace={handleReplaceDuplicates}
        onRename={handleRenameDuplicates}
        onSkip={handleSkipDuplicates}
      />

      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateFileModal
        isOpen={createFileModalOpen}
        onClose={() => setCreateFileModalOpen(false)}
        existingFileNames={files.filter((file) => !file.trashed && file.type !== "folder").map((file) => file.name)}
        onCreateFile={handleCreateFile}
      />

      {editFile && (
        <EditorModal
          file={editFile}
          onClose={() => setEditFile(null)}
          onUpdated={() => {
            loadFiles(currentFolderId || undefined);
            setEditFile(null);
          }}
        />
      )}

      <AnimatePresence>
        {previewFile && (
          <PreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
            onEdit={(file) => {
              setPreviewFile(null);
              setEditFile(file);
            }}
          />
        )}
      </AnimatePresence>

      {/* File Details Panel */}
      <FileDetailsPanel
        file={detailsFile}
        isOpen={detailsFile !== null}
        onClose={() => setDetailsFile(null)}
        onStar={handleStar}
        onEdit={(file) => setEditFile(file)}
        onDelete={(fileId) => {
          handleDelete(fileId);
          setDetailsFile(null);
        }}
      />
    </div>
  );
}
