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
      // Use a small delay to ensure the video element is rendered
      const connectStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error("Error playing video:", err);
            });
          };
        } else {
          // Retry after a short delay if video element is not ready
          setTimeout(connectStream, 50);
        }
      };
      
      // Initial delay to allow DOM to render
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
        // Flip horizontally for selfie mode
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

  // Load image and get its dimensions
  const loadImageWithDimensions = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setSelectedImage(dataUrl);
      setMode("crop");
      // Reset position and zoom
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

  // Crop/Pan handlers
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

        // Calculate the base scale to fit image in container
        // The image is scaled to fit within CONTAINER_SIZE while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let baseDisplayWidth: number;
        let baseDisplayHeight: number;
        
        if (aspectRatio > 1) {
          // Landscape image
          baseDisplayWidth = CONTAINER_SIZE;
          baseDisplayHeight = CONTAINER_SIZE / aspectRatio;
        } else {
          // Portrait or square image
          baseDisplayHeight = CONTAINER_SIZE;
          baseDisplayWidth = CONTAINER_SIZE * aspectRatio;
        }
        
        // Apply zoom
        const displayWidth = baseDisplayWidth * zoom;
        const displayHeight = baseDisplayHeight * zoom;
        
        // Scale ratio from display to original image
        const scaleX = img.width / displayWidth;
        const scaleY = img.height / displayHeight;
        
        // The crop circle is CROP_SIZE (200px) in display coordinates, centered
        // Convert to original image coordinates
        const cropWidthInImage = CROP_SIZE * scaleX;
        const cropHeightInImage = CROP_SIZE * scaleY;
        
        // Position offset in original image coordinates
        const offsetX = position.x * scaleX;
        const offsetY = position.y * scaleY;
        
        // Calculate source rectangle (centered on image, with offset from panning)
        const srcX = (img.width / 2) - (cropWidthInImage / 2) - offsetX;
        const srcY = (img.height / 2) - (cropHeightInImage / 2) - offsetY;

        // Create circular clip for output
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();

        // Fill with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Draw the cropped portion of the image
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {mode === "select" ? "Update Profile Photo" : "Adjust Photo"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {mode === "select" && !showCamera && (
                  <div className="space-y-4">
                    {/* Current Avatar Preview */}
                    {currentAvatar && (
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <img
                            src={currentAvatar}
                            alt="Current avatar"
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-surface-200 dark:ring-surface-700"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">Current</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Drop Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-xs text-surface-500 mt-1">
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
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
                      <span className="text-xs text-surface-500 font-medium">OR</span>
                      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
                    </div>

                    {/* Camera Button */}
                    <button
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
                    >
                      <Camera className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Take a Photo
                      </span>
                    </button>

                    {/* Gallery Button (for mobile) */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Choose from Gallery
                      </span>
                    </button>
                  </div>
                )}

                {/* Camera View */}
                {showCamera && (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                      {/* Camera overlay with circle guide */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-52 h-52 rounded-full border-4 border-white/50 shadow-lg" />
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-3">
                      <button
                        onClick={stopCamera}
                        className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl text-surface-700 dark:text-surface-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                      >
                        <Camera className="w-4 h-4" />
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
                      className="relative mx-auto rounded-2xl overflow-hidden bg-surface-900 cursor-move"
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
                        <span className="text-xs text-white/70">Drag to reposition</span>
                      </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                      </button>
                      <div className="w-32 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${((zoom - 0.5) / 2.5) * 100}%` }}
                        />
                      </div>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setMode("select");
                          setSelectedImage(null);
                          setZoom(1);
                          setPosition({ x: 0, y: 0 });
                        }}
                        className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl text-surface-700 dark:text-surface-300 font-medium transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save Photo
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
