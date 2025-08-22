"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (fileUrl: string, fileName: string) => void;
  certificationId: string;
  currentFile?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileUpload,
  certificationId,
  currentFile,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PDF, JPG, and PNG files are allowed.");
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("certificationId", certificationId);

      const response = await fetch("/api/upload/certifications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onFileUpload(data.fileUrl, data.fileName);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const removeFile = () => {
    onFileUpload("", "");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return <FileText className="h-4 w-4" />;
    }
    return <ImageIcon className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="file-upload">Certification Document</Label>
      
      {currentFile ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            {getFileIcon(currentFile)}
            <span className="text-sm truncate max-w-[200px]">
              {currentFile.split("/").pop()}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            {uploading ? "Uploading..." : "Drop your file here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, PNG (max 5MB)
          </p>
        </div>
      )}

      <Input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Uploading file...
        </div>
      )}
    </div>
  );
}