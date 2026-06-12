"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  Upload,
  ImageIcon,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
  Move,
} from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdate: (avatarUrl: string) => void;
  currentAvatar?: string;
}

type UploadMode = "select" | "crop";

export function AvatarUploadModal({
  isOpen,
  onClose,
  onAvatarUpdate,
  currentAvatar,
}: AvatarUploadModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<UploadMode>("select");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  
  // Constants for the crop area
  const CONTAINER_SIZE = 320; // Fixed container size in pixels
  const CROP_SIZE = 200; // Visible crop circle diameter

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setMode("select");
      setSelectedImage(null);
      setImageSize({ width: 0, height: 0 });
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setShowCamera(false);
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  // Connect camera stream to video element when both are available
  useEffect(() => {
    if (cameraStream && showCamera) {
      const connectStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error("Error playing video:", err);
            });
          };
        } else {
          setTimeout(connectStream, 50);
        }
      };
      setTimeout(connectStream, 100);
    }
  }, [cameraStream, showCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setImageSize({ width: canvas.width, height: canvas.height });
      setSelectedImage(imageData);
      setMode("crop");
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      stopCamera();
    }
  };

  const loadImageWithDimensions = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setSelectedImage(dataUrl);
      setMode("crop");
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    };
    img.src = dataUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        loadImageWithDimensions(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
          setSelectedImage(dataUrl);
          setMode("crop");
          setPosition({ x: 0, y: 0 });
          setZoom(1);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const getCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!selectedImage || imageSize.width === 0) {
        reject(new Error("No image selected"));
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const outputSize = 256; // Final output size
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        const aspectRatio = img.width / img.height;
        let baseDisplayWidth: number;
        let baseDisplayHeight: number;
        
        if (aspectRatio > 1) {
          baseDisplayWidth = CONTAINER_SIZE;
          baseDisplayHeight = CONTAINER_SIZE / aspectRatio;
        } else {
          baseDisplayHeight = CONTAINER_SIZE;
          baseDisplayWidth = CONTAINER_SIZE * aspectRatio;
        }
        
        const displayWidth = baseDisplayWidth * zoom;
        const displayHeight = baseDisplayHeight * zoom;
        
        const scaleX = img.width / displayWidth;
        const scaleY = img.height / displayHeight;
        
        const cropWidthInImage = CROP_SIZE * scaleX;
        const cropHeightInImage = CROP_SIZE * scaleY;
        
        const offsetX = position.x * scaleX;
        const offsetY = position.y * scaleY;
        
        const srcX = (img.width / 2) - (cropWidthInImage / 2) - offsetX;
        const srcY = (img.height / 2) - (cropHeightInImage / 2) - offsetY;

        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputSize, outputSize);

        ctx.drawImage(
          img,
          srcX,
          srcY,
          cropWidthInImage,
          cropHeightInImage,
          0,
          0,
          outputSize,
          outputSize
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create blob"));
            }
          },
          "image/jpeg",
          0.92
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = selectedImage;
    });
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);

      const croppedBlob = await getCroppedImage();
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      onAvatarUpdate(data.user.avatar);
      toast.success("Profile photo updated!");
      onClose();
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {mode === "select" ? "Update Profile Photo" : "Adjust Photo"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {mode === "select" && !showCamera && (
                  <div className="space-y-4">
                    {/* Current Avatar Preview */}
                    {currentAvatar && (
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <img
                            src={currentAvatar}
                            alt="Current avatar"
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-850"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-bold">Current</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Drop Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-550 hover:border-indigo-500 transition-all"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-indigo-650" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-white">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-[10px] font-medium text-slate-450 dark:text-slate-500 mt-1">
                            JPG, PNG or GIF (max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-4 py-1">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">OR</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                    </div>

                    {/* Camera Button */}
                    <button
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-1.5 px-4 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Take a Photo</span>
                    </button>

                    {/* Gallery Button (for mobile) */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 px-4 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Choose from Gallery</span>
                    </button>
                  </div>
                )}

                {/* Camera View */}
                {showCamera && (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                      {/* Camera overlay with circle guide */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-52 h-52 rounded-full border-4 border-white/40 shadow-lg" />
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button
                        onClick={stopCamera}
                        className="flex-1 flex items-center justify-center h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Capture
                      </button>
                    </div>
                  </div>
                )}

                {/* Crop View */}
                {mode === "crop" && selectedImage && (
                  <div className="space-y-4">
                    {/* Crop Area - fixed size container */}
                    <div
                      ref={cropAreaRef}
                      className="relative mx-auto rounded-lg overflow-hidden bg-slate-950 cursor-move"
                      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        setIsDragging(true);
                        dragStartRef.current = {
                          x: touch.clientX,
                          y: touch.clientY,
                          posX: position.x,
                          posY: position.y,
                        };
                      }}
                      onTouchMove={(e) => {
                        if (!isDragging) return;
                        const touch = e.touches[0];
                        const dx = touch.clientX - dragStartRef.current.x;
                        const dy = touch.clientY - dragStartRef.current.y;
                        setPosition({
                          x: dragStartRef.current.posX + dx,
                          y: dragStartRef.current.posY + dy,
                        });
                      }}
                      onTouchEnd={() => setIsDragging(false)}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          transition: isDragging ? "none" : "transform 0.1s ease-out",
                        }}
                      >
                        <img
                          ref={imageRef}
                          src={selectedImage}
                          alt="Preview"
                          className="max-w-none max-h-none select-none"
                          draggable={false}
                          style={{
                            width: imageSize.width > imageSize.height ? CONTAINER_SIZE : "auto",
                            height: imageSize.height >= imageSize.width ? CONTAINER_SIZE : "auto",
                          }}
                        />
                      </div>
                      {/* Circular mask overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <defs>
                            <mask id="circleMask">
                              <rect width="100%" height="100%" fill="white" />
                              <circle cx="50%" cy="50%" r={CROP_SIZE / 2} fill="black" />
                            </mask>
                          </defs>
                          <rect
                            width="100%"
                            height="100%"
                            fill="rgba(0,0,0,0.6)"
                            mask="url(#circleMask)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="rounded-full border-2 border-white/80"
                            style={{ width: CROP_SIZE, height: CROP_SIZE }}
                          />
                        </div>
                      </div>
                      {/* Drag hint */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 rounded-full">
                        <Move className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-[10px] font-bold text-white/70">Drag to reposition</span>
                      </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handleZoomOut}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-650 transition-all"
                          style={{ width: `${((zoom - 0.5) / 2.5) * 100}%` }}
                        />
                      </div>
                      <button
                        onClick={handleZoomIn}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setMode("select");
                          setSelectedImage(null);
                          setZoom(1);
                          setPosition({ x: 0, y: 0 });
                        }}
                        className="flex-1 flex items-center justify-center h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
