import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Clapperboard,
  Heart,
  MessageSquare,
  HelpCircle,
  Video,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  FileText,
  Bookmark,
} from "lucide-react";
import ImageUploader from "./components/ImageUploader";
import StoryboardSimulator from "./components/StoryboardSimulator";
import { CampaignSettings, GenerationResponse } from "./types";

export default function App() {
  // Main form states with localStorage retrieval
  const [settings, setSettings] = useState<CampaignSettings>(() => {
    try {
      const saved = localStorage.getItem("campaign_settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Gagal memuat pengaturan dari localStorage:", e);
    }
    return {
      productName: "",
      productCategory: "Skincare",
      targetAudience: "",
      tone: "soft-elegant",
      language: "id",
      customDetails: "",
      aspectRatio: "9:16",
      modelImage: null,
      productImage: null,
    };
  });

  // Auto-save form state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("campaign_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Gagal menyimpan pengaturan ke localStorage:", e);
    }
  }, [settings]);

  // UI state managers
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);

  // Milestone loader simulation for delightful UX
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      const steps = [
        "Menghubungkan ke Gemini-3.5-Flash...",
        "Menganalisis kemasan & visual produk...",
        "Mengunci ciri fisik model utama untuk konsistensi...",
        "Mendesain storyboard 3 scene...",
        "Memformulasikan visual prompt AI (Bahasa Inggris)...",
        "Menulis teks ucapan (Voiceover) sinkron...",
        "Menghitung kalkulasi durasi suara...",
        "Memvalidasi hasil naskah akhir...",
      ];

      let currentStepIdx = 0;
      setLoadingStep(steps[0]);

      timer = setInterval(() => {
        if (currentStepIdx < steps.length - 1) {
          currentStepIdx++;
          setLoadingStep(steps[currentStepIdx]);
        }
      }, 2500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // Load a fast sample preset so users can test immediately
  const handleLoadPreset = () => {
    // 1x1 tiny placeholder base64 png images (different colors for model vs product)
    const grayPixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU55ErkJggg==";
    const bluePixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADAgH/0YgXzQAAAABJRU55ErkJggg==";

    setSettings({
      productName: "Glow & Protect Serum",
      productCategory: "Skincare",
      targetAudience: "Wanita pekerja kantoran berusia 24-35 tahun yang sibuk",
      tone: "soft-elegant",
      language: "id",
      customDetails: "Serum mengandung Vitamin C dan SPF 50. Highlight kemasannya yang berwarna oranye segar dengan botol kaca premium. Tekstur serum sangat ringan dan cepat menyerap di kulit.",
      aspectRatio: "9:16",
      modelImage: grayPixel,
      productImage: bluePixel,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.productName.trim()) {
      setError("Nama produk wajib diisi!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan skrip.");
      }

      const data: GenerationResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi masalah koneksi atau error pada server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Professional Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white flex items-center justify-center shadow-md">
              <Clapperboard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Creative Studio <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">AI Ad Script</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Generator Skrip dan Prompt Iklan Video Konsisten & Presisi
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="preset-loader-btn"
              onClick={handleLoadPreset}
              className="text-xs font-semibold px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Isi Contoh Cepat
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Panel / Input Form (5 cols on large screens) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Konfigurasi Kampanye Iklan
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Lengkapi detail produk dan unggah foto referensi untuk memulai.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="campaign-form">
            {/* Product Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Nama Produk <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  id="product-name-input"
                  required
                  placeholder="Misal: Safi Youth Gold"
                  value={settings.productName}
                  onChange={(e) =>
                    setSettings({ ...settings, productName: e.target.value })
                  }
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-slate-50/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Kategori Produk</label>
                <select
                  id="product-category-select"
                  value={settings.productCategory}
                  onChange={(e) =>
                    setSettings({ ...settings, productCategory: e.target.value })
                  }
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-slate-50/50"
                >
                  <option value="Skincare">Skincare & Kecantikan</option>
                  <option value="Food & Beverage">Makanan & Minuman</option>
                  <option value="Fashion">Fashion & Aksesoris</option>
                  <option value="Gadgets">Gadget & Teknologi</option>
                  <option value="Health & Wellness">Kesehatan & Kebugaran</option>
                  <option value="Automotive">Otomotif</option>
                  <option value="Others">Kategori Lainnya</option>
                </select>
              </div>
            </div>

            {/* Target Audience & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Audiens</label>
                <input
                  type="text"
                  id="target-audience-input"
                  placeholder="Misal: Wanita muda 18-30 thn"
                  value={settings.targetAudience}
                  onChange={(e) =>
                    setSettings({ ...settings, targetAudience: e.target.value })
                  }
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-slate-50/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Gaya/Tone Iklan</label>
                <select
                  id="tone-select"
                  value={settings.tone}
                  onChange={(e) =>
                    setSettings({ ...settings, tone: e.target.value })
                  }
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-slate-50/50"
                >
                  <option value="soft-elegant">Sinematik & Soft Elegant</option>
                  <option value="energetic-bold">Energetic, Bold & Pop</option>
                  <option value="informative-scientific">Informatif & Edukatif</option>
                  <option value="problem-solving">Problem Solving (Solusi)</option>
                  <option value="funny-quirky">Kreatif & Humor Ceria</option>
                  <option value="podcast">Gaya Bicara Podcast (Viral/Interaktif)</option>
                </select>
              </div>
            </div>

            {/* Language & Aspect Ratio Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Bahasa Teks Ucapan</label>
                <div className="grid grid-cols-2 gap-2" id="language-toggle">
                  <button
                    type="button"
                    id="lang-id-btn"
                    onClick={() => setSettings({ ...settings, language: "id" })}
                    className={`py-2 text-xs font-semibold border rounded-lg transition ${
                      settings.language === "id"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Indonesia
                  </button>
                  <button
                    type="button"
                    id="lang-en-btn"
                    onClick={() => setSettings({ ...settings, language: "en" })}
                    className={`py-2 text-xs font-semibold border rounded-lg transition ${
                      settings.language === "en"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Ukuran Gambar (Aspect Ratio)
                </label>
                <div className="grid grid-cols-3 gap-1.5" id="aspect-ratio-toggle">
                  <button
                    type="button"
                    id="ar-9-16-btn"
                    onClick={() => setSettings({ ...settings, aspectRatio: "9:16" })}
                    className={`py-2 text-[11px] font-bold border rounded-lg transition ${
                      settings.aspectRatio === "9:16"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Potret / TikTok / Reels"
                  >
                    9:16 (Vertikal)
                  </button>
                  <button
                    type="button"
                    id="ar-16-9-btn"
                    onClick={() => setSettings({ ...settings, aspectRatio: "16:9" })}
                    className={`py-2 text-[11px] font-bold border rounded-lg transition ${
                      settings.aspectRatio === "16:9"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Lanskap / YouTube"
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    id="ar-1-1-btn"
                    onClick={() => setSettings({ ...settings, aspectRatio: "1:1" })}
                    className={`py-2 text-[11px] font-bold border rounded-lg transition ${
                      settings.aspectRatio === "1:1"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Kotak / Feed Instagram"
                  >
                    1:1
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Details Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Detail Tambahan / Unique Selling Point (USP)</label>
              <textarea
                id="custom-details-input"
                rows={3}
                placeholder="Tuliskan formula khusus, kelebihan produk, warna kemasan mencolok, atau adegan tertentu yang diinginkan..."
                value={settings.customDetails}
                onChange={(e) =>
                  setSettings({ ...settings, customDetails: e.target.value })
                }
                className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-slate-50/50 resize-none leading-relaxed"
              />
            </div>

            {/* Responsive Image Uploaders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploader
                id="model-image-uploader"
                label="Foto Wajah Model (Referensi)"
                description="Gunakan foto wajah yang jelas. AI akan mengunci struktur fisik model ini untuk konsistensi scene."
                selectedImage={settings.modelImage}
                onImageSelected={(base64) =>
                  setSettings({ ...settings, modelImage: base64 })
                }
              />

              <ImageUploader
                id="product-image-uploader"
                label="Foto Produk"
                description="AI akan mendeteksi logo, kemasan, warna, serta detail fisik produk untuk disisipkan ke visual prompt."
                selectedImage={settings.productImage}
                onImageSelected={(base64) =>
                  setSettings({ ...settings, productImage: base64 })
                }
              />
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">Error:</span> {error}
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              id="generate-script-btn"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-850 text-white active:scale-99"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  Memproses Kampanye Iklan...
                </>
              ) : (
                <>
                  <Clapperboard className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                  Generate Skrip & Visual Prompt
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Output Dashboard (7 cols on large screens) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Loading Pipeline State */}
          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="relative flex items-center justify-center">
                {/* Dynamic rotating glowing outer border */}
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
              </div>
              <div className="flex flex-col gap-1.5 max-w-md">
                <h3 className="text-sm font-bold text-slate-900">
                  Merancang Storyboard AI Anda
                </h3>
                <p className="text-xs text-indigo-600 font-mono font-medium animate-pulse">
                  {loadingStep}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Kami menggunakan model <span className="font-bold">Gemini-3.5-Flash</span> untuk menganalisis parameter fisik model, detail visual produk, menyinkronkan ritme pacing ucapan, dan merancang prompt visual sinematik.
                </p>
              </div>
            </div>
          )}

          {/* Neutral Empty State */}
          {!isLoading && !result && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-6 min-h-[500px]" id="empty-state">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                <Video className="w-7 h-7 text-indigo-500" />
              </div>
              
              <div className="max-w-md flex flex-col gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Belum Ada Skrip yang Dihasilkan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan parameter kampanye Anda di panel kiri, unggah foto wajah model jika ingin menjaga konsistensi wajah, lalu tekan tombol <span className="font-semibold text-indigo-600">Generate</span>.
                </p>
              </div>

              {/* Steps guideline workflow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg border-t border-slate-100 pt-6">
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-extrabold text-indigo-700 mb-2">1</span>
                  <p className="text-[11px] font-bold text-slate-800">Tentukan Produk</p>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Isi nama, target, dan detail USP produk.</p>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-extrabold text-indigo-700 mb-2">2</span>
                  <p className="text-[11px] font-bold text-slate-800">Kunci Model & Kemasan</p>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Unggah foto wajah & foto produk asli.</p>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-extrabold text-indigo-700 mb-2">3</span>
                  <p className="text-[11px] font-bold text-slate-800">Simulasi & Salin</p>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Simulasikan ucapan & salin prompt AI.</p>
                </div>
              </div>
            </div>
          )}

          {/* Render Result Screen */}
          {!isLoading && result && (
            <div className="flex flex-col gap-6 animate-fadeIn" id="generator-output-results">
              {/* Header result */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Hasil Generator Skrip Iklan
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan hasil di bawah ini untuk input pada generator AI video (Runway, Kling, Sora, dll)
                  </p>
                </div>
              </div>

              {/* Storyboard Simulator panel */}
              <StoryboardSimulator
                scenes={result.scenes}
                modelDescription={result.modelDescription}
                language={settings.language}
              />
            </div>
          )}
        </section>
      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">
            &copy; 2026 Creative Studio AI. Hak Cipta Dilindungi.
          </p>
          <p className="flex items-center gap-1 font-medium">
            Dibuat untuk <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> Produksi Iklan Video Kreatif & Konsisten
          </p>
        </div>
      </footer>
    </div>
  );
}
