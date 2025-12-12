
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { generateSpeech } from '../../../../../services/geminiService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Animated Visualizer Component
const WaveformIcon = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-[2px] ${className}`}>
      <style>{`
        @keyframes waveform {
            0%, 100% { height: 20%; }
            50% { height: 100%; }
        }
      `}</style>
      {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-[2.5px] bg-current rounded-full"
            style={{ 
                height: '40%',
                animation: 'waveform 0.6s ease-in-out infinite', 
                animationDelay: `${i * 0.1}s` 
            }} 
          />
      ))}
  </div>
);

export const ReadAloudTool: React.FC = () => {
  const { content } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Check content presence for disabled state using innerText to respect visibility
  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = (tempDiv.innerText || '').trim();
    setHasContent(text.length > 0);
  }, [content]);

  // Decode helper for Gemini PCM (24kHz, 1 channel)
  const decodeAudioData = (
      data: Uint8Array,
      ctx: AudioContext
  ): AudioBuffer => {
      const pcmData = new Int16Array(data.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
      }
      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.copyToChannel(float32Data, 0);
      return buffer;
  };

  const stopAudio = () => {
      if (sourceRef.current) {
          try { sourceRef.current.stop(); } catch (e) {}
          sourceRef.current = null;
      }
      setIsPlaying(false);
  };

  const handleReadAloud = async () => {
    if (isPlaying) {
        stopAudio();
        return;
    }
    
    if (isLoading) return;

    // Get text to read
    let textToRead = "";
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
        textToRead = selection.toString();
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        textToRead = tempDiv.innerText || "";
    }
    
    textToRead = textToRead.trim();
    if (!textToRead) return;

    setIsLoading(true);
    
    try {
        const audioData = await generateSpeech(textToRead);
        
        if (audioData) {
             if (!audioContextRef.current) {
                 audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
             }
             
             if (audioContextRef.current.state === 'suspended') {
                 await audioContextRef.current.resume();
             }

             const buffer = decodeAudioData(audioData, audioContextRef.current);
             
             // Create source
             const source = audioContextRef.current.createBufferSource();
             source.buffer = buffer;
             source.connect(audioContextRef.current.destination);
             
             source.onended = () => {
                 setIsPlaying(false);
                 sourceRef.current = null;
             };
             
             sourceRef.current = source;
             source.start();
             setIsPlaying(true);
        } else {
            alert("Could not generate speech. Please check your API key.");
        }
    } catch (e) {
        console.error(e);
        alert("Error generating speech.");
    } finally {
        setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          stopAudio();
          if (audioContextRef.current) {
              audioContextRef.current.close();
          }
      };
  }, []);

  let Icon = Volume2;
  // Use LoadingSpinner component instead of Loader2 icon
  const SpinnerIcon = (props: any) => <LoadingSpinner {...props} className="w-4 h-4" />;

  if (isLoading) Icon = SpinnerIcon;
  else if (isPlaying) Icon = WaveformIcon;
  else if (isPlaying) Icon = Square; // Fallback

  return (
    <RibbonButton 
        icon={Icon} 
        label={isLoading ? "Generating..." : isPlaying ? "Stop" : "Read Aloud"} 
        onClick={handleReadAloud} 
        disabled={!hasContent && !isPlaying}
        className={isPlaying || isLoading ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border-indigo-200" : ""}
        iconClassName={!isPlaying && !isLoading ? "text-cyan-500" : ""}
        title={!hasContent ? "No content to read" : isPlaying ? "Stop Reading" : "Read document aloud with Gemini AI"}
    />
  );
};
