"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { FileItem } from "@/types";
import toast from "react-hot-toast";

export function ZipDownloadButton({
  selectedFiles,
  onClearSelection
}: {
  selectedFiles: FileItem[];
  onClearSelection: () => void;
}) {
  const [isZipping, setIsZipping] = useState(false);

  const handleZipDownload = async () => {
    if (!selectedFiles.length) return;

    setIsZipping(true);
    const toastId = toast.loading("Generating ZIP file...");

    try {
      const zip = new JSZip();
      
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      for (const file of selectedFiles) {
        if (file.type === "folder") continue; // Skip folders for basic implementation

        const res = await fetch(`/api/files/${file.id}/download?direct=true`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const blob = await res.blob();
          zip.file(file.name, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const link = document.createElement("a");
      link.href = url;
      link.download = "CloudDrive_Download.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Download started", { id: toastId });
      onClearSelection();
    } catch (error) {
      toast.error("Failed to generate ZIP", { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };

  if (selectedFiles.length === 0) return null;

  return (
    <button
      onClick={handleZipDownload}
      disabled={isZipping}
      className="btn-primary fixed bottom-6 right-6 shadow-2xl z-50 py-3 px-6 rounded-full text-base font-bold tracking-wide"
    >
      {isZipping ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <Download className="w-5 h-5 mr-2" />
      )}
      Download {selectedFiles.length} item(s) as ZIP
    </button>
  );
}