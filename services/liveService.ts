
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

export class LiveService {
  private client: GoogleGenAI | null = null;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Client initialized lazily in connect()
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      // Prioritize localStorage key if user set it in settings, else env var
      const localKey = localStorage.getItem('gemini_api_key');
      const apiKey = localKey || process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key is missing. Please check your environment configuration or settings.");
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  async connect(
    onTranscription: (text: string) => void,
    onError: (error: Error) => void,
    onClose: () => void
  ) {
    if (this.isConnected) return;

    try {
      const client = this.getClient();

      // 1. Get Microphone Stream FIRST
      // This ensures we have mic permission and hardware before spinning up AudioContext/Gemini Session
      // Using relaxed constraints (audio: true) to avoid OverconstrainedError on devices that don't natively support 16kHz
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true, 
      });

      // 2. Initialize Audio Context with target sample rate
      // Modern browsers will resample the stream to match this context automatically
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      // 3. Initialize Gemini Session
      this.session = await client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], // Audio response is required by API, but we will ignore it
          inputAudioTranscription: {}, // Enable transcription of user input
          systemInstruction: "You are a precise dictation assistant. Your only task is to transcribe the user's speech exactly. Do not reply, do not chat, and do not generate audio output.",
        },
        callbacks: {
          onopen: () => {
            console.log("Dictation Session Opened");
            this.isConnected = true;
            // Start streaming only after session is ready
            this.startAudioStreaming();
          },
          onmessage: (message: LiveServerMessage) => {
            // We only care about the input transcription (what the user said)
            const transcript = message.serverContent?.inputTranscription?.text;
            if (transcript) {
              onTranscription(transcript);
            }
          },
          onclose: () => {
            console.log("Dictation Session Closed");
            this.cleanup();
            onClose();
          },
          onerror: (err) => {
            console.error("Dictation Session Error:", err);
            this.cleanup();
            onError(new Error("Connection error"));
          }
        }
      });

    } catch (error: any) {
      console.error("Failed to start dictation:", error);
      this.cleanup();
      
      // Improve error message for common issues
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
         onError(new Error("Microphone permission denied. Please allow microphone access in your browser settings."));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
         onError(new Error("No microphone found. Please check your system audio settings and permissions."));
      } else if (error.name === 'OverconstrainedError') {
         onError(new Error("Microphone hardware constraints not met."));
      } else if (error.name === 'NotSupportedError') {
         onError(new Error("Audio sample rate not supported by this browser."));
      } else {
         onError(error);
      }
    }
  }

  private startAudioStreaming() {
    if (!this.audioContext || !this.stream || !this.session) return;

    try {
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
          if (!this.isConnected || !this.session) return;
          
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = this.createBlob(inputData);
          
          // Ensure session is ready before sending
          this.session.sendRealtimeInput({ media: pcmBlob });
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
    } catch (e) {
        console.error("Error starting audio stream:", e);
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        console.warn("Error closing session:", e);
      }
    }
    this.cleanup();
  }

  private cleanup() {
    this.isConnected = false;
    this.session = null;

    if (this.processor) {
      try {
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
      } catch (e) {}
      this.processor = null;
    }

    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }

    if (this.stream) {
      try {
        this.stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.stream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
      data: this.base64EncodeInt16(int16),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private base64EncodeInt16(int16: Int16Array): string {
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export const liveService = new LiveService();
