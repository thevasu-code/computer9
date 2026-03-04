"use client";
import React, { useState, useRef } from "react";

export default function ImageUpload({ onUpload }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) uploadedUrls.push(data.url);
    }
    setLoading(false);
    if (uploadedUrls.length) onUpload(uploadedUrls);
    setFiles([]);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mb-4">
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} />
      <div className="flex gap-2 mt-2 flex-wrap">
        {previews.slice(0, 5).map((src, idx) => (
          <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-contain rounded border" />
        ))}
      </div>
      <button type="button" className="bg-primary text-white px-4 py-2 rounded mt-2" onClick={handleUpload} disabled={loading || !files.length}>
        {loading ? "Uploading..." : "Upload Images"}
      </button>
    </div>
  );
}
