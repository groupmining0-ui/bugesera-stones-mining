"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/input";

interface ImageUploadInputProps {
  id: string;
  name: string;
  label?: string;
  defaultValue?: string | null;
  placeholder?: string;
  helperText?: string;
}

export function ImageUploadInput({
  id,
  name,
  label = "Photo / Image",
  defaultValue = "",
  placeholder = "https://... or upload from your computer",
  helperText,
}: ImageUploadInputProps) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      {/* Main input & upload container */}
      <div className="space-y-3">
        {/* URL input field (kept in sync with uploaded file URL or typed URL) */}
        <div className="flex gap-2">
          <input
            id={id}
            name={name}
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setErrorMessage(null);
            }}
            placeholder={placeholder}
            className="h-11 w-full border border-granite/30 bg-white px-3 text-sm text-basalt placeholder:text-granite/60 focus-visible:border-basalt focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hivis"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-granite/30 bg-quartz px-4 text-sm font-semibold text-basalt hover:bg-slate transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </span>
            )}
          </button>
        </div>

        {/* Drag and drop zone / preview */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex items-center gap-4 rounded-xl border-2 border-dashed p-3 transition-colors ${
            isDragOver ? "border-hivis bg-hivis/10" : "border-granite/20 bg-quartz/50"
          }`}
        >
          {imageUrl ? (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Image preview using native img to handle both local and external domains without restriction */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-granite/20 bg-slate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-basalt">{imageUrl}</p>
                  <p className="text-xs text-green-700">✓ Image ready</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  setErrorMessage(null);
                }}
                className="shrink-0 rounded px-2.5 py-1 text-xs font-medium text-laterite hover:bg-laterite/10"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center py-2 text-center text-xs text-granite">
              <span>Drag & drop an image here or click <strong>Upload File</strong></span>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs font-semibold text-laterite" role="alert">
            ⚠ {errorMessage}
          </p>
        )}

        {helperText && <p className="text-xs text-granite">{helperText}</p>}
      </div>
    </div>
  );
}

