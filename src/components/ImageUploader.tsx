import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface ImageUploaderProps {
  id: string;
  label: string;
  description: string;
  selectedImage: string | null;
  onImageSelected: (base64: string | null) => void;
  required?: boolean;
}

export default function ImageUploader({
  id,
  label,
  description,
  selectedImage,
  onImageSelected,
  required = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }

    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>

      <div
        id={id}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group
          ${
            selectedImage
              ? "border-emerald-500/50 bg-emerald-50/10"
              : isDragging
                ? "border-indigo-500 bg-indigo-50/30 scale-[1.01]"
                : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white"
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {selectedImage ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-3">
            <img
              src={selectedImage}
              alt={label}
              className="w-full h-full object-cover rounded-lg shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                type="button"
                id={`${id}-replace`}
                className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow hover:bg-slate-100 transition flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Ganti Gambar
              </button>
              <button
                type="button"
                id={`${id}-remove`}
                className="p-1.5 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 transition"
                onClick={handleClear}
                title="Hapus"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Safe visual badge */}
            <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm backdrop-blur-sm bg-opacity-90">
              <Sparkles className="w-3 h-3" /> Siap digunakan
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-4">
            <div className={`p-3 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 ${isDragging ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
              {id.includes("model") ? <ImageIcon className="w-5 h-5 text-indigo-500" /> : <Upload className="w-5 h-5 text-indigo-500" />}
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1 group-hover:text-indigo-600 transition-colors">
              Seret gambar di sini atau <span className="text-indigo-600 underline">klik untuk unggah</span>
            </p>
            <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
