import React, { useState, useEffect, useRef } from "react";
import { Scene } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Clapperboard,
  Clock,
  Video,
  User,
  ExternalLink,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";

interface StoryboardSimulatorProps {
  scenes: Scene[];
  modelDescription: string;
  language: string;
}

export default function StoryboardSimulator({
  scenes,
  modelDescription,
  language,
}: StoryboardSimulatorProps) {
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const activeScene = scenes[activeSceneIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop playback when active scene changes
  useEffect(() => {
    stopPlayback();
  }, [activeSceneIndex]);

  // Handle countdown and sync
  useEffect(() => {
    if (isPlaying && activeScene) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeScene.duration) {
            stopPlayback();
            // Automatically queue next scene if available
            if (activeSceneIndex < scenes.length - 1) {
              setTimeout(() => {
                setActiveSceneIndex((idx) => idx + 1);
                setIsPlaying(true);
              }, 1000);
            }
            return activeScene.duration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, activeSceneIndex, activeScene]);

  const speakText = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "id-ID";

    // Adjust rate to try to match the scene's actual duration
    const wordsCount = text.split(/\s+/).length;
    const targetSeconds = activeScene.duration;
    // Standard Indonesian speech speed is about 2.5 words per sec.
    const standardSec = wordsCount / 2.5;
    const computedRate = standardSec / targetSeconds;
    // Clamp between 0.75 and 1.8 for audibility
    utterance.rate = Math.max(0.75, Math.min(1.8, computedRate));

    window.speechSynthesis.speak(utterance);
  };

  const startPlayback = () => {
    if (currentTime >= activeScene.duration) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
    speakText(activeScene.voiceover);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Helper to highlight subtitles over time
  const getSubtitlesWord = () => {
    if (!activeScene) return "";
    const words = activeScene.voiceover.split(" ");
    const totalWords = words.length;
    const progress = currentTime / activeScene.duration;
    const currentWordIndex = Math.min(
      Math.floor(progress * totalWords),
      totalWords - 1
    );

    return words.map((word, idx) => (
      <span
        key={idx}
        className={`transition-all duration-150 inline-block mr-1.5 ${
          idx <= currentWordIndex
            ? "text-white font-semibold scale-105"
            : "text-slate-400 font-light"
        }`}
      >
        {word}
      </span>
    ));
  };

  // Get dynamic scene bg simulation based on the text characteristics and scene number
  const getSimulatedVisualBg = (sceneNum: number) => {
    const gradients = [
      "from-slate-900 via-indigo-950 to-slate-900",
      "from-slate-900 via-violet-950 to-slate-900",
      "from-slate-900 via-emerald-950 to-slate-900",
    ];
    return gradients[(sceneNum - 1) % gradients.length];
  };

  return (
    <div className="flex flex-col gap-6" id="storyboard-simulator-container">
      {/* Locked Model Physical Description Banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-indigo-900">
          <User className="w-4.5 h-4.5 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Ciri Fisik Model Utama (Terkunci)
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {modelDescription || "Model ideal deskripsi otomatis"}
        </p>
        <div className="text-[10px] text-slate-400 italic">
          * Ciri fisik di atas telah dikunci secara konsisten pada ketiga visual prompt di bawah untuk menjaga stabilitas wajah model pada AI video generator.
        </div>
      </div>

      {/* Main Interactive Player Block */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Visual Monitor Canvas */}
        <div
          className={`relative h-64 bg-gradient-to-br ${getSimulatedVisualBg(
            activeScene.sceneNumber
          )} flex flex-col items-center justify-center p-6 text-center transition-all duration-500`}
        >
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-wide text-slate-300">
            <span className="bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-md">
              <Clapperboard className="w-3.5 h-3.5 text-indigo-400" /> SCENE {activeScene.sceneNumber}
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">
              <Clock className="w-3.5 h-3.5" /> {currentTime.toFixed(1)}s / {activeScene.duration}s
            </span>
          </div>

          {/* Dynamic Sim Ambient animation when playing */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -inset-[10px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl animate-pulse" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 origin-left" style={{ transform: `scaleX(${currentTime / activeScene.duration})` }} />
            </div>
          )}

          {/* Prompt Abstract View */}
          <div className="max-w-md flex flex-col items-center gap-3 z-10">
            <Video className={`w-8 h-8 ${isPlaying ? "text-emerald-400 animate-bounce" : "text-slate-500"}`} />
            <p className="text-[11px] uppercase font-mono tracking-widest text-indigo-300/90 font-bold">
              AI Video Generator Prompt Simulation
            </p>
            <p className="text-xs text-slate-300 line-clamp-3 italic px-4 leading-relaxed bg-black/35 py-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
              "{activeScene.prompt}"
            </p>
          </div>

          {/* Subtitles Area (Live speaking translation) */}
          <div className="absolute bottom-4 left-4 right-4 text-center px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/5 min-h-[50px] flex items-center justify-center z-10">
            <p className="text-sm leading-relaxed tracking-wide select-none">
              {currentTime > 0 ? getSubtitlesWord() : <span className="text-slate-500 font-light italic">Tekan Putar untuk menyinkronkan ucapan...</span>}
            </p>
          </div>
        </div>

        {/* Player Controls Dashboard */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                type="button"
                id="play-scene-btn"
                onClick={startPlayback}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" /> Putar Scene
              </button>
            ) : (
              <button
                type="button"
                id="pause-scene-btn"
                onClick={pausePlayback}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-650 active:scale-95 transition text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4 fill-white" /> Jeda
              </button>
            )}

            <button
              type="button"
              id="reset-scene-btn"
              onClick={stopPlayback}
              className="p-2 bg-slate-800 hover:bg-slate-750 active:scale-95 transition rounded-lg text-slate-300 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Voice toggle */}
            <button
              type="button"
              id="toggle-voice-btn"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition ${voiceEnabled ? "bg-indigo-950 text-indigo-400 hover:bg-indigo-900" : "bg-slate-800 text-slate-500 hover:text-slate-400"}`}
              title={voiceEnabled ? "Suara Aktif" : "Suara Senyap"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scene Selectors */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {scenes.map((sc, idx) => (
              <button
                key={sc.sceneNumber}
                type="button"
                id={`select-scene-${sc.sceneNumber}`}
                onClick={() => setActiveSceneIndex(idx)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  activeSceneIndex === idx
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Scene {sc.sceneNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Details Cards below the Interactive Player */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="scenes-grid-cards">
        {scenes.map((scene, idx) => {
          const promptKey = `p-${scene.sceneNumber}`;
          const voiceoverKey = `v-${scene.sceneNumber}`;
          const isCurrent = activeSceneIndex === idx;

          return (
            <div
              key={scene.sceneNumber}
              id={`scene-card-${scene.sceneNumber}`}
              onClick={() => setActiveSceneIndex(idx)}
              className={`border rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-300 relative group ${
                isCurrent
                  ? "border-indigo-500/80 bg-indigo-50/10 shadow-md scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Card Badge Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  isCurrent ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  SCENE {scene.sceneNumber}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {scene.duration} Detik
                </span>
              </div>

              {/* Teks Ucapan section */}
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  <span className="flex items-center gap-1">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-500" /> Teks Ucapan (VO)
                  </span>
                  <button
                    type="button"
                    id={`copy-voiceover-${scene.sceneNumber}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(scene.voiceover, voiceoverKey);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                    title="Salin Teks Ucapan"
                  >
                    {copiedStates[voiceoverKey] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/55 p-2.5 rounded-lg border border-slate-100">
                  "{scene.voiceover}"
                </p>
                <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                  {scene.voiceover.split(/\s+/).length} kata (~{(scene.voiceover.split(/\s+/).length / 2.7).toFixed(1)}s)
                </div>
              </div>

              {/* Prompt Visual section */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-indigo-500" /> Prompt AI (Visual)
                  </span>
                  <button
                    type="button"
                    id={`copy-prompt-${scene.sceneNumber}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(scene.prompt, promptKey);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                    title="Salin Prompt Visual"
                  >
                    {copiedStates[promptKey] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg border border-slate-800 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {scene.prompt}
                </p>
              </div>

              {/* Bottom focus indicator */}
              {isCurrent && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-600 rounded-t-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
