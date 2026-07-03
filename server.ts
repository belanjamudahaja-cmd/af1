import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Set high limit for JSON body parsing to handle base64 images
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ limit: "30mb", extended: true }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Helper to parse Base64 Data URI
  function parseDataUri(dataUri: string) {
    const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) return null;
    return {
      mimeType: matches[1],
      base64Data: matches[2],
    };
  }

  // API endpoint for script generation
  app.post("/api/generate", async (req, res) => {
    try {
      const {
        modelImage,
        productImage,
        productName,
        productCategory = "Umum",
        targetAudience = "Semua kalangan",
        tone = "soft-elegant",
        language = "id",
        customDetails = "",
        aspectRatio = "9:16",
      } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "Nama produk wajib diisi." });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY belum dikonfigurasi di server. Silakan hubungi admin.",
        });
      }

      const contents: any[] = [];
      const parts: any[] = [];

      // 1. Handle Model Image
      if (modelImage) {
        const parsedModel = parseDataUri(modelImage);
        if (parsedModel) {
          parts.push({
            text: "Berikut adalah gambar referensi wajah model utama yang HARUS Anda kunci ciri fisiknya (warna rambut, gaya rambut, etnis, bentuk wajah, ekspresi, warna mata, dll) agar konsisten di semua scene:",
          });
          parts.push({
            inlineData: {
              mimeType: parsedModel.mimeType,
              data: parsedModel.base64Data,
            },
          });
        }
      }

      // 2. Handle Product Image
      if (productImage) {
        const parsedProduct = parseDataUri(productImage);
        if (parsedProduct) {
          parts.push({
            text: `Berikut adalah gambar produk asli yang bernama "${productName}". Analisis desain kemasan, warna, logo, dan bentuknya agar Anda dapat mendeskripsikan produk ini secara akurat di dalam visual prompt scene:`,
          });
          parts.push({
            inlineData: {
              mimeType: parsedProduct.mimeType,
              data: parsedProduct.base64Data,
            },
          });
        }
      }

      // Tone explanation map for AI
      const toneExplanations: Record<string, string> = {
        "soft-elegant": "Suasana tenang, sinematik, estetis, warna pastel atau hangat, transisi halus, cocok untuk skincare/luxury.",
        "energetic-bold": "Musik up-beat, kamera bergerak dinamis, ekspresi ceria, warna kontras tinggi, gaya modern, cocok untuk gadget/olahraga/makanan.",
        "informative-scientific": "Fokus pada kegunaan, visualisasi data atau demonstrasi produk, gaya profesional, penjelasan ramah, cocok untuk kesehatan/suplemen.",
        "problem-solving": "Menyoroti rasa frustrasi masalah di awal, lalu kelegaan setelah menggunakan produk sebagai pahlawan solusi, akting ekspresif.",
        "funny-quirky": "Gaya santai, penuh humor, tak terduga, menyenangkan, membuat penonton tersenyum.",
        "podcast": "Gaya obrolan podcast santai namun persuasif, intim, menggunakan mikrofon profesional di depan model, pencahayaan studio hangat, seperti potongan video klip podcast viral/edukatif.",
      };

      // Text instructions
      const promptText = `
Nama Produk: ${productName}
Kategori Produk: ${productCategory}
Target Audiens: ${targetAudience}
Gaya/Tone Iklan: ${tone} (${toneExplanations[tone] || ""})
Bahasa Teks Ucapan (Voiceover/Subtitle): ${language === "en" ? "English" : "Bahasa Indonesia"}
Ukuran Gambar / Aspect Ratio Visual: ${aspectRatio}
Detail Tambahan Khusus: ${customDetails || "Tidak ada detail tambahan"}

---
TUGAS UTAMA ANDA:
1. Buat deskripsi fisik model utama secara mendetail dan singkat di bagian 'modelDescription'. Deskripsi ini harus menangkap ciri fisik khas dari gambar referensi wajah yang disediakan (jika ada), atau menciptakan deskripsi model ideal yang sangat spesifik jika tidak ada gambar referensi.
2. Buat skrip iklan 3-Scene dengan konsistensi penuh.
3. Hanya boleh ada 1 model utama di seluruh scene.
4. Integrasikan produk "${productName}" dan nama merek secara natural dan eksplisit di dalam prompt visual dan teks ucapan.
5. Durasi visual per scene WAJIB diatur default 10 detik (Total 30 detik untuk 3 scene).
6. Tuliskan teks ucapan (voiceover) untuk masing-masing scene agar memiliki jumlah kata yang pas untuk dibaca dalam waktu tepat 10 detik (sekitar 25 hingga 30 kata per scene, asumsikan kecepatan bicara santai 2.5 hingga 3 kata per detik). Pastikan teks ucapan pas dan alami untuk dibaca selama 10 detik penuh.
7. Buat PROMPT VISUAL (AI Prompt) dalam BAHASA INGGRIS yang sangat detail untuk generator AI Image/Video (seperti Midjourney atau Runway). Sertakan kata kunci sinematik (seperti: "cinematic lighting", "photorealistic", "8k resolution", "extreme close-up", "camera pan", dll), ciri model yang dikunci, serta penempatan produk. Anda WAJIB menambahkan parameter ukuran gambar "${aspectRatio}" atau "--ar ${aspectRatio}" di bagian paling akhir setiap prompt visual agar sesuai dengan format resolusi yang diminta pengguna.

HASILKAN DALAM FORMAT JSON YANG SESUAI DENGAN SCHEMA BERIKUT.
`;

      parts.push({ text: promptText });
      contents.push({ parts });

      // Call Gemini API with structured JSON output schema
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "Anda adalah asisten AI khusus pembuat skrip dan prompt video iklan profesional yang presisi dan kreatif.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              modelDescription: {
                type: Type.STRING,
                description: "Detailed, objective, concise physical description of the model (e.g., hair style, hair color, skin tone, approximate age, facial features) to be kept consistent.",
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    duration: {
                      type: Type.INTEGER,
                      description: "Estimated duration of the scene in seconds, calculated correctly from word count (word count / 2.7). Minimum 3 seconds, maximum 15 seconds.",
                    },
                    prompt: {
                      type: Type.STRING,
                      description: "High-quality, highly descriptive visual prompt for AI video/image generators, written in English. Must include physical features of the model, specific natural interaction with the product, lighting, camera movement, and background environment.",
                    },
                    voiceover: {
                      type: Type.STRING,
                      description: "The spoken voiceover or subtitles text for this scene, in the selected language. It must be highly engaging and strictly synchronized to fit the calculated duration.",
                    },
                  },
                  required: ["sceneNumber", "duration", "prompt", "voiceover"],
                },
              },
            },
            required: ["modelDescription", "scenes"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini did not return any text content.");
      }

      const data = JSON.parse(responseText.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Error generating script:", error);
      res.status(500).json({
        error: error.message || "Terjadi kesalahan internal saat menghasilkan skrip iklan.",
      });
    }
  });

  // Serve frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
