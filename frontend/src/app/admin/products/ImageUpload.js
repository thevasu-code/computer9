"use client";
import React, { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

export default function ImageUpload({ onUpload }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setError("");
    setLoading(true);
    const urls = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Failed to upload ${file.name}`);
        if (data.url) urls.push(data.url);
      }
      if (!urls.length) throw new Error("No image URL returned");
      onUpload(urls);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
      >
        <ImageIcon size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Click to select images</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each. Multiple files allowed.</p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-white">
                <img src={src} alt="" className="w-full h-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Upload size={14} />
            {loading ? "Uploading..." : `Upload ${files.length} image${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
