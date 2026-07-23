import React, { useState } from 'react';
import { AspectRatio, ImageResolution } from '../types';
import { Image, Video, Music, Sparkles, RefreshCw, Upload, Download, Sliders, Wand2, Play, Pause, FileText } from 'lucide-react';

export const MediaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'music' | 'multimodal'>('image');

  // Image Gen State
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<'fast' | 'pro'>('fast');
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Video Gen State (Veo 3)
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Music Gen State (Lyria 3)
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicType, setMusicType] = useState<'clip' | 'full'>('clip');
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Multimodal File Analysis State
  const [multimodalPrompt, setMultimodalPrompt] = useState('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileMime, setUploadedFileMime] = useState<string>('image/png');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // File Upload Handlers
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultimodalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileMime(file.type || 'image/png');
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // API Triggers
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          quality,
          resolution,
          inputImageBase64
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        alert('Image generation error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to generate image: ' + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsGeneratingVideo(true);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio
        })
      });
      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      } else {
        alert('Video generation error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to generate video: ' + err.message);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          type: musicType,
          durationSeconds: musicType === 'clip' ? 15 : 60
        })
      });
      const data = await res.json();
      if (data.musicUrl) {
        setGeneratedMusicUrl(data.musicUrl);
      } else {
        alert('Music generation error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to generate music: ' + err.message);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleAnalyzeMultimodal = async () => {
    if (!uploadedFileBase64) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: multimodalPrompt,
          fileBase64: uploadedFileBase64,
          mimeType: uploadedFileMime
        })
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        alert('Analysis error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to analyze file: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="media-studio-view" className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      
      {/* Media Studio Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
              <span>Multimodal AI Media Studio</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create & edit images with aspect ratios (1K-4K), generate Veo 3 videos, compose Lyria 3 music tracks, or analyze photo/audio/video files.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'image' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Image Creation</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'video' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Veo 3 Video</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'music' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Lyria 3 Music</span>
            </button>

            <button
              onClick={() => setActiveTab('multimodal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'multimodal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Image Studio */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-pink-400" />
              <span>Image Creation & Editing (Gemini 3.1 / 3 Pro)</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt</label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image to generate or edit (e.g. 'Futuristic cybernetic assistant orb floating in neon city')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Quality Model Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuality('fast')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                  quality === 'fast'
                    ? 'bg-pink-600/20 border-pink-500/50 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">Fast Generation</div>
                <div className="text-[10px] text-slate-400">gemini-3.1-flash-image-preview</div>
              </button>

              <button
                type="button"
                onClick={() => setQuality('pro')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                  quality === 'pro'
                    ? 'bg-purple-600/20 border-purple-500/50 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">Studio Quality</div>
                <div className="text-[10px] text-slate-400">gemini-3-pro-image-preview</div>
              </button>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2', '21:9'] as AspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                      aspectRatio === ar
                        ? 'bg-pink-600 text-white border-pink-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector (1K, 2K, 4K) */}
            {quality === 'pro' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Output Resolution</label>
                <div className="flex space-x-2">
                  {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        resolution === res
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image-to-Image Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source Image for Editing (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700"
              />
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg"
            >
              {isGeneratingImage ? 'Generating Image...' : 'Generate Image'}
            </button>
          </div>

          {/* Image Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            {generatedImageUrl ? (
              <div className="space-y-4 w-full text-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated AI Art"
                  className="max-h-[450px] mx-auto rounded-2xl shadow-2xl border border-slate-800 object-contain"
                />
                <a
                  href={generatedImageUrl}
                  download="trillion_artwork.png"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Image className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs">Your generated AI image will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Veo 3 Video */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <span>Veo 3 Video Generation (veo-3.1-fast-generate-preview)</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt</label>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe the video animation (e.g. 'Cinematic drone shot over glowing futuristic cyberpunk city')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Aspect Ratio</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('16:9')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    videoAspectRatio === '16:9' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('9:16')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    videoAspectRatio === '9:16' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoPrompt.trim()}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg"
            >
              {isGeneratingVideo ? 'Rendering Veo Video...' : 'Generate Veo Video'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            {generatedVideoUrl ? (
              <div className="space-y-4 w-full text-center">
                <video controls src={generatedVideoUrl} className="max-h-[450px] mx-auto rounded-2xl shadow-2xl border border-slate-800" />
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Video className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs">Your Veo 3 video will render here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Lyria 3 Music */}
      {activeTab === 'music' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Music className="w-5 h-5 text-purple-400" />
              <span>Lyria 3 Music Generation</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Music Prompt & Style</label>
              <textarea
                rows={3}
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="Describe music mood (e.g. 'Chill lo-fi synthwave beat with soft electric piano')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setMusicType('clip')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  musicType === 'clip' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Short Clip (lyria-3-clip-preview)
              </button>
              <button
                type="button"
                onClick={() => setMusicType('full')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  musicType === 'full' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Full Track (lyria-3-pro-preview)
              </button>
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || !musicPrompt.trim()}
              className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg"
            >
              {isGeneratingMusic ? 'Synthesizing Composition...' : 'Generate Lyria Track'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            {generatedMusicUrl ? (
              <div className="space-y-4 w-full text-center">
                <Music className="w-16 h-16 mx-auto text-purple-400 animate-bounce" />
                <audio controls src={generatedMusicUrl} className="w-full" />
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Music className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs">Your generated Lyria audio track will play here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: File Analyzer */}
      {activeTab === 'multimodal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Multimodal Content Analyzer (Gemini 3.1 Pro)</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Photo, Audio, or Video</label>
              <input
                type="file"
                accept="image/*,audio/*,video/*"
                onChange={handleMultimodalFileUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-300 hover:file:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Analysis Query / Prompt</label>
              <input
                type="text"
                value={multimodalPrompt}
                onChange={(e) => setMultimodalPrompt(e.target.value)}
                placeholder="What should Gemini analyze or transcribe?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAnalyzeMultimodal}
              disabled={isAnalyzing || !uploadedFileBase64}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg"
            >
              {isAnalyzing ? 'Analyzing File...' : 'Analyze with Gemini 3.1 Pro'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
            {analysisResult ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Analysis Insights:</h3>
                <div className="text-xs text-slate-200 bg-slate-950 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <FileText className="w-12 h-12 text-slate-600" />
                <p className="text-xs">Upload a file and click analyze to extract insights.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
