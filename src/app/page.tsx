"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileNav } from "@/components/layout/MobileNav";
import { UploadModal } from "@/components/modals/UploadModal";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { FileItem, ViewMode } from "@/types";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState("My Drive");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load files
  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    const token = localStorage.getItem("token");
    
    // User must have either JWT token OR NextAuth session
    if (!token && status === "unauthenticated") {
      router.push("/login");
      return;
    }

    loadFiles();
  }, [router, status, currentFolder]);

  const loadFiles = async () => {
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
      }

      const url = `/api/files${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, {
        headers,
        credentials: "include", // Include cookies for NextAuth session
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
  };

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (currentFolder === "My Drive" ||
        currentFolder === "Starred" ||
        currentFolder === "Trash" ||
        (currentFolder === "Recent" && file.recent))
  );

  const handleUpload = async (newFiles: File[]) => {
    const token = localStorage.getItem("token");

    for (const file of newFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("type", getFileType(file.type));

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/files", {
          method: "POST",
          headers,
          credentials: "include", // Include cookies for NextAuth session
          body: formData,
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to upload ${file.name}`);
      }
    }

    // Reload files after upload
    loadFiles();
  };

  const handleCreateFolder = async (name: string) => {
    const token = localStorage.getItem("token");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add JWT token if available (for email/password auth)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/folders", {
        method: "POST",
        headers,
        credentials: "include", // Include cookies for NextAuth session
        body: JSON.stringify({ name }),
      });

      if (response.status === 401) {
        // Only clear token and redirect if using JWT auth
        if (token) {
          localStorage.removeItem("token");
        }
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast.success(`Folder "${name}" created successfully!`);
      await loadFiles();
    } catch (error) {
      toast.error("Failed to create folder");
      console.error(error);
      throw error;
    }
  };

  const handleDelete = async (fileId: string) => {
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
        credentials: "include", // Include cookies for NextAuth session
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

      toast.success("File moved to trash");
      loadFiles();
    } catch (error) {
      toast.error("Failed to move file to trash");
    }
  };

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

  const handleEmptyTrash = async () => {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to permanently delete all items in trash? This cannot be undone.")) {
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
        credentials: "include", // Include cookies for NextAuth session
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
        credentials: "include", // Include cookies for NextAuth session
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

      toast.success("File renamed");
      loadFiles();
    } catch (error) {
      toast.error("Failed to rename file");
    }
  };

  const getFileType = (mimeType: string): FileItem["type"] => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType === "application/pdf") return "pdf";
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
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setUploadModalOpen(true)}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          isOpen={sidebarOpen}
          currentFolder={currentFolder}
          onFolderChange={setCurrentFolder}
          onClose={() => setSidebarOpen(false)}
          onUploadClick={() => setUploadModalOpen(true)}
          onFolderClick={() => setCreateFolderModalOpen(true)}
        />

        <MainContent
          files={filteredFiles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFileClick={setPreviewFile}
          onFileDelete={handleDelete}
          onFileRestore={handleRestore}
          onFilePermanentDelete={handlePermanentDelete}
          onFileStar={handleStar}
          onFileRename={handleRename}
          onUpload={handleUpload}
          onUploadClick={() => setUploadModalOpen(true)}
          onEmptyTrash={handleEmptyTrash}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          currentFolder={currentFolder}
          isLoading={isLoading}
        />
      </div>

      <MobileNav
        currentFolder={currentFolder}
        onFolderChange={setCurrentFolder}
        onUploadClick={() => setUploadModalOpen(true)}
        onFolderClick={() => setCreateFolderModalOpen(true)}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
