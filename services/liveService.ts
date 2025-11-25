import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

export class LiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Assuming process.env.API_KEY is configured as per other services
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(
    onTranscription: (text: string) => void,
    onError: (error: Error) => void,
    onClose: () => void
  ) {
    if (this.isConnected) return;

    try {
      // 1. Initialize Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      // 2. Get Microphone Stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      // 3. Establish Live Session
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], // Required by API
          inputAudioTranscription: {}, // Enable user speech transcription
          systemInstruction: "You are a precise dictation assistant. Transcribe the user's speech exactly as spoken. Do not generate conversational responses or audio output. If the user pauses, wait. Ignore non-speech sounds.",
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            this.isConnected = true;
            this.startAudioStreaming();
          },
          onmessage: (message: LiveServerMessage) => {
            // Handle Input Transcription (User's Voice)
            const transcription = message.serverContent?.inputTranscription?.text;
            if (transcription) {
              onTranscription(transcription);
            }
            
            // Note: We intentionally ignore message.serverContent.modelTurn 
            // because we want this to be a dictation tool, not a conversation.
          },
          onclose: () => {
            console.log("Gemini Live Session Closed");
            this.cleanup();
            onClose();
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            onError(new Error("Connection error"));
            this.cleanup();
          }
        }
      });

    } catch (error: any) {
      console.error("Failed to start live session:", error);
      onError(error);
      this.cleanup();
    }
  }

  private startAudioStreaming() {
    if (!this.audioContext || !this.stream || !this.session) return;

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    // Buffer size 4096 is standard for this type of processing
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isConnected) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      // Send audio chunk to Gemini
      this.session.sendRealtimeInput({ media: pcmBlob });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Convert float32 audio to int16 PCM
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

  disconnect() {
    if (this.session) {
      // Attempt to close session nicely, but don't await heavily
      try { this.session.close(); } catch (e) { /* ignore */ }
    }
    this.cleanup();
  }

  private cleanup() {
    this.isConnected = false;
    this.session = null;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const liveService = new LiveService();
