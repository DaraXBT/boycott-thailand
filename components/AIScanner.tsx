
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, AlertTriangle, CheckCircle, Sparkles, Bot } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Button, Card } from './ui';
import { useLanguage } from '../contexts/LanguageContext';

interface AIResult {
  brandName: string;
  isThai: boolean;
  recommendation: 'Boycott' | 'Support Local' | 'Check further';
  reasonEn: string;
  reasonKm: string;
}

const AIScanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t, lang } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    setIsCameraActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                text: `You are a shopping assistant for a "Boycott Thailand" campaign in Cambodia. 
                Identify the brand or product in the image. 
                Determine if it is Thai-owned, based in Thailand, has a Thai CEO, or is a Thai franchise.
                Be very concise.
                Return ONLY a JSON object:
                {
                  "brandName": "...",
                  "isThai": boolean,
                  "recommendation": "Boycott" | "Support Local" | "Check further",
                  "reasonEn": "Short explanation in English (max 15 words). Mention Thai CEO or Origin if relevant.",
                  "reasonKm": "Short explanation in Khmer (max 15 words). Mention Thai CEO or Origin if relevant."
                }`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              isThai: { type: Type.BOOLEAN },
              recommendation: { type: Type.STRING },
              reasonEn: { type: Type.STRING },
              reasonKm: { type: Type.STRING },
            },
            required: ["brandName", "isThai", "recommendation", "reasonEn", "reasonKm"]
          }
        },
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data as AIResult);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setError("Failed to analyze image. Please try again with a clearer photo.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg overflow-hidden rounded-3xl border-border shadow-2xl bg-background flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{t('aiScannerTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('aiScannerDesc')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {!image && !isCameraActive && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <Camera className="w-7 h-7 text-slate-500 group-hover:text-indigo-600" />
                </div>
                <span className="font-bold text-sm text-slate-600 dark:text-slate-300">{t('aiCapture')}</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <Upload className="w-7 h-7 text-slate-500 group-hover:text-emerald-600" />
                </div>
                <span className="font-bold text-sm text-slate-600 dark:text-slate-300">{t('aiUpload')}</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}

          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                <Button 
                  onClick={stopCamera} 
                  variant="outline" 
                  className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={capturePhoto} 
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 w-16 h-16 p-0 shadow-xl"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}

          {image && !result && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-md aspect-[4/3]">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={resetScanner}
                  className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <Button 
                onClick={runAnalysis} 
                disabled={isScanning}
                className="w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('aiScanning')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('aiIdentifyBtn')}
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center gap-4 ${
                 result.recommendation === 'Boycott' 
                 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' 
                 : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
               }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    result.recommendation === 'Boycott' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-600' 
                    : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600'
                  }`}>
                    {result.recommendation === 'Boycott' ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{result.brandName}</p>
                    <h3 className="text-2xl font-black">{result.recommendation === 'Boycott' ? t('aiRecommendationBoycott') : t('aiRecommendationSupport')}</h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm w-full">
                     <p className="text-sm font-medium leading-relaxed">
                       {lang === 'km' ? result.reasonKm : result.reasonEn}
                     </p>
                  </div>
               </div>

               <Button 
                onClick={resetScanner} 
                variant="outline"
                className="w-full h-12 rounded-xl text-sm font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
               >
                 <RotateCcwIcon className="w-4 h-4 mr-2" /> {t('aiReset')}
               </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </Card>
    </div>
  );
};

const RotateCcwIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

export default AIScanner;
