"use client";
import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

export default function ImageUpload({ onUpload }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
  };

  const handleRemoveSelected = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setError("");
    setLoading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        if (data.url) uploadedUrls.push(data.url);
      }

      if (!uploadedUrls.length) {
        throw new Error("Upload did not return any image URL");
      }

      onUpload(uploadedUrls);
      toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} uploaded successfully`);
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const message = err.message || "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="bg-zinc-100 text-zinc-800 border border-zinc-300 px-4 py-2 rounded font-medium hover:bg-zinc-200"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Files
        </button>
        <span className="text-sm text-zinc-600 break-all">
          {files.length > 0
            ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
            : "No files selected"}
        </span>
      </div>

      <div className="flex gap-2 mt-2 flex-wrap">
        {previews.slice(0, 5).map((src, idx) => (
          <div key={idx} className="relative">
            <img src={src} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-contain rounded border bg-white" />
            <button
              type="button"
              onClick={() => handleRemoveSelected(idx)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs leading-none flex items-center justify-center shadow"
              aria-label={`Remove image ${idx + 1}`}
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="bg-primary text-white px-4 py-2 rounded mt-2" onClick={handleUpload} disabled={loading || !files.length}>
        {loading ? "Uploading..." : "Upload Images"}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
