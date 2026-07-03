export interface Scene {
  sceneNumber: number;
  duration: number; // in seconds
  prompt: string; // visual prompt in English
  voiceover: string; // spoken script in selected language
}

export interface GenerationResponse {
  modelDescription: string;
  scenes: Scene[];
}

export interface CampaignSettings {
  productName: string;
  productCategory: string;
  targetAudience: string;
  tone: string;
  language: string;
  customDetails: string;
  aspectRatio: string; // e.g. "9:16", "16:9", "1:1"
  modelImage: string | null; // Base64 data URI
  productImage: string | null; // Base64 data URI
}
